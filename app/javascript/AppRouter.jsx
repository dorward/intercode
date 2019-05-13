import React, { lazy } from 'react';
import { Switch, Route } from 'react-router-dom';

import CmsPage from './CmsPage';
const ConventionAdmin = lazy(() => import(/* webpackChunkName: "convention-admin" */ './ConventionAdmin'));
const TicketTypeAdmin = lazy(() => import(/* webpackChunkName: "ticket-type-admin" */ './TicketTypeAdmin'));
const UserConProfilesAdmin = lazy(() => import(/* webpackChunkName: "user-con-profiles-admin" */ './UserConProfiles/UserConProfilesAdmin'));

function AppRouter() {
  return (
    <Switch>
      <Route path="/convention/edit" component={ConventionAdmin} />
      <Route path="/ticket_types" component={TicketTypeAdmin} />
      <Route path="/user_con_profiles" component={UserConProfilesAdmin} />
      <Route
        path="/pages/:slug([a-zA-Z0-9\-/]+)"
        render={routeProps => (
          <CmsPage {...routeProps} slug={routeProps.match.params.slug} />
        )}
      />
      <Route
        path="/"
        exact
        render={routeProps => (
          <CmsPage {...routeProps} rootPage />
        )}
      />
    </Switch>
  );
}

export default AppRouter;
