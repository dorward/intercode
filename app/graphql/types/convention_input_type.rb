Types::ConventionInputType = GraphQL::InputObjectType.define do
  name 'ConventionInput'
  input_field :accepting_proposals, types.Boolean
  input_field :starts_at, Types::DateType
  input_field :ends_at, Types::DateType
  input_field :name, types.String
  input_field :domain, types.String
  input_field :event_mailing_list_domain, types.String
  input_field :timezone_name, types.String
  input_field :show_schedule, Types::ShowScheduleType
  input_field :maximum_tickets, types.Int
  input_field :ticket_name, types.String
  input_field :root_page_id, types.Int
  input_field :default_layout_id, types.Int
  input_field :stripe_publishable_key, types.String
  input_field :stripe_secret_key, types.String

  input_field :maximum_event_signups, Types::ScheduledValueInputType
end
