import React, { useContext } from 'react';
import moment from 'moment-timezone';
import { Link, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  ConventionForTimespanUtils,
  getConventionDayTimespans,
  timespanFromConvention,
} from '../../TimespanUtils';
import RouteActivatedBreadcrumbItem from '../../Breadcrumbs/RouteActivatedBreadcrumbItem';
import AppRootContext from '../../AppRootContext';
import { Run } from '../../graphqlTypes.generated';

function findRunFromHash<RunType extends { id: number }>(runs: RunType[], hash?: string | null) {
  if (!hash) {
    return undefined;
  }

  return runs.find((run) => `#run-${run.id}` === hash);
}

function getConventionDayStart(
  run: Pick<Run, 'starts_at'>,
  convention: ConventionForTimespanUtils,
  timezoneName: string,
) {
  const conventionTimespan = timespanFromConvention(convention);
  if (!run || !conventionTimespan.isFinite()) {
    return conventionTimespan.start;
  }

  const runStart = moment.tz(run.starts_at, timezoneName);
  const conventionDayTimespans = getConventionDayTimespans(conventionTimespan, timezoneName);
  const conventionDay = conventionDayTimespans.find((timespan) => timespan.includesTime(runStart));
  return conventionDay?.start ?? conventionTimespan.start;
}

export type EventBreadcrumbItemsProps = {
  event: {
    title?: string | null;
    runs: Pick<Run, 'starts_at' | 'id'>[];
  };
  convention: ConventionForTimespanUtils;
  currentAbility: {
    can_read_schedule: boolean;
  };
  eventPath: string;
};

function EventBreadcrumbItems({
  event,
  convention,
  currentAbility,
  eventPath,
}: EventBreadcrumbItemsProps) {
  const { t } = useTranslation();
  const { timezoneName } = useContext(AppRootContext);
  const history = useHistory();
  const runToLink = findRunFromHash(event.runs, history.location.hash) || event.runs[0];
  const conventionDayStart = getConventionDayStart(runToLink, convention, timezoneName);

  return (
    <>
      <li className="breadcrumb-item">
        {currentAbility.can_read_schedule && event.runs.length > 0 ? (
          <Link
            to={
              conventionDayStart
                ? `/events/schedule/${conventionDayStart.format('dddd').toLowerCase()}`
                : '/events/schedule'
            }
          >
            {t('navigation.events.schedule', 'Con schedule')}
          </Link>
        ) : (
          <Link to="/events">{t('navigation.events.eventsList', 'List of events')}</Link>
        )}
      </li>
      <RouteActivatedBreadcrumbItem matchProps={{ path: eventPath, exact: true }} to={eventPath}>
        {event.title}
      </RouteActivatedBreadcrumbItem>
    </>
  );
}

export default EventBreadcrumbItems;