/* eslint no-console:0 */
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

import 'babel-polyfill';

import Clipboard from 'clipboard';
import Rails from 'rails-ujs';
import 'bootstrap.native/dist/bootstrap-native-v4';

import 'codemirror';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/mode/multiplex';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/matchtags';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/markdown-fold';
import 'codemirror/addon/fold/xml-fold';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/foldgutter.css';

import CadmusNavbarAdminApp from 'cadmus-navbar-admin';
import WebpackerReact from 'webpacker-react';

import '../styles/application.scss';
import '../inflections';
import '../Codemirror/LiquidMultiplexModes';

import ConventionAdmin from '../ConventionAdmin';
import EventAdmin from '../EventAdmin';
import EventListSortDropdown from '../UIComponents/EventListSortDropdown';
import FormJSONEditor from '../FormJSONEditor';
import FormPresenter from '../FormPresenter';
import LiquidHTMLEditor from '../StandaloneFormControls/LiquidHTMLEditor';
import RoomsAdmin from '../RoomsAdmin';
import ScheduleGrid from '../ScheduleGrid';
import StaffPositionForm from '../BuiltInForms/StaffPositionForm';
import StandaloneEditEvent from '../StandaloneEditEvent';
import StandaloneGraphQLComponent from '../StandaloneGraphQLComponent';
import TeamMemberForm from '../BuiltInForms/TeamMemberForm';
import TicketPurchaseForm from '../BuiltInForms/TicketPurchaseForm';
import TicketTypeForm from '../BuiltInForms/TicketTypeForm';
import WhosFreeForm from '../BuiltInForms/WhosFreeForm';

WebpackerReact.setup({
  CadmusNavbarAdminApp,
  ConventionAdmin: StandaloneGraphQLComponent(ConventionAdmin),
  EventAdmin,
  EventListSortDropdown,
  FormJSONEditor: StandaloneGraphQLComponent(FormJSONEditor),
  FormPresenter,
  LiquidHTMLEditor,
  RoomsAdmin: StandaloneGraphQLComponent(RoomsAdmin),
  ScheduleGrid: StandaloneGraphQLComponent(ScheduleGrid),
  StaffPositionForm: StandaloneGraphQLComponent(StaffPositionForm),
  StandaloneEditEvent: StandaloneGraphQLComponent(StandaloneEditEvent),
  TeamMemberForm: StandaloneGraphQLComponent(TeamMemberForm),
  TicketPurchaseForm,
  TicketTypeForm,
  WhosFreeForm: StandaloneGraphQLComponent(WhosFreeForm),
});

Rails.start();

// eslint-disable-next-line no-new
new Clipboard('[data-clipboard-target], [data-clipboard-text]');
