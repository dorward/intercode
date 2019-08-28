class EventWithdrawService < CivilService::Service
  class Result < CivilService::Result
    attr_accessor :move_results, :prev_bucket_key, :prev_state
  end
  self.result_class = Result

  attr_reader :signup, :whodunit, :suppress_notifications, :allow_non_self_service_signups
  delegate :run, to: :signup
  delegate :event, to: :run
  delegate :convention, to: :event

  include Concerns::SkippableAdvisoryLock
  include Concerns::ConventionRegistrationFreeze

  def initialize(
    signup, whodunit,
    skip_locking: false, suppress_notifications: false
  )
    @signup = signup
    @whodunit = whodunit
    @skip_locking = skip_locking
    @suppress_notifications = suppress_notifications
  end

  private

  def inner_call
    prev_state = signup.state
    prev_bucket_key = signup.bucket_key
    move_results = nil

    with_advisory_lock_unless_skip_locking("run_#{run.id}_signups") do
      signup.update!(state: 'withdrawn', updated_by: whodunit)

      move_results = if signup.counted? && prev_state == 'confirmed'
        vacancy_fill_result = EventVacancyFillService.new(
          run,
          prev_bucket_key,
          skip_locking: true
        ).call
        return failure(vacancy_fill_result.error) if vacancy_fill_result.failure?
        vacancy_fill_result.move_results
      else
        []
      end
    end

    notify_team_members(signup, prev_state, prev_bucket_key, move_results)
    success(prev_state: prev_state, prev_bucket_key: prev_bucket_key, move_results: move_results)
  end

  def notify_team_members(signup, prev_state, prev_bucket_key, move_results)
    return if suppress_notifications

    event.team_members.find_each do |team_member|
      next if team_member.receive_signup_email == 'no'
      next if team_member.receive_signup_email == 'non_waitlist_signups' && prev_state == 'waitlisted'

      # Wait 30 seconds because the transaction hasn't been committed yet
      EventSignupMailer.withdrawal(
        signup,
        prev_state,
        prev_bucket_key,
        move_results.map(&:to_h),
        team_member
      ).deliver_later(wait: 30.seconds)
    end
  end
end