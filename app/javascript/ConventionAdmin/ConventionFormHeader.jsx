import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

import pluralizeWithCount from '../pluralizeWithCount';
import Timespan from '../Timespan';
import { MAXIMUM_EVENT_SIGNUPS_OPTIONS } from './ConventionFormEventsSection';

function describeEventVisibility(visibility) {
  switch (visibility) {
    case 'no': return 'Hidden';
    case 'priv': return 'Staff only';
    case 'gms': return 'Staff and event teams';
    case 'yes': return 'Public';
    default: return visibility;
  }
}

function describeMaximumEventSignups(scheduledValue) {
  const now = moment();
  const currentTimespan = scheduledValue.timespans.find((timespanObj) => {
    const timespan = Timespan.fromStrings(timespanObj.start, timespanObj.finish);
    return timespan.includesTime(now);
  });

  if (!currentTimespan) {
    return 'No signups yet';
  }

  const currentOption = MAXIMUM_EVENT_SIGNUPS_OPTIONS
    .find(([option]) => currentTimespan.value === option);
  if (!currentOption) {
    return currentTimespan.value;
  }

  return currentOption[1];
}

function describeConventionTiming(startsAt, endsAt, timezoneName) {
  const now = moment.tz({}, timezoneName).startOf('day');
  const conventionStart = moment.tz(startsAt, timezoneName).startOf('day');
  const conventionEnd = moment.tz(endsAt, timezoneName).startOf('day');

  if (now.isBefore(conventionStart)) {
    return `starts in ${pluralizeWithCount('day', conventionStart.diff(now, 'day'))}`;
  }

  if (now.isBefore(conventionEnd)) {
    return `ends in ${pluralizeWithCount('day', conventionEnd.diff(now, 'day'))}`;
  }

  if (conventionEnd.isBefore(now)) {
    return `ended ${pluralizeWithCount('day', now.diff(conventionEnd, 'day'))} ago`;
  }

  const isMultiDay = conventionStart.isBefore(conventionEnd);
  return `${isMultiDay ? 'ends' : 'is'} today`;
}

function ConventionFormHeader({ convention }) {
  const conventionTiming = useMemo(
    () => describeConventionTiming(
      convention.starts_at,
      convention.ends_at,
      convention.timezone_name,
    ),
    [convention.starts_at, convention.ends_at, convention.timezone_name],
  );

  const signupsDescription = useMemo(
    () => describeMaximumEventSignups(convention.maximum_event_signups),
    [convention.maximum_event_signups],
  );

  return (
    <header className="mb-4">
      <h1>
        {convention.name}
        {' '}
        <span className="h3">
          {conventionTiming}
        </span>
      </h1>
      <div className="row">
        <div className="col-md-4">
          <strong>Event list:</strong>
          {' '}
          {describeEventVisibility(convention.show_event_list)}
        </div>
        <div className="col-md-4">
          <strong>Schedule:</strong>
          {' '}
          {describeEventVisibility(convention.show_schedule)}
        </div>
        <div className="col-md-4">
          <strong>Signups:</strong>
          {' '}
          {signupsDescription}
        </div>
      </div>
    </header>
  );
}

ConventionFormHeader.propTypes = {
  convention: PropTypes.shape({
    name: PropTypes.string.isRequired,
    starts_at: PropTypes.string.isRequired,
    ends_at: PropTypes.string.isRequired,
    timezone_name: PropTypes.string.isRequired,
    show_event_list: PropTypes.string.isRequired,
    show_schedule: PropTypes.string.isRequired,
    maximum_event_signups: PropTypes.shape({
      timespans: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        start: PropTypes.string,
        finish: PropTypes.string,
      })).isRequired,
    }).isRequired,
  }).isRequired,
};

export default React.memo(ConventionFormHeader, (prevProps, nextProps) => (
  prevProps.convention.name === nextProps.convention.name
  && prevProps.convention.starts_at === nextProps.convention.starts_at
  && prevProps.convention.ends_at === nextProps.convention.ends_at
  && prevProps.convention.timezone_name === nextProps.convention.timezone_name
  && prevProps.convention.show_event_list === nextProps.convention.show_event_list
  && prevProps.convention.show_schedule === nextProps.convention.show_schedule
  && prevProps.convention.maximum_event_signups === nextProps.convention.maximum_event_signups
));
