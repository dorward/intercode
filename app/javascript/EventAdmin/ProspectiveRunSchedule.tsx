import React, { useMemo, useContext, useRef, useEffect } from 'react';
import classnames from 'classnames';

import { Moment } from 'moment-timezone';
import {
  ScheduleGridContext,
  useScheduleGridProvider,
} from '../EventsApp/ScheduleGrid/ScheduleGridContext';
import { PIXELS_PER_HOUR, PIXELS_PER_LANE } from '../EventsApp/ScheduleGrid/LayoutConstants';
import useLayoutForTimespan from '../EventsApp/ScheduleGrid/useLayoutForTimespan';
import Timespan from '../Timespan';
import ScheduleGridHeaderBlock from '../EventsApp/ScheduleGrid/ScheduleGridHeaderBlock';
import {
  getConventionDayTimespans,
  timespanFromConvention,
  ConventionForTimespanUtils,
} from '../TimespanUtils';
import {
  getRunClassName,
  getRunStyle,
  SignupStatus,
  GetEventCategoryStylesOptions,
} from '../EventsApp/ScheduleGrid/StylingUtils';
import ScheduleBlock from '../EventsApp/ScheduleGrid/ScheduleBlock';
import AvailabilityBar from '../EventsApp/ScheduleGrid/AvailabilityBar';
import AppRootContext from '../AppRootContext';
import RunDimensions from '../EventsApp/ScheduleGrid/PCSG/RunDimensions';
import ScheduleLayoutResult from '../EventsApp/ScheduleGrid/PCSG/ScheduleLayoutResult';
import ScheduleGridConfig from '../EventsApp/ScheduleGrid/ScheduleGridConfig';
import {
  useEventAdminEventsQueryQuery,
  EventFieldsFragment,
  RunFieldsFragment,
} from './queries.generated';
import { ScheduleGridEventFragmentFragment } from '../EventsApp/ScheduleGrid/queries.generated';

const SCHEDULE_GRID_CONFIG = new ScheduleGridConfig({
  key: 'con_schedule_by_room',
  basename: '/events/schedule_by_room',
  title: 'Con schedule by room',
  classifyEventsBy: 'category',
  showSignupStatusBadge: true,
  showSignedUp: true,
  groupEventsBy: 'room',
  filterEmptyGroups: true,
  legends: [],
});

const FAKE_SIGNUP_COUNT_DATA = {
  runFull: () => false,
  getConfirmedLimitedSignupCount: () => 0,
  getNotCountedConfirmedSignupCount: () => 0,
};

type ProspectiveRun = RunFieldsFragment & {
  prospectiveRun: true;
};

function isProspectiveRun(run: RunFieldsFragment): run is ProspectiveRun {
  return (
    Object.prototype.hasOwnProperty.call(run, 'prospectiveRun') &&
    (run as ProspectiveRun).prospectiveRun === true
  );
}

type ProspectiveRunScheduleEventRunProps = {
  convention: ConventionForTimespanUtils & {
    event_categories: (GetEventCategoryStylesOptions['eventCategory'] & { id: number })[];
  };
  runDimensions: RunDimensions;
  layoutResult: ScheduleLayoutResult;
};

