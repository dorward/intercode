Types::ConventionType = GraphQL::ObjectType.define do
  name "Convention"
  field :accepting_proposals, types.Boolean
  field :precon_bids_allowed, types.Boolean
  field :created_at, Types::DateType
  field :updated_at, Types::DateType
  field :starts_at, Types::DateType
  field :ends_at, Types::DateType
  field :name, types.String
  field :domain, types.String
  field :timezone_name, types.String
  field :registrations_frozen, types.Boolean
  field :show_schedule, Types::ShowScheduleType
  field :maximum_tickets, types.Int

  field :away_blocks, types[Types::AwayBlockType]
  field :rooms, types[Types::RoomType]
  field :maximum_event_signups, Types::ScheduledValueType
  field :ticket_types, types[Types::TicketTypeType]

  field :user_con_profiles, Types::UserConProfile.connection_type, max_page_size: 1000
end
