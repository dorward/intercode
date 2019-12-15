class EventSignupMailer < ApplicationMailer
  def new_signup(signup)
    notification_template_mail(
      signup.event.convention,
      'signups/new_signup',
      { 'signup' => signup },
      from: from_address_for_convention(signup.event.convention),
      to: emails_for_team_members(team_members_to_notify_for_signup(signup))
    )
  end

  def withdrawal(signup, prev_state, prev_bucket_key, move_results)
    if prev_bucket_key
      prev_bucket = signup.event.registration_policy.bucket_with_key(prev_bucket_key)
    end

    notification_template_mail(
      signup.event.convention,
      'signups/withdrawal',
      {
        'signup' => signup,
        'prev_state' => prev_state,
        'prev_bucket' => prev_bucket,
        'move_results' => move_results.map do |move_result|
          move_result.is_a?(Hash) ? SignupMoveResult.from_h(move_result) : move_result
        end
      },
      from: from_address_for_convention(signup.event.convention),
      to: emails_for_team_members(team_members_to_notify_for_signup(signup))
    )
  end

  def registration_policy_change_moved_signups(event, move_results, whodunit)
    move_results = move_results.map { |hash| SignupMoveResult.from_h(hash) }

    signups_by_id = Signup.where(id: move_results.map(&:signup_id)).includes(:run).index_by(&:id)
    move_results_by_run = move_results.group_by do |move_result|
      signups_by_id[move_result.signup_id].run
    end

    notification_template_mail(
      event.convention,
      'signups/registration_policy_change_moved_signups',
      {
        'event' => event,
        'whodunit' => whodunit,
        'move_results_by_run_id' => move_results_by_run.transform_keys(&:id),
        'runs' => move_results_by_run.keys.sort_by(&:starts_at)
      },
      from: from_address_for_convention(event.convention),
      to: emails_for_team_members(team_members_to_notify_for_move_results(event, move_results))
    )
  end

  def user_signup_moved(move_result)
    move_result = SignupMoveResult.from_h(move_result) if move_result.is_a?(Hash)
    signup = move_result.signup

    notification_template_mail(
      signup.event.convention,
      'signups/user_signup_moved',
      {
        'signup' => signup,
        'move_result' => move_result
      },
      from: from_address_for_convention(signup.event.convention),
      to: signup.user_con_profile.email
    )
  end

  private

  def team_members_to_notify_for_signup(signup)
    signup.event.team_members.select do |team_member|
      team_member.receive_signup_email != 'no' &&
        !(team_member.receive_signup_email == 'non_waitlist_signups' && signup.waitlisted?)
    end
  end

  def team_members_to_notify_for_move_results(event, move_results)
    no_confirmed_moves = move_results.none? do |move_result|
      move_result.prev_state == 'confirmed' || move_result.state == 'confirmed'
    end

    event.team_members.select do |team_member|
      team_member.receive_signup_email != 'no' &&
        !(team_member.receive_signup_email == 'non_waitlist_signups' && no_confirmed_moves)
    end
  end
end
