module Mutations
  class CreateEventCategory < GraphQL::Schema::RelayClassicMutation
    field :event_category, Types::EventCategoryType, null: false, camelize: false

    argument :event_category, Types::EventCategoryInputType, required: true, camelize: false

    def resolve(event_category:)
      event_category_model = context[:convention].event_categories.create!(event_category.to_h)
      { event_category: event_category_model }
    end
  end
end
