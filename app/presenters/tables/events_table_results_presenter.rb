class Tables::EventsTableResultsPresenter < Tables::TableResultsPresenter
  def self.for_convention(convention:, ability:, filters: {}, sort: nil, visible_field_ids: nil)
    scope = convention.events.where(status: 'active').accessible_by(ability)
    new(
      base_scope: scope,
      convention: convention,
      ability: ability,
      filters: filters,
      sort: sort,
      visible_field_ids: visible_field_ids
    )
  end

  attr_reader :ability, :convention

  def initialize(base_scope:, convention:, ability:, filters: {}, sort: nil, visible_field_ids: nil)
    super(base_scope, filters, sort, visible_field_ids)
    @convention = convention
    @ability = ability
  end

  def fields
    []
  end

  private

  def apply_filter(scope, filter, value)
    case filter
    when :category
      value.present? ? scope.where(category: value) : scope
    when :title
      Concerns::Names.string_search(scope, value, ['title'])
    else
      scope
    end
  end

  def expand_scope_for_sort(scope, sort_field)
    case sort_field
    when :first_scheduled_run_start
      ability.authorize!(:schedule, convention)
      scope.joins(<<~SQL)
        LEFT JOIN runs ON (
          runs.event_id = events.id AND
          runs.starts_at = (
            SELECT MIN(runs.starts_at) FROM runs WHERE runs.event_id = events.id
          )
        )
      SQL
    when :owner
      scope.joins(:owner)
    else
      scope
    end
  end

  def sql_order_for_sort_field(sort_field, direction)
    case sort_field
    when :first_scheduled_run_start
      "runs.starts_at #{direction}"
    when :title
      if ActiveRecord::Base.connection.is_a?(ActiveRecord::ConnectionAdapters::PostgreSQLAdapter)
        Arel.sql(<<~SQL)
          regexp_replace(
            regexp_replace(events.title, '^(the|a|) +', '', 'i'),
            '\\W',
            ''
          ) #{direction}
        SQL
      else
        super
      end
    when :owner
      "user_con_profiles.last_name #{direction}, user_con_profiles.first_name #{direction}"
    else
      super
    end
  end
end
