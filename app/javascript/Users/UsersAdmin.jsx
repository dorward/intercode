import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';

import UsersTable from './UsersTable';
import UserAdminDisplay from './UserAdminDisplay';
import { UserAdminQuery } from './queries.gql';
import BreadcrumbItemWithRoute from '../Breadcrumbs/BreadcrumbItemWithRoute';
import useQuerySuspended from '../useQuerySuspended';

function UserBreadcrumbItem({ id }) {
  const { data, error } = useQuerySuspended(UserAdminQuery, { variables: { id } });

  if (error) {
    return null;
  }

  return (
    <BreadcrumbItemWithRoute path="/users/:id" to={`/users/${id}`}>
      {data.user.name}
    </BreadcrumbItemWithRoute>
  );
}

UserBreadcrumbItem.propTypes = {
  id: PropTypes.number.isRequired,
};

function UsersAdmin() {
  return (
    <>
      <ol className="breadcrumb">
        <BreadcrumbItemWithRoute
          path="/users"
          to="/users"
          active={({ match }) => match.isExact}
        >
          Users
        </BreadcrumbItemWithRoute>

        <Route
          path="/users/:id"
          render={({ match: { params: { id } } }) => (
            <UserBreadcrumbItem id={Number.parseInt(id, 10)} />
          )}
        />
      </ol>

      <Switch>
        <Route path="/users/:id" render={({ match: { params: { id } } }) => <UserAdminDisplay userId={Number.parseInt(id, 10)} />} />
        <Route path="/users" render={() => <UsersTable exportUrl="/users/export.csv" />} />
      </Switch>
    </>
  );
}

export default UsersAdmin;