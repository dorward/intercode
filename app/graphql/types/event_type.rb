Types::EventType = GraphQL::ObjectType.define do
  name 'Event'

  field :id, !types.Int
  field :form_response_attrs_json, types.String do
    resolve -> (obj, _args, ctx) do
      FormResponsePresenter.new(
        ctx[:convention].form_for_event_category(obj.category),
        obj
      ).as_json.to_json
    end
  end

  field :title, types.String
  field :author, types.String
  field :email, types.String
  field :organization, types.String
  field :category, types.String
  field :url, types.String
  field :participant_communications, types.String
  field :age_restrictions, types.String
  field :content_warnings, types.String
  field :length_seconds, types.Int
  field :can_play_concurrently, types.Boolean
  field :con_mail_destination, types.String
  field :description, types.String
  field :short_blurb, types.String
  field :status, types.String
  field :created_at, Types::DateType

  field :runs, !types[!Types::RunType] do
    guard -> (event, _args, ctx) do
      ctx[:current_ability].can?(:read, Run.new(event: event))
    end
    resolve -> (obj, _args, _ctx) do
      AssociationLoader.for(Event, :runs).load(obj)
    end
  end
  field :run, !Types::RunType do
    argument :id, !types.Int
    guard -> (event, args, ctx) do
      ctx[:current_ability].can?(:read, event.runs.find(args[:id]))
    end
    resolve -> (event, args, _ctx) do
      event.runs.find(args[:id])
    end
  end
  field :team_members, !types[!Types::TeamMemberType] do
    resolve -> (obj, _args, _ctx) {
      AssociationLoader.for(Event, :team_members).load(obj)
    }
  end
  field :team_member_name, !types.String
  field :provided_tickets, !types[!Types::TicketType] do
    guard -> (event, _args, ctx) do
      ctx[:current_ability].can?(
        :read,
        Ticket.new(
          user_con_profile: UserConProfile.new(convention: ctx[:convention]),
          provided_by_event: event
        )
      )
    end
  end
  field :can_provide_tickets, !types.Boolean, property: :can_provide_tickets?
  override_type = Types::MaximumEventProvidedTicketsOverrideType
  field :maximum_event_provided_tickets_overrides, !types[!override_type] do
    resolve -> (obj, _args, _ctx) {
      AssociationLoader.for(Event, :maximum_event_provided_tickets_overrides).load(obj)
    }
  end

  field :registration_policy, Types::RegistrationPolicyType

  field :slots_limited, types.Boolean do
    resolve -> (obj, _args, _ctx) {
      obj.registration_policy.slots_limited?
    }
  end

  field :total_slots, types.Int do
    resolve -> (obj, _args, _ctx) {
      obj.registration_policy.total_slots
    }
  end

  field :short_blurb_html, types.String do
    resolve ->(obj, _args, _ctx) {
      MarkdownPresenter.new('No blurb provided').render obj.short_blurb
    }
  end

  field :description_html, types.String do
    resolve ->(obj, _args, _ctx) {
      MarkdownPresenter.new('No description provided').render obj.description
    }
  end

  field :event_page_url, types.String do
    resolve ->(obj, _args, _ctx) {
      Rails.application.routes.url_helpers.event_path(obj)
    }
  end

  field :admin_notes, types.String do
    guard -> (obj, _args, ctx) do
      ctx[:current_ability].can?(:read_admin_notes, obj)
    end
  end
end
