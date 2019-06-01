import React from 'react';
import PropTypes from 'prop-types';

import { useChangeDispatchers } from '../ComposableFormUtils';
import BooleanInput from '../BuiltInFormControls/BooleanInput';
import MultipleChoiceInput from '../BuiltInFormControls/MultipleChoiceInput';
import ScheduledValueEditor from '../BuiltInFormControls/ScheduledValueEditor';

export const MAXIMUM_EVENT_SIGNUPS_OPTIONS = [
  ['not_yet', 'No signups yet'],
  ['1', 'Up to 1 event'],
  ['2', 'Up to 2 events'],
  ['3', 'Up to 3 events'],
  ['unlimited', 'Signups fully open'],
  ['not_now', 'Signups frozen'],
];


const buildMaximumEventSignupsInput = (value, onChange) => {
  const processChangeEvent = (event) => {
    onChange(event.target.value);
  };

  const options = MAXIMUM_EVENT_SIGNUPS_OPTIONS.map(([optionValue, label]) => (
    <option key={optionValue} value={optionValue}>{label}</option>
  ));

  return (
    <select className="form-control" value={value} onChange={processChangeEvent}>
      <option />
      {options}
    </select>
  );
};

function ConventionFormEventsSection({ convention, dispatch, disabled }) {
  const [
    changeSignupMode,
    changeAcceptingProposals,
    changeShowEventList,
    changeShowSchedule,
    changeMaximumEventSignups,
  ] = useChangeDispatchers(
    dispatch,
    ['signup_mode', 'accepting_proposals', 'show_event_list', 'show_schedule', 'maximum_event_signups'],
  );

  return (
    <>
      <MultipleChoiceInput
        name="signup_mode"
        caption="Signup mode"
        choices={[
          { value: 'self_service', label: 'Self-service (attendees can sign themselves up for events)' },
          { value: 'moderated', label: 'Moderated (attendees can request signups and signup changes but con staff must approve them)' },
        ]}
        value={convention.signup_mode}
        onChange={changeSignupMode}
        disabled={disabled}
      />
      <BooleanInput
        name="accepting_proposals"
        caption="Accepting event proposals"
        value={convention.accepting_proposals}
        onChange={changeAcceptingProposals}
        disabled={disabled || convention.site_mode === 'single_event'}
      />

      <MultipleChoiceInput
        name="show_event_list"
        caption="Show list of events"
        choices={[
          { value: 'no', label: 'No' },
          { value: 'priv', label: 'Only to users with scheduling privileges' },
          { value: 'gms', label: 'Only to event team members and users with any privileges' },
          { value: 'yes', label: 'Yes, to everyone' },
        ]}
        value={convention.show_event_list}
        onChange={changeShowEventList}
        disabled={disabled || convention.site_mode === 'single_event'}
      />

      <MultipleChoiceInput
        name="show_schedule"
        caption="Show event schedule"
        choices={[
          { value: 'no', label: 'No' },
          { value: 'priv', label: 'Only to users with scheduling privileges' },
          { value: 'gms', label: 'Only to event team members and users with any privileges' },
          { value: 'yes', label: 'Yes, to everyone' },
        ]}
        value={convention.show_schedule}
        onChange={changeShowSchedule}
        disabled={disabled || convention.site_mode === 'single_event'}
      />

      <fieldset>
        <legend className="col-form-label">Event signup schedule</legend>
        <ScheduledValueEditor
          scheduledValue={convention.maximum_event_signups}
          setScheduledValue={changeMaximumEventSignups}
          timezone={convention.timezone_name}
          buildValueInput={buildMaximumEventSignupsInput}
          disabled={disabled}
        />
      </fieldset>
    </>
  );
}

ConventionFormEventsSection.propTypes = {
  convention: PropTypes.shape({
    accepting_proposals: PropTypes.bool.isRequired,
    show_schedule: PropTypes.oneOf(['no', 'priv', 'gms', 'yes']).isRequired,
    show_event_list: PropTypes.oneOf(['no', 'priv', 'gms', 'yes']).isRequired,
    maximum_event_signups: PropTypes.shape({
      timespans: PropTypes.arrayOf(PropTypes.shape({
        start: PropTypes.string,
        finish: PropTypes.string,
        value: PropTypes.string.isRequired,
      }).isRequired).isRequired,
    }).isRequired,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

ConventionFormEventsSection.defaultProps = {
  disabled: false,
};

export default ConventionFormEventsSection;
