import { useState } from 'react';
import * as React from 'react';
import Modal from 'react-bootstrap4-modal';
import { ApolloError } from '@apollo/client';

import { UserConProfileAdminQuery } from './queries';
import ErrorDisplay from '../ErrorDisplay';
import EventSelect, { DefaultEventSelectOptionType } from '../BuiltInFormControls/EventSelect';
import ProvidableTicketTypeSelection from '../EventsApp/TeamMemberAdmin/ProvidableTicketTypeSelection';
import TicketingStatusDescription from '../EventsApp/TeamMemberAdmin/TicketingStatusDescription';
import useAsyncFunction from '../useAsyncFunction';
import LoadingIndicator from '../LoadingIndicator';
import {
  useConvertToEventProvidedTicketQueryQuery,
  UserConProfileAdminQueryQuery,
} from './queries.generated';
import { useConvertTicketToEventProvidedMutation } from './mutations.generated';
import { DefaultEventsQueryQuery } from '../BuiltInFormControls/selectDefaultQueries.generated';

type EventSpecificSectionProps = {
  event: {
    id: number;
  };
  userConProfile: any; // TODO get more specific once TicketingStatusDescription is converted
  convention: any; // TODO ditto
  ticketTypeId?: number;
  setTicketTypeId: React.Dispatch<number>;
  disabled?: boolean;
};

function EventSpecificSection({
  event,
  userConProfile,
  convention,
  ticketTypeId,
  setTicketTypeId,
  disabled,
}: EventSpecificSectionProps) {
  const { data, loading, error } = useConvertToEventProvidedTicketQueryQuery({
    variables: { eventId: event.id },
  });

  if (loading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorDisplay graphQLError={error} />;
  }

  return (
    <>
      <p className="mt-4">
        <TicketingStatusDescription userConProfile={userConProfile} convention={convention} />
      </p>

      <ProvidableTicketTypeSelection
        event={data!.event}
        convention={data!.convention!}
        value={ticketTypeId}
        onChange={setTicketTypeId}
        disabled={disabled}
      />
    </>
  );
}

export type ConvertToEventProvidedTicketModalProps = {
  convention: {
    ticket_name: string;
  };
  userConProfile: {
    id: number;
    name?: string | null;
  };
  visible: boolean;
  onClose: () => void;
};
type EventType = NonNullable<
  DefaultEventsQueryQuery['convention']
>['events_paginated']['entries'][0];

function ConvertToEventProvidedTicketModal({
  convention,
  userConProfile,
  visible,
  onClose,
}: ConvertToEventProvidedTicketModalProps) {
  const [event, setEvent] = useState<EventType>();
  const [ticketTypeId, setTicketTypeId] = useState<number>();
  const [convertMutate] = useConvertTicketToEventProvidedMutation();
  const [convertTicketToEventProvided, error, inProgress] = useAsyncFunction(convertMutate);

  const convertClicked = async () => {
    if (event == null || ticketTypeId == null) {
      return;
    }

    await convertTicketToEventProvided({
      variables: {
        eventId: event.id,
        ticketTypeId,
        userConProfileId: userConProfile.id,
      },
      update: (cache, result) => {
        const cachedData = cache.readQuery<UserConProfileAdminQueryQuery>({
          query: UserConProfileAdminQuery,
          variables: { id: userConProfile.id },
        });

        cache.writeQuery({
          query: UserConProfileAdminQuery,
          variables: { id: userConProfile.id },
          data: {
            ...cachedData,
            userConProfile: {
              ...cachedData?.userConProfile,
              ticket: result.data?.convertTicketToEventProvided?.ticket,
            },
          },
        });
      },
    });
    onClose();
  };

  return (
    <Modal visible={visible}>
      <div className="modal-header">
        {'Convert '}
        {userConProfile.name}
        {"'s "}
        {convention.ticket_name}
        {' to event-provided'}
      </div>

      <div className="modal-body">
        <p>
          {'This will delete '}
          {userConProfile.name}
          ’s
          {' existing '}
          {convention.ticket_name}
          {
            ' and create a new one for them, provided by an event.  If they paid for their existing '
          }
          {convention.ticket_name}, that payment will be refunded.
        </p>

        <EventSelect
          value={event}
          onChange={(value: DefaultEventSelectOptionType) => {
            setEvent(value);
            setTicketTypeId(undefined);
          }}
          placeholder="Select event..."
          disabled={inProgress}
        />

        {event && (
          <EventSpecificSection
            event={event}
            userConProfile={userConProfile}
            convention={convention}
            ticketTypeId={ticketTypeId}
            setTicketTypeId={setTicketTypeId}
            disabled={inProgress}
          />
        )}

        <ErrorDisplay graphQLError={error as ApolloError} />
      </div>

      <div className="modal-footer">
        <button type="button" onClick={onClose} className="btn btn-secondary" disabled={inProgress}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={inProgress || !event || !ticketTypeId}
          onClick={convertClicked}
        >
          {'Convert '}
          {convention.ticket_name}
        </button>
      </div>
    </Modal>
  );
}

export default ConvertToEventProvidedTicketModal;
