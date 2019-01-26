# Read about factories at https://github.com/thoughtbot/factory_bot

FactoryBot.define do
  factory :convention do
    name { 'TestCon' }
    sequence(:domain) { |n| "testcon#{n}.example.com" }
    timezone_name { 'US/Eastern' }
    show_schedule { 'yes' }
    accepting_proposals { false }
    updated_by { nil }
    maximum_event_signups do
      ScheduledValue::ScheduledValue.new(
        timespans: [
          {
            start: nil,
            finish: nil,
            value: 'unlimited'
          }
        ]
      )
    end
    starts_at { Time.new(2016, 10, 28, 18, 0, 0) }
    ends_at { Time.new(2016, 10, 30, 18, 0, 0) }
    stripe_publishable_key { "pk_test_#{Devise.friendly_token}" }
    stripe_secret_key { "sk_test_#{Devise.friendly_token}" }

    after(:build) do |convention|
      convention.user_con_profile_form ||= convention.build_user_con_profile_form
    end
  end
end
