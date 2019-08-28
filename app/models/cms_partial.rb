class CmsPartial < ApplicationRecord
  include Cadmus::Partial
  include Concerns::CmsReferences

  has_and_belongs_to_many :pages
  before_commit :set_performance_metadata, on: [:create, :update]

  cadmus_partial

  private

  def set_performance_metadata
    self.invariant = template_invariant?(parent&.cms_variables&.pluck(:key) || [])
  end
end