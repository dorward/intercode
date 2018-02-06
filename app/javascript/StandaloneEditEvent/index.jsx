import React from 'react';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import EditEvent from '../BuiltInForms/EditEvent';
import GraphQLResultPropType from '../GraphQLResultPropType';
import GraphQLQueryResultWrapper from '../GraphQLQueryResultWrapper';

const ticketTypeFragment = gql`
fragment StandaloneEditEvent_TicketTypeFields on TicketType {
  id
  description
  maximum_event_provided_tickets
}
`;

const maximumEventProvidedTicketsOverrideFragment = gql`
fragment StandaloneEditEvent_MaximumEventProvidedTicketsOverrideFields on MaximumEventProvidedTicketsOverride {
  ticket_type {
    ...StandaloneEditEvent_TicketTypeFields
  }

  id
  override_value
}

${ticketTypeFragment}
`;

const eventFragment = gql`
fragment StandaloneEditEvent_EventFields on Event {
  id
  title
  author
  description
  organization
  url
  con_mail_destination
  can_play_concurrently
  short_blurb
  participant_communications
  age_restrictions
  content_warnings
  email
  length_seconds
  category
  status
  description_html

  registration_policy {
    buckets {
      key
      name
      description
      minimum_slots
      preferred_slots
      total_slots
      slots_limited
      anything
    }
  }

  maximum_event_provided_tickets_overrides {
    ...StandaloneEditEvent_MaximumEventProvidedTicketsOverrideFields
  }
}

${maximumEventProvidedTicketsOverrideFragment}
`;

const eventQuery = gql`
query($eventId: Int!) {
  current_user_con_profile {
    ability {
      can_override_maximum_event_provided_tickets
    }
  }

  convention {
    ticket_types {
      ...StandaloneEditEvent_TicketTypeFields
    }
  }

  event(id: $eventId) {
    ...StandaloneEditEvent_EventFields
  }
}

${eventFragment}
`;

export const dropEventMutation = gql`
mutation($input: DropEventInput!) {
  dropEvent(input: $input) {
    event {
      id
      status
    }
  }
}
`;

export const updateEventMutation = gql`
mutation($input: UpdateEventInput!) {
  updateEvent(input: $input) {
    event {
      ...StandaloneEditEvent_EventFields
    }
  }
}

${eventFragment}
`;

export const createMaximumEventProvidedTicketsOverrideMutation = gql`
mutation($input: CreateMaximumEventProvidedTicketsOverrideInput!) {
  createMaximumEventProvidedTicketsOverride(input: $input) {
    maximum_event_provided_tickets_override {
      ...StandaloneEditEvent_MaximumEventProvidedTicketsOverrideFields
    }
  }
}

${maximumEventProvidedTicketsOverrideFragment}
`;

export const deleteMaximumEventProvidedTicketsOverrideMutation = gql`
mutation($input: DeleteMaximumEventProvidedTicketsOverrideInput!) {
  deleteMaximumEventProvidedTicketsOverride(input: $input) {
    maximum_event_provided_tickets_override {
      ...StandaloneEditEvent_MaximumEventProvidedTicketsOverrideFields
    }
  }
}

${maximumEventProvidedTicketsOverrideFragment}
`;

export const updateMaximumEventProvidedTicketsOverrideMutation = gql`
mutation($input: UpdateMaximumEventProvidedTicketsOverrideInput!) {
  updateMaximumEventProvidedTicketsOverride(input: $input) {
    maximum_event_provided_tickets_override {
      ...StandaloneEditEvent_MaximumEventProvidedTicketsOverrideFields
    }
  }
}

${maximumEventProvidedTicketsOverrideFragment}
`;

@compose(
  graphql(eventQuery),
  graphql(updateEventMutation, { name: 'updateEvent' }),
  graphql(dropEventMutation, { name: 'dropEvent' }),
  graphql(createMaximumEventProvidedTicketsOverrideMutation, {
    props({ mutate }) {
      return {
        createMaximumEventProvidedTicketsOverride({ eventId, ticketTypeId, overrideValue }) {
          return mutate({
            variables: {
              input: {
                event_id: eventId,
                ticket_type_id: ticketTypeId,
                override_value: overrideValue,
              },
            },

            update: (store, {
              data: {
                createMaximumEventProvidedTicketsOverride: {
                  maximum_event_provided_tickets_override: override,
                },
              },
            }) => {
              const data = store.readQuery({ query: eventQuery, variables: { eventId } });
              data.event.maximum_event_provided_tickets_overrides.push(override);
              store.writeQuery({ query: eventQuery, variables: { eventId }, data });
            },
          });
        },
      };
    },
  }),
  graphql(updateMaximumEventProvidedTicketsOverrideMutation, {
    props({ mutate }) {
      return {
        updateMaximumEventProvidedTicketsOverride({ id, overrideValue }) {
          return mutate({
            variables: {
              input: {
                id,
                override_value: overrideValue,
              },
            },
          });
        },
      };
    },
  }),
  graphql(deleteMaximumEventProvidedTicketsOverrideMutation, {
    props({ ownProps, mutate }) {
      return {
        deleteMaximumEventProvidedTicketsOverride(id) {
          return mutate({
            variables: {
              input: {
                id,
              },
            },

            update: (store) => {
              const data = store.readQuery({
                query: eventQuery,
                variables: { eventId: ownProps.eventId },
              });
              const newOverrides = data.event.maximum_event_provided_tickets_overrides
                .filter(override => override.id !== id);
              data.event.maximum_event_provided_tickets_overrides = newOverrides;
              store.writeQuery({
                query: eventQuery,
                variables: {
                  eventId: ownProps.eventId,
                },
                data,
              });
            },
          });
        },
      };
    },
  }),
)
@GraphQLQueryResultWrapper
class StandaloneEditEvent extends React.Component {
  static propTypes = {
    eventId: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
    showDropButton: PropTypes.bool.isRequired,
    data: GraphQLResultPropType(eventQuery).isRequired,
    updateEvent: PropTypes.func.isRequired,
    dropEvent: PropTypes.func.isRequired,
    createMaximumEventProvidedTicketsOverride: PropTypes.func.isRequired,
    updateMaximumEventProvidedTicketsOverride: PropTypes.func.isRequired,
    deleteMaximumEventProvidedTicketsOverride: PropTypes.func.isRequired,
  };

  render = () => {
    const {
      data,
      updateEvent,
      dropEvent,
      showDropButton,
      createMaximumEventProvidedTicketsOverride,
      deleteMaximumEventProvidedTicketsOverride,
      updateMaximumEventProvidedTicketsOverride,
    } = this.props;

    return (
      <EditEvent
        event={data.event}
        onSave={() => { window.location.href = `/events/${data.event.id}`; }}
        onDrop={() => { window.location.href = '/events'; }}
        updateEvent={updateEvent}
        dropEvent={dropEvent}
        createMaximumEventProvidedTicketsOverride={createMaximumEventProvidedTicketsOverride}
        deleteMaximumEventProvidedTicketsOverride={deleteMaximumEventProvidedTicketsOverride}
        updateMaximumEventProvidedTicketsOverride={updateMaximumEventProvidedTicketsOverride}
        showDropButton={showDropButton}
        canOverrideMaximumEventProvidedTickets={
          data.current_user_con_profile.ability.can_override_maximum_event_provided_tickets
        }
        ticketTypes={data.convention.ticket_types}
      />
    );
  }
}

export default StandaloneEditEvent;
