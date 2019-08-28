import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';

import EditTicketType from './EditTicketType';
import NewTicketType from './NewTicketType';
import TicketTypesList from './TicketTypesList';
import { AdminTicketTypesQuery } from './queries.gql';
import useQuerySuspended from '../useQuerySuspended';
import ErrorDisplay from '../ErrorDisplay';

function TicketTypeAdmin() {
  const { data, error } = useQuerySuspended(AdminTicketTypesQuery);

  if (error) {
    return <ErrorDisplay graphQLError={error} />;
  }

  return (
    <Switch>
      <Route
        path="/ticket_types/new"
        render={() => (
          <NewTicketType
            timezoneName={data.convention.timezone_name}
            ticketName={data.convention.ticket_name}
          />
        )}
      />
      <Route
        path="/ticket_types/:id/edit"
        render={({ match: { params: { id } } }) => {
          const ticketType = data.convention.ticket_types
            .find(tt => tt.id.toString(10) === id);

          return (
            <EditTicketType
              initialTicketType={ticketType}
              timezoneName={data.convention.timezone_name}
              ticketName={data.convention.ticket_name}
            />
          );
        }}
      />
      <Route
        path="/ticket_types/"
        render={() => (
          <TicketTypesList
            ticketTypes={data.convention.ticket_types}
            ticketName={data.convention.ticket_name}
            timezoneName={data.convention.timezone_name}
          />
        )}
      />
      <Redirect to="/" />
    </Switch>
  );
}

export default TicketTypeAdmin;