import gql from 'graphql-tag';

const fragments = {};

fragments.ticketType = gql`
fragment TicketTypeAdmin_TicketTypeFields on TicketType {
  id
  name
  description
  publicly_available
  counts_towards_convention_maximum
  allows_event_signups
  maximum_event_provided_tickets

  pricing_schedule {
    timespans {
      start
      finish
      value {
        fractional
        currency_code
      }
    }
  }
}
`;

export const ticketTypesQuery = gql`
query TicketTypesAdminTicketTypesQuery {
  convention {
    id
    ticket_types {
      ...TicketTypeAdmin_TicketTypeFields
    }

    ticket_name
    timezone_name
  }
}

${fragments.ticketType}
`;

export { fragments };