function ProspectiveRunScheduleEventRun({
  convention,
  runDimensions,
  layoutResult,
}: ProspectiveRunScheduleEventRunProps) {
  const { schedule } = useContext(ScheduleGridContext);
  const { eventRun } = runDimensions;
  const run = useMemo(() => schedule.getRun(eventRun.runId), [schedule, eventRun.runId]);
  const runRef = useRef<HTMLDivElement>(null);
  const event = useMemo(() => {
    if (!run) {
      return null;
    }

    return schedule.getEvent(run.event_id);
  }, [schedule, run]);

  const runStyle = useMemo(
    () =>
      getRunStyle({
        event,
        eventCategory:
          convention.event_categories.find((c) => c.id === event.event_category.id) ?? {},
        signupStatus: isProspectiveRun(run) ? SignupStatus.Confirmed : null,
        config: SCHEDULE_GRID_CONFIG,
        signupCountData: FAKE_SIGNUP_COUNT_DATA,
        disableDetailsPopup: true,
        runDimensions,
        layoutResult,
      }),
    [convention, runDimensions, layoutResult, event, run],
  );

  useEffect(() => {
    if (isProspectiveRun(run) && runRef.current) {
      runRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [run, runDimensions]);

  if (!event) {
    return null;
  }

  return (
    <div
      ref={runRef}
      className={getRunClassName({
        event,
        signupStatus: isProspectiveRun(run) ? SignupStatus.Confirmed : undefined,
        config: SCHEDULE_GRID_CONFIG,
        signupCountData: FAKE_SIGNUP_COUNT_DATA,
        unlimited: !event.registration_policy?.slots_limited,
      })}
      style={{
        ...runStyle,
        borderStyle: isProspectiveRun(run) ? 'dashed' : 'auto',
        fontWeight: isProspectiveRun(run) ? 'bold' : undefined,
      }}
    >
      <div className="schedule-grid-event-content">
        <AvailabilityBar
          availabilityFraction={0}
          runStyle={runStyle}
          unlimited={!event.registration_policy?.slots_limited}
        />
        {event.title}
      </div>
    </div>
  );
}

export type ProspectiveRunScheduleProps = {
  day?: Moment;
  runs: RunFieldsFragment[];
  event: EventFieldsFragment;
};

function ProspectiveRunSchedule({ day, runs, event }: ProspectiveRunScheduleProps) {
  const { timezoneName } = useContext(AppRootContext);
  const { data, loading, error } = useEventAdminEventsQueryQuery();

  const conventionTimespan = useMemo(
    () => (error || loading ? null : timespanFromConvention(data!.convention!)),
    [error, loading, data],
  );

  const prospectiveRuns: ProspectiveRun[] = useMemo(
    () =>
      runs.map((run) => ({
        id: 0,
        starts_at: run.starts_at,
        rooms: run.rooms,
        schedule_note: null,
        title_suffix: null,
        prospectiveRun: true,
      })),
    [runs],
  );

  const eventsForSchedule: ScheduleGridEventFragmentFragment[] | null = useMemo(() => {
    if (error || loading || !data) {
      return null;
    }

    const convertRun = (run: RunFieldsFragment) => ({
      confirmed_signup_count: 0,
      not_counted_signup_count: 0,
      signup_count_by_state_and_bucket_key_and_counted: '{}',
      room_names: [],
      my_signups: [],
      my_signup_requests: [],
      ...run,
    });

    const convertEvent = (e: EventFieldsFragment) => ({
      ...e,
      runs: e.runs.map(convertRun),
    });

    const filteredEvents = data.events.map((e) => {
      if (e.id === event.id) {
        return {
          ...e,
          runs: [...e.runs.filter((r) => runs.find((run) => run.id === r.id) == null)],
        };
      }

      return e;
    });

    const effectiveEvents = filteredEvents.some((e) => e.id === event.id)
      ? filteredEvents
      : [...filteredEvents, event];

    if (prospectiveRuns) {
      return effectiveEvents.map((e) => {
        if (e.id === event.id) {
          return convertEvent({
            ...e,
            runs: [...e.runs, ...prospectiveRuns],
          });
        }

        return convertEvent(e);
      });
    }

    return effectiveEvents.map(convertEvent);
  }, [data, error, loading, event, prospectiveRuns, runs]);

  const conventionDayTimespans = useMemo(
    () =>
      conventionTimespan?.isFinite()
        ? getConventionDayTimespans(conventionTimespan, timezoneName)
        : undefined,
    [conventionTimespan, timezoneName],
  );

  const conventionDayTimespan = useMemo(() => {
    if (!day) {
      return undefined;
    }
    const dayTimespan = new Timespan(day, day.clone().endOf('day'));
    return conventionDayTimespans?.find((cdt) => cdt.overlapsTimespan(dayTimespan));
  }, [conventionDayTimespans, day]);

  const scheduleGridProviderValue = useScheduleGridProvider(
    SCHEDULE_GRID_CONFIG,
    data?.convention ?? undefined,
    eventsForSchedule ?? undefined,
  );
  const layout = useLayoutForTimespan(scheduleGridProviderValue.schedule, conventionDayTimespan);

  if (!layout) {
    return null;
  }

  return (
    <ScheduleGridContext.Provider value={scheduleGridProviderValue}>
      <div className="schedule-grid mb-4" style={{ overflowX: 'auto' }}>
        <div
          className="schedule-grid-content"
          style={{ backgroundSize: `${PIXELS_PER_HOUR}px ${PIXELS_PER_LANE}px` }}
        >
          <div className="mt-1 d-flex">
            {scheduleGridProviderValue.schedule.shouldUseRowHeaders() ? (
              <div style={{ width: `${PIXELS_PER_HOUR}px`, minWidth: `${PIXELS_PER_HOUR}px` }} />
            ) : null}
            <ScheduleGridHeaderBlock timespan={layout.timespan} eventRuns={layout.eventRuns} />
          </div>
          {layout.blocksWithOptions.map(([scheduleBlock, options]) => (
            <div
              className={classnames('d-flex', { 'flex-grow-1': (options || {}).flexGrow })}
              key={scheduleBlock.id}
            >
              <ScheduleBlock
                scheduleBlock={scheduleBlock}
                rowHeader={options.rowHeader}
                renderEventRun={({ layoutResult, runDimensions }) => (
                  <ProspectiveRunScheduleEventRun
                    convention={data!.convention!}
                    layoutResult={layoutResult}
                    runDimensions={runDimensions}
                  />
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </ScheduleGridContext.Provider>
  );
}

export default ProspectiveRunSchedule;