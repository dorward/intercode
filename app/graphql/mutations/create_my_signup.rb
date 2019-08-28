class Mutations::CreateMySignup < Mutations::BaseMutation
  field :signup, Types::SignupType, null: false

  argument :run_id, Int, required: true, camelize: false
  argument :requested_bucket_key, String, required: false, camelize: false
  argument :no_requested_bucket, Boolean, required: false, camelize: false

  attr_reader :run

  def authorized?(args)
    @run = convention.runs.find(args[:run_id])
    policy(Signup.new(user_con_profile: user_con_profile, run: run)).create?
  end

  def resolve(**args)
    should_have_requested_bucket_key = args[:no_requested_bucket].blank?
    if should_have_requested_bucket_key && !args[:requested_bucket_key]
      raise BetterRescueMiddleware::UnloggedError,
        'Bad request: signups must either request a bucket or specify that no bucket is requested.'
    end

    result = EventSignupService.new(
      context[:user_con_profile],
      run,
      should_have_requested_bucket_key ? args[:requested_bucket_key] : nil,
      context[:current_user]
    ).call

    if result.failure?
      raise BetterRescueMiddleware::UnloggedError, result.errors.full_messages.join(', ')
    end

    { signup: result.signup }
  end
end