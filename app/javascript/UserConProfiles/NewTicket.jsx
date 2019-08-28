import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import { CreateTicket } from './mutations.gql';
import ErrorDisplay from '../ErrorDisplay';
import TicketForm from './TicketForm';
import { UserConProfileAdminQuery } from './queries.gql';
import useMutationCallback from '../useMutationCallback';
import useQuerySuspended from '../useQuerySuspended';
import usePageTitle from '../usePageTitle';
import useValueUnless from '../useValueUnless';

function NewTicket({ userConProfileId, history }) {
  const { data, error } = useQuerySuspended(UserConProfileAdminQuery, {
    variables: { id: userConProfileId },
  });
  const createTicket = useMutationCallback(CreateTicket, {
    update: (cache, { data: { createTicket: { ticket } } }) => {
      const cacheData = cache.readQuery({
        query: UserConProfileAdminQuery,
        variables: { id: userConProfileId },
      });
      cache.writeQuery({
        query: UserConProfileAdminQuery,
        variables: { id: userConProfileId },
        data: {
          ...cacheData,
          userConProfile: {
            ...cacheData.userConProfile,
            ticket,
          },
        },
      });
    },
  });

  const onSubmit = useCallback(
    async (ticketInput) => {
      await createTicket({
        variables: {
          userConProfileId,
          ticket: ticketInput,
        },
      });
      history.push(`/user_con_profiles/${userConProfileId}`);
    },
    [createTicket, history, userConProfileId],
  );

  usePageTitle(useValueUnless(() => `New ${data.convention.ticket_name} for ${data.userConProfile.name}`, error));

  if (error) {
    return <ErrorDisplay graphQLError={error} />;
  }

  const { convention, userConProfile } = data;

  return (
    <>
      <h1 className="mb-4">
        {'Create '}
        {convention.name}
        {' '}
        {convention.ticket_name}
        {' for '}
        {userConProfile.name}
      </h1>

      <TicketForm
        convention={convention}
        initialTicket={{
          ticket_type: null,
          payment_amount: {
            fractional: 0,
            currency_code: 'USD',
          },
          payment_note: '',
          provided_by_event: null,
        }}
        onSubmit={onSubmit}
        submitCaption={`Create ${convention.ticket_name}`}
      />
    </>
  );
}

NewTicket.propTypes = {
  userConProfileId: PropTypes.number.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(NewTicket);