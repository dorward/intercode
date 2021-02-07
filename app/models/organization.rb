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
class Organization < ApplicationRecord
  has_many :conventions, dependent: :nullify
  has_many :organization_roles, dependent: :destroy

  def to_liquid
    OrganizationDrop.new(self)
  end
end
