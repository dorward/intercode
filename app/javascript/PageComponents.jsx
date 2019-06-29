import React, { lazy } from 'react';
import mapValues from 'lodash-es/mapValues';

import ClickwrapAgreement from './ClickwrapAgreement';
import CmsPage from './CmsPage';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

function NonCMSPageWrapper(WrappedComponent) {
  const wrapper = props => (
    <div className="non-cms-page">
      <WrappedComponent {...props} />
    </div>
  );
  wrapper.displayName = `NonCMSPageWrapper(${getDisplayName(WrappedComponent)})`;
  return wrapper;
}

const UnwrappedNonCMSPageComponents = {
  Cart: () => import(/* webpackChunkName: "store" */ './Store/Cart'),
  CmsAdmin: () => import(/* webpackChunkName: "cms-admin" */ './CmsAdmin'),
  ConventionAdmin: () => import(/* webpackChunkName: "convention-admin" */ './ConventionAdmin'),
  EditUser: () => import(/* webpackChunkName: "authentication-forms" */ './Authentication/EditUser'),
  EventAdmin: () => import(/* webpackChunkName: "event-admin" */ './EventAdmin'),
  EventCategoryAdmin: () => import(/* webpackChunkName: "event-category-admin" */ './EventCategoryAdmin'),
  EventProposalsAdmin: () => import(/* webpackChunkName: "event-proposals-admin" */ './EventProposals/EventProposalsAdmin'),
  EventsApp: () => import(/* webpackChunkName: "events-app" */ './EventsApp'),
  EditEventProposal: () => import(/* webpackChunkName: "edit-event-proposal" */ './EventProposals/EditEventProposal'),
  FormAdmin: () => import(/* webpackChunkName: "form-admin" */ './FormAdmin'),
  MailingLists: () => import(/* webpackChunkName: "mailing-lists" */ './MailingLists'),
  MyProfile: () => import(/* webpackChunkName: "my-profile" */ './MyProfile'),
  MyTicket: () => import(/* webpackChunkName: 'my-ticket' */ './MyTicket'),
  OAuthApplications: () => import(/* webpackChunkName: "oauth-applications" */ './OAuthApplications'),
  OAuthAuthorizationPrompt: () => import(/* webpackChunkName: "oauth-authorization-prompt" */ './OAuth/AuthorizationPrompt'),
  OrderHistory: () => import(/* webpackChunkName: "store" */ './Store/OrderHistory'),
  OrganizationAdmin: () => import(/* webpackChunkName: "organization-admin" */ './OrganizationAdmin'),
  ProductPage: () => import(/* webpackChunkName: "store" */ './Store/ProductPage'),
  Reports: () => import(/* webpackChunkName: "reports" */ './Reports'),
  ResetPassword: () => import(/* webpackChunkName: "authentication-forms" */ './Authentication/ResetPassword'),
  RoomsAdmin: () => import(/* webpackChunkName: "rooms-admin" */ './RoomsAdmin'),
  SignupModeration: () => import(/* webpackChunkName: "signup-moderation" */ './SignupModeration'),
  StaffPositionAdmin: () => import(/* webpackChunkName: "staff-position-admin" */ './StaffPositionAdmin'),
  StoreAdmin: () => import(/* webpackChunkName: "store-admin" */ './Store/StoreAdmin'),
  TicketTypeAdmin: () => import(/* webpackChunkName: "ticket-type-admin" */ './TicketTypeAdmin'),
  UserActivityAlertsAdmin: () => import(/* webpackChunkName: "user-activity-alerts-admin" */ './UserActivityAlerts/UserActivityAlertsAdmin'),
  UserConProfilesAdmin: () => import(/* webpackChunkName: "user-con-profiles-admin" */ './UserConProfiles/UserConProfilesAdmin'),
  UsersAdmin: () => import(/* webpackChunkName: "users-admin" */ './Users/UsersAdmin'),
};

const NonCMSPageComponents = {
  ...mapValues(UnwrappedNonCMSPageComponents, component => NonCMSPageWrapper(lazy(component))),
  WrappedClickwrapAgreement: NonCMSPageWrapper(ClickwrapAgreement),
};

const PageComponents = {
  ...NonCMSPageComponents,
  CmsPage,
};

export default PageComponents;