import moment from 'moment-timezone';
import { DateTime } from 'luxon';
import Timespan from './Timespan';
import { timezoneNameForConvention } from './TimeUtils';
import { removeCommonStringMiddle } from './ValueUtils';

export function timespanFromConvention(convention) {
  return Timespan.fromStrings(convention.starts_at, convention.ends_at)
    .tz(timezoneNameForConvention(convention));
}

export function timespanFromRun(convention, event, run) {
  const start = moment(run.starts_at).tz(timezoneNameForConvention(convention));
  const finish = start.clone().add(event.length_seconds, 'seconds');

  return new Timespan(start, finish);
}

export function getConventionDayTimespans(conventionTimespan, timezoneName) {
  return conventionTimespan.getTimespansWithin(
    timezoneName,
    {
      unit: 'day',
      offset: moment.duration(6, 'hours'), // start convention days at 6:00am
    },
  );
}

export function getMemoizationKeyForTimespan(timespan) {
  if (!timespan) {
    return '';
  }

  return [
    timespan.start ? timespan.start.toISOString() : '',
    timespan.finish ? timespan.finish.toISOString() : '',
  ].join('/');
}

export function describeInterval(timespan, formatDateTime, timeZone) {
  const start = (
    timespan.start
      ? formatDateTime(DateTime.fromISO(timespan.start.toISOString()).setZone(timeZone))
      : 'anytime'
  );

  const finish = (
    timespan.finish
      ? formatDateTime(DateTime.fromISO(timespan.finish.toISOString()).setZone(timeZone))
      : 'indefinitely'
  );

  const [dedupedStart, dedupedFinish] = removeCommonStringMiddle(start, finish);
  return [dedupedStart, dedupedFinish].join(timespan.finish ? ' to ' : ' ');
}
