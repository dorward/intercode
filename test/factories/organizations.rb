# rubocop:disable Metrics/LineLength, Lint/RedundantCopDisableDirective
# == Schema Information
#
# Table name: organizations
#
#  id         :bigint           not null, primary key
#  name       :text
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# rubocop:enable Metrics/LineLength, Lint/RedundantCopDisableDirective
FactoryBot.define do
  factory :organization do
    sequence(:name) { |n| "Organization #{n}" }
  end
end
