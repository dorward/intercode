class Event < ApplicationRecord
  include Concerns::FormResponse
  include Concerns::EventEmail

  STATUSES = Set.new(%w[active dropped])
  CON_MAIL_DESTINATIONS = Set.new(%w[event_email gms])

  register_form_response_attrs :title,
    :author,
    :email,
    :event_email,
    :team_mailing_list_name,
    :organization,
    :url,
    :length_seconds,
    :can_play_concurrently,
    :con_mail_destination,
    :description,
    :short_blurb,
    :registration_policy,
    :participant_communications,
    :age_restrictions,
    :content_warnings

  # Most events belong to the user who proposes it.  Some (like ConSuite or
  # Ops) are owned by the department head
  belongs_to :owner, class_name: 'User', optional: true

  # LARPs have GMs and Panels have Panelists
  has_many :team_members, dependent: :destroy

  # The user who last updated the event.  Used for tracking
  belongs_to :updated_by, class_name: 'User', optional: true

  belongs_to :convention
  belongs_to :event_category

  has_many :maximum_event_provided_tickets_overrides, dependent: :destroy
  has_many :provided_tickets,
    class_name: 'Ticket',
    inverse_of: 'provided_by_event',
    foreign_key: 'provided_by_event_id'

  # Status specifies the status of the event.  It must be one of
  # "active" or "dropped".
  validates :status, inclusion: { in: STATUSES }

  validates :con_mail_destination, inclusion: { in: CON_MAIL_DESTINATIONS }

  # All events for a Convention must have a unique title.  Ignore any events
  # that have a status of "Dropped".  If they have a duplicate title we don't
  # care.
  validates_uniqueness_of :title,
    scope: :convention,
    conditions: -> { where.not(status: 'dropped') }

  # The event's registration policy must also be valid.
  validate :validate_registration_policy

  # Single-run events have to have no more than one run
  validate :single_run_events_must_have_no_more_than_one_run, unless: :bypass_single_event_run_check

  # Making it slightly harder to change the registration policy unless you really know what
  # you're doing
  validate :registration_policy_cannot_change, unless: :allow_registration_policy_change

  validate :event_category_must_be_from_same_convention

  # Runs specify how many instances of this event there are on the schedule.
  # An event may have 0 or more runs.
  has_many :runs, dependent: :destroy

  has_one :event_proposal, required: false

  after_commit :sync_team_mailing_list, on: [:create, :update]

  STATUSES.each do |status|
    scope status, -> { where(status: status) }
  end

  scope :regular, -> { where(event_category_id: EventCategory.where(scheduling_ui: 'regular').select(:id)) }

  serialize :registration_policy, ActiveModelCoder.new('RegistrationPolicy')

  attr_accessor :bypass_single_event_run_check, :allow_registration_policy_change

  def self.normalize_title_for_sort(title)
    return '' unless title
    title.gsub(/\A(the|a|) /i, '').gsub(/\W/, '')
  end

  def self.title_sort(events)
    events.sort_by { |event| normalize_title_for_sort(event.title) }
  end

  def to_param
    "#{id}-#{title.parameterize}"
  end

  def to_liquid
    EventDrop.new(self)
  end

  def form
    event_category.event_form
  end

  private

  def validate_registration_policy
    return unless registration_policy
    return if registration_policy.valid?

    registration_policy.errors.each do |attribute, error|
      errors.add "registration_policy.#{attribute}", error
    end
  end

  def single_run_events_must_have_no_more_than_one_run
    return unless event_category.single_run? && status == 'active'
    return if runs.size <= 1

    errors.add(:base, "#{category_obj.key.humanize} events must have no more than one run")
  end

  def registration_policy_cannot_change
    return if new_record?
    return unless registration_policy_changed?

    before, after = changes['registration_policy']
    return if before == after # ActiveRecord is being overzealous about change detection

    errors.add :registration_policy, "cannot be changed via ActiveRecord on an existing event.  \
Use EventChangeRegistrationPolicyService instead."
  end

  def event_category_must_be_from_same_convention
    return if convention == event_category.convention

    errors.add :event_category, "is from #{event_category.convention.name} but this event is in \
#{convention.name}"
  end

  def sync_team_mailing_list
    return unless SyncTeamMailingListService.mailgun
    SyncTeamMailingListJob.perform_later(self)
  end
end