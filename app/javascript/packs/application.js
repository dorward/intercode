/* eslint no-console:0 */
// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

import 'custom-event-polyfill';
import 'url-search-params-polyfill';

// eslint-disable-next-line import/order
import '../displayBrowserWarning'; // runs on import

import Rails from 'rails-ujs';
import 'bootstrap.native/dist/bootstrap-native-v4';

import WebpackerReact from 'webpacker-react';

import '../styles/application.scss';
import 'react-table/react-table.css';
import '../inflections';

import components from './components';

WebpackerReact.setup(components);

Rails.start();
