import { TeamMembersQueryQuery } from './queries.generated';

type ConventionType = Pick<NonNullable<TeamMembersQueryQuery['convention']>, 'ticket_types'>;
type EventType = {
  provided_tickets: Pick<TeamMembersQueryQuery['event']['provided_tickets'][0], 'ticket_type'>[];
};

export function getProvidableTicketTypes(convention: ConventionType) {
  return convention.ticket_types.filter(
    (ticketType) => ticketType.maximum_event_provided_tickets > 0,
  );
}

export function getProvidedTicketCountByType(
  convention: ConventionType,
  event: EventType,
): { [ticketTypeId: number]: number } {
  return Object.assign(
    {},
    ...getProvidableTicketTypes(convention).map((ticketType) => ({
      [ticketType.id]: event.provided_tickets.filter(
        (ticket) => ticket.ticket_type.id === ticketType.id,
      ).length,
    })),
  );
}

export function getRemainingTicketCountByType(
  convention: ConventionType,
  event: EventType,
): { [ticketTypeId: number]: number } {
  const providableTicketTypes = getProvidableTicketTypes(convention);
  const providedTicketCountsByType = getProvidedTicketCountByType(convention, event);

  return Object.assign(
    {},
    ...Object.entries(providedTicketCountsByType).map(([ticketTypeId, providedCount]) => {
      const ticketType = providableTicketTypes.find((tt) => tt.id.toString() === ticketTypeId);
      if (!ticketType) {
        return {};
      }
      return {
        [ticketTypeId]: ticketType.maximum_event_provided_tickets - providedCount,
      };
    }),
  );
}
