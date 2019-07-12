class RunPolicy < ApplicationPolicy
  include Concerns::ScheduleRelease

  delegate :event, to: :record
  delegate :convention, to: :event

  def read?
    return true if oauth_scoped_disjunction do |d|
      d.add(:read_events) do
        convention.site_mode == 'single_event' ||
        has_schedule_release_permissions?(convention, convention.show_schedule)
      end
    end

    super
  end

  def signup_summary?
    return false if event.private_signup_list?
    SignupPolicy.new(user, Signup.new(run: record)).read?
  end

  def manage?
    return true if oauth_scoped_disjunction do |d|
      d.add(:manage_events) { has_privilege_in_convention?(convention, :gm_liaison, :scheduling) }
    end

    super
  end

  class Scope < Scope
    include Concerns::ScheduleRelease

    def resolve
      return scope.none unless oauth_scope?(:read_events)
      return scope.all if site_admin?

      disjunctive_where do |dw|
        dw.add(
          event: Event.where(
            convention: conventions_with_schedule_release_permissions(:show_schedule)
          )
        )

        dw.add(
          event: Event.where(
            convention: Convention.where(site_mode: 'single_event')
          )
        )
      end
    end
  end
end