Types::RegistrationPolicyBucketInputType = GraphQL::InputObjectType.define do
  name 'RegistrationPolicyBucketInput'

  input_field :key, !types.String
  input_field :name, types.String
  input_field :description, types.String
  input_field :minimum_slots, types.Int
  input_field :preferred_slots, types.Int
  input_field :total_slots, types.Int
  input_field :slots_limited, types.Boolean
  input_field :anything, types.Boolean
  input_field :not_counted, types.Boolean
  input_field :expose_attendees, types.Boolean
end
