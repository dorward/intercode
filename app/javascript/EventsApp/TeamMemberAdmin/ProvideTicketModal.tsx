import { useCallback, useState } from 'react';
// @ts-ignore
import { capitalize, pluralize } from 'inflected';
import Modal from 'react-bootstrap4-modal';
import { ApolloError } from '@apollo/client';
import { useTranslation } from 'react-i18next';

import ErrorDisplay from '../../ErrorDisplay';
import { getProvidableTicketTypes } from './ProvideTicketUtils';
import ProvidableTicketTypeSelection from './ProvidableTicketTypeSelection';
import { TeamMembersQuery } from './queries';
import TicketingStatusDescription from './TicketingStatusDescription';
import useAsyncFunction from '../../useAsyncFunction';
import { TeamMembersQueryQuery, TeamMembersQueryQueryVariables } from './queries.generated';
import { useProvideEventTicketMutation } from './mutations.generated';

export type ProvideTicketModalProps = {
  event: TeamMembersQueryQuery['event'];
  convention: NonNullable<TeamMembersQueryQuery['convention']>;
  onClose: () => void;
  teamMember?: TeamMembersQueryQuery['event']['team_members'][0];
  visible: boolean;
};

function ProvideTicketModal({
  event,
  convention,
  onClose,
  teamMember,
  visible,
}: ProvideTicketModalProps) {
  const { t } = useTranslation();
  const [ticketTypeId, setTicketTypeId] = useState<number>();
  const [provideTicketMutate] = useProvideEventTicketMutation();
  const [provideTicketAsync, error, mutationInProgress] = useAsyncFunction(provideTicketMutate);

  const provideTicket = useCallback(
    (args) =>
      provideTicketAsync({
        ...args,
        update: (store, result) => {
          const data = store.readQuery<TeamMembersQueryQuery, TeamMembersQueryQueryVariables>({
            query: TeamMembersQuery,
            variables: { eventId: event.id },
          });
          const ticket = result.data?.provideEventTicket?.ticket;

          store.writeQuery({
            query: TeamMembersQuery,
            variables: { eventId: event.id },
            data: {
              ...data,
              event: {
                ...data?.event,
                provided_tickets: [...(data?.event?.provided_tickets ?? []), ticket],
                team_members: data?.event.team_members.map((tm) => {
                  if (tm.id !== teamMember?.id) {
                    return tm;
                  }

                  return {
                    ...tm,
                    user_con_profile: {
                      ...tm.user_con_profile,
                      ticket,
                    },
                  };
                }),
              },
            },
          });
        },
      }),
    [event, provideTicketAsync, teamMember],
  );

  const provideTicketClicked = async () => {
    await provideTicket({
      variables: {
        eventId: event.id,
        userConProfileId: teamMember?.user_con_profile.id,
        ticketTypeId,
      },
    });
    onClose();
  };

  if (getProvidableTicketTypes(convention).length < 1) {
    return null;
  }

  return (
    <Modal visible={visible}>
      <div className="modal-header">{capitalize(pluralize(convention.ticket_name))}</div>

      <div className="modal-body">
        {teamMember ? (
          <>
            <p>
              <TicketingStatusDescription
                userConProfile={teamMember.user_con_profile}
                convention={convention}
              />
            </p>

            {teamMember && !teamMember.user_con_profile.ticket ? (
              <ProvidableTicketTypeSelection
                event={event}
                convention={convention}
                value={ticketTypeId}
                onChange={setTicketTypeId}
                disabled={mutationInProgress}
              />
            ) : null}
          </>
        ) : null}

        <ErrorDisplay graphQLError={error as ApolloError} />
      </div>

      <div className="modal-footer">
        {teamMember && teamMember.user_con_profile.ticket ? (
          <button type="button" className="btn btn-primary" onClick={onClose}>
            {t('buttons.ok', 'OK')}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={mutationInProgress}
            >
              {t('buttons.cancel', 'Cancel')}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={ticketTypeId == null || mutationInProgress}
              onClick={provideTicketClicked}
            >
              {t('events.teamMemberAdmin.provideTicketButton', 'Provide {{ ticketName }}', {
                ticketName: convention.ticket_name,
              })}
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

export default ProvideTicketModal;
