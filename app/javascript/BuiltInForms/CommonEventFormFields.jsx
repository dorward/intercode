import React from 'react';
import PropTypes from 'prop-types';
import Form from '../Models/Form';
import MaximumEventProvidedTicketsOverrideEditor from '../BuiltInFormControls/MaximumEventProvidedTicketsOverrideEditor';
import SinglePageFormPresenter from '../FormPresenter/SinglePageFormPresenter';

class CommonEventFormFields extends React.Component {
  static buildRegistrationPolicyForVolunteerEvent = totalSlots => ({
    buckets: [
      {
        key: 'signups',
        name: 'Signups',
        description: 'Signups for this event',
        anything: false,
        slots_limited: true,
        minimum_slots: 1,
        preferred_slots: totalSlots,
        total_slots: totalSlots,
      },
    ],
  });

  static propTypes = {
    event: PropTypes.shape({
      id: PropTypes.number,
      form_response_attrs: PropTypes.shape({}).isRequired,
      maximum_event_provided_tickets_overrides: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    }).isRequired,
    canOverrideMaximumEventProvidedTickets: PropTypes.bool,
    ticketTypes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      maximum_event_provided_tickets: PropTypes.number.isRequired,
    }).isRequired).isRequired,
    ticketName: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    form: Form.propType.isRequired,
    convention: PropTypes.shape({}).isRequired,
    createMaximumEventProvidedTicketsOverride: PropTypes.func.isRequired,
    deleteMaximumEventProvidedTicketsOverride: PropTypes.func.isRequired,
    updateMaximumEventProvidedTicketsOverride: PropTypes.func.isRequired,
    children: PropTypes.node,
  };

  static defaultProps = {
    canOverrideMaximumEventProvidedTickets: false,
    ticketName: null,
    children: null,
  };

  processFormResponseValue = (key, value) => {
    switch (key) {
      case 'can_play_concurrently':
        return { can_play_concurrently: (value === 'true') };
      case 'total_slots':
        return {
          total_slots: value,
          registration_policy: CommonEventFormFields
            .buildRegistrationPolicyForVolunteerEvent(Number.parseInt(value, 10)),
        };
      default:
        return { [key]: value };
    }
  }

  formResponseValuesChanged = (newResponseValues) => {
    const processedResponseValues = Object.entries(newResponseValues).reduce(
      (processed, [key, value]) => ({
        ...processed,
        ...this.processFormResponseValue(key, value),
      }),
      {},
    );

    this.props.onChange({
      ...this.props.event,
      form_response_attrs: {
        ...this.props.event.form_response_attrs,
        ...processedResponseValues,
      },
    });
  }

  renderMaximumEventProvidedTicketsOverrideEditor = () => {
    if (!this.props.canOverrideMaximumEventProvidedTickets) {
      return null;
    }

    return (
      <MaximumEventProvidedTicketsOverrideEditor
        eventId={this.props.event.id}
        ticketTypes={this.props.ticketTypes}
        ticketName={this.props.ticketName}
        overrides={this.props.event.maximum_event_provided_tickets_overrides}
        createOverride={this.props.createMaximumEventProvidedTicketsOverride}
        deleteOverride={this.props.deleteMaximumEventProvidedTicketsOverride}
        updateOverride={this.props.updateMaximumEventProvidedTicketsOverride}
      />
    );
  }

  render = () => (
    <SinglePageFormPresenter
      form={this.props.form}
      convention={this.props.convention}
      response={this.props.event.form_response_attrs}
      responseValuesChanged={this.formResponseValuesChanged}
    >

      {this.renderMaximumEventProvidedTicketsOverrideEditor()}

      {this.props.children}
    </SinglePageFormPresenter>
  )
}

export default CommonEventFormFields;
