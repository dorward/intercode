Types::ConventionType = GraphQL::ObjectType.define do
  name 'Convention'
  field :accepting_proposals, types.Boolean
  field :created_at, Types::DateType
  field :updated_at, Types::DateType
  field :starts_at, Types::DateType
  field :ends_at, Types::DateType
  field :name, types.String
  field :domain, types.String
  field :timezone_name, types.String
  field :show_schedule, Types::ShowScheduleType
  field :maximum_tickets, types.Int
  field :maximum_event_signups, Types::ScheduledValueType
  field :ticket_name, !types.String
  field :user_con_profile_form, !Types::FormType
  field :event_proposal_form, !Types::FormType
  field :regular_event_form, !Types::FormType
  field :volunteer_event_form, !Types::FormType
  field :filler_event_form, !Types::FormType

  field :privilege_names, !types[!types.String] do
    resolve -> (_convention, _args, _ctx) do
      ['site_admin'] + UserConProfile::PRIV_NAMES.to_a
    end
  end

  field :mail_privilege_names, !types[!types.String] do
    resolve -> (_convention, _args, _ctx) do
      UserConProfile::MAIL_PRIV_NAMES
    end
  end

  field :cms_layouts, types[Types::CmsLayoutType] do
    resolve -> (convention, _args, _ctx) {
      AssociationLoader.for(Convention, :cms_layouts).load(convention)
    }
  end

  field :default_layout, Types::CmsLayoutType do
    resolve -> (convention, _args, _ctx) {
      AssociationLoader.for(Convention, :default_layout).load(convention)
    }
  end

  field :cms_navigation_items, types[Types::CmsNavigationItemType] do
    resolve -> (convention, _args, _ctx) {
      AssociationLoader.for(Convention, :cms_navigation_items).load(convention)
    }
  end

  field :pages, types[Types::PageType] do
    resolve -> (convention, _args, _ctx) {
      AssociationLoader.for(Convention, :pages).load(convention)
    }
  end

  field :rooms, types[Types::RoomType] do
    guard ->(convention, _args, ctx) do
      ctx[:current_ability].can?(:read, Room.new(convention: convention))
    end

    resolve -> (convention, _args, _ctx) {
      AssociationLoader.for(Convention, :rooms).load(convention)
    }
  end

  field :root_page, Types::PageType do
    resolve -> (convention, _args, _ctx) {
      AssociationLoader.for(Convention, :root_page).load(convention)
    }
  end

  field :staff_positions, types[Types::StaffPositionType] do
    guard ->(convention, _args, ctx) do
      ctx[:current_ability].can?(:read, StaffPosition.new(convention: convention))
    end

    resolve ->(convention, _args, _ctx) {
      AssociationLoader.for(Convention, :staff_positions).load(convention)
    }
  end

  field :ticket_types, types[Types::TicketTypeType] do
    guard ->(convention, _args, ctx) do
      ctx[:current_ability].can?(:read, TicketType.new(convention: convention))
    end

    resolve ->(convention, _args, _ctx) {
      AssociationLoader.for(Convention, :ticket_types).load(convention)
    }
  end

  field :products, types[Types::ProductType] do
    resolve ->(convention, _args, _ctx) do
      AssociationLoader.for(Convention, :products).load(convention)
    end
  end

  connection :orders, Types::OrdersConnectionType, max_page_size: 1000 do
    guard ->(convention, _args, ctx) do
      ctx[:current_ability].can?(
        :read,
        Order.new(user_con_profile: UserConProfile.new(convention: convention))
      )
    end

    resolve ->(convention, _args, _ctx) do
      convention.orders.where.not(status: 'pending')
        .includes(order_entries: [:product, :product_variant])
    end
  end

  field :orders_paginated, !Types::OrdersPaginationType do
    argument :page, types.Int
    argument :per_page, types.Int
    argument :filters, Types::OrderFiltersInputType
    argument :sort, types[Types::SortInputType]

    guard ->(convention, _args, ctx) do
      ctx[:current_ability].can?(
        :read,
        Order.new(user_con_profile: UserConProfile.new(convention: convention))
      )
    end

    resolve ->(convention, args, _ctx) do
      scope = convention.orders.where.not(status: 'pending')
        .includes(order_entries: [:product, :product_variant])

      Tables::OrdersTableResultsPresenter.new(scope, args[:filters].to_h, args[:sort])
        .paginate(page: args[:page], per_page: args[:per_page])
    end
  end

  field :user_con_profiles_paginated, !Types::UserConProfilesPaginationType do
    argument :page, types.Int
    argument :per_page, types.Int
    argument :filters, Types::UserConProfileFiltersInputType
    argument :sort, types[Types::SortInputType]

    guard ->(convention, _args, ctx) do
      ctx[:current_ability].can?(:read, UserConProfile.new(convention: convention))
    end

    resolve ->(convention, args, ctx) do
      Tables::UserConProfilesTableResultsPresenter.for_convention(
        convention,
        ctx[:current_ability],
        args[:filters].to_h,
        args[:sort]
      ).paginate(page: args[:page], per_page: args[:per_page])
    end
  end
end
