import moment from 'moment-timezone';
import sortBy from 'lodash/sortBy';

import { normalizeTitle } from '../../../ValueUtils';
import { FiniteTimespan } from '../../../Timespan';
// eslint-disable-next-line import/no-duplicates
import type Schedule from '../Schedule';
// eslint-disable-next-line import/no-duplicates
import type { ScheduleEvent } from '../Schedule';
import ColumnReservationSet from './ColumnReservationSet';

const MIN_LENGTH = 30 * 60 * 1000; // 30 minutes in milliseconds

export type RunDimensions = {
  runId: number;
  timespan: FiniteTimespan;
  laneIndex: number;
  timeAxisStartPercent: number;
  timeAxisSizePercent: number;
};

export type ScheduleLayoutResult = {
  runDimensions: RunDimensions[];
  laneCount: number;
};

class ScheduleLayoutBlock {
  id: string;

  runIds: number[];

  timespan: FiniteTimespan;

  schedule: Schedule;

  hiddenEventRunIds: number[];

  hiddenEventsFakeRunId: number | undefined;

  interval: moment.Duration;

  constructor(id: string, timespan: FiniteTimespan, runIds: number[], schedule: Schedule) {
    this.id = id;
    this.runIds = [];
    this.timespan = timespan;
    this.hiddenEventRunIds = [];
    this.interval = moment.duration(1, 'hour');
    this.schedule = schedule;

    const sortedRunIds = sortBy(
      runIds,
      (runId) => schedule.getRunTimespan(runId)?.start.toDate().getTime() ?? 0,
    );
    sortedRunIds.forEach((runId) => {
      const runTimespan = schedule.getRunTimespan(runId);
      if (runTimespan) {
        this.addRun(runId, runTimespan);
      }
    });
  }

  addRun(runId: number, timespan: FiniteTimespan) {
    if (!this.schedule.shouldShowRun(runId)) {
      const existingFakeRunTimespan = this.hiddenEventsFakeRunId
        ? this.schedule.getRunTimespan(this.hiddenEventsFakeRunId)
        : undefined;
      if (existingFakeRunTimespan?.overlapsTimespan(timespan)) {
        this.hiddenEventRunIds.push(runId);
        const run = this.schedule.getRun(this.hiddenEventsFakeRunId!)!;
        const event = this.schedule.getEvent(run.event_id)!;
        event.title = `+ ${this.hiddenEventRunIds.length} not shown`;
        const expandedTimespan = existingFakeRunTimespan.expandedToFit(timespan);
        this.schedule.runTimespansById.set(this.hiddenEventsFakeRunId!, expandedTimespan);

        return;
      }

      const newFakeRunId = this.schedule.addFakeRun(timespan, '+ 1 not shown');

      this.hiddenEventsFakeRunId = newFakeRunId;
      this.hiddenEventRunIds = [runId];
      this.runIds.push(newFakeRunId);
    } else {
      this.runIds.push(runId);
    }

    this.timespan = this.timespan.expandedToFit(timespan);
  }

  getRunCountInTimespan(event: ScheduleEvent, timespan: FiniteTimespan) {
    return event.runs.filter((run) => {
      const runTimespan = this.schedule.getRunTimespan(run.id);
      if (!runTimespan) {
        return false;
      }

      return runTimespan.overlapsTimespan(timespan);
    }).length;
  }

  getTimeSortedRunIds() {
    return [...this.runIds].sort((a, b) => {
      const aTimespan = this.schedule.getRunTimespan(a);
      const bTimespan = this.schedule.getRunTimespan(b);
      if (aTimespan && !bTimespan) {
        return 1;
      }
      if (!aTimespan && bTimespan) {
        return -1;
      }
      if (!aTimespan || !bTimespan) {
        return 0;
      }
      const timeDiff = aTimespan.start.diff(bTimespan.start);

      if (timeDiff === 0) {
        // use number of overlapping runs as a tiebreaker (more runs first)
        const eventA = this.schedule.getEventForRun(a);
        const eventB = this.schedule.getEventForRun(b);
        if (eventA && !eventB) {
          return 1;
        }
        if (!eventA && eventB) {
          return -1;
        }
        if (!eventA || !eventB) {
          return 0;
        }
        if (eventA.fake && !eventB.fake) {
          return 1;
        }

        if (eventB.fake && !eventA.fake) {
          return -1;
        }

        const eventAOverlappingRunCount = this.getRunCountInTimespan(
          eventA,
          bTimespan.expand(1, 'hour'),
        );
        const eventBOverlappingRunCount = this.getRunCountInTimespan(
          eventB,
          aTimespan.expand(1, 'hour'),
        );
        const runCountDiff = eventBOverlappingRunCount - eventAOverlappingRunCount;

        if (runCountDiff === 0) {
          // finally, use event title as a tiebreaker
          const titleDiff = normalizeTitle(eventA.title ?? '').localeCompare(
            normalizeTitle(eventB.title ?? ''),
            undefined,
            { sensitivity: 'base' },
          );

          if (titleDiff === 0) {
            // as a tiebreaker, sort longer events first
            const lengthDiff = bTimespan.finish.diff(aTimespan.finish);

            return lengthDiff;
          }

          return titleDiff;
        }

        return runCountDiff;
      }

      return timeDiff;
    });
  }

  computeLayout(): ScheduleLayoutResult {
    const columnReservations = new ColumnReservationSet();
    const myLength = this.timespan.getLength('millisecond');
    let maxColumns = 0;

    const runDimensions = this.getTimeSortedRunIds().map((runId) => {
      const runTimespan = this.schedule.getRunTimespan(runId)!;
      const now = runTimespan.start;
      columnReservations.expire(now);

      const displayLength = Math.max(MIN_LENGTH, runTimespan.getLength('millisecond'));
      const displayTimespan = runTimespan.clone();
      displayTimespan.finish = displayTimespan.start.clone().add(displayLength);

      const laneIndex = columnReservations.findFreeColumnForTimespan(runTimespan);
      columnReservations.reserve(laneIndex, runId, displayTimespan);

      if (laneIndex + 1 > maxColumns) {
        maxColumns = laneIndex + 1;
      }

      return {
        runId,
        timespan: runTimespan,
        laneIndex,
        timeAxisStartPercent: (runTimespan.start.diff(this.timespan.start) / myLength) * 100.0,
        timeAxisSizePercent: (displayLength / myLength) * 100.0,
      };
    });

    return { runDimensions, laneCount: maxColumns };
  }
}

export default ScheduleLayoutBlock;