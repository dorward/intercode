import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { DateTime } from 'luxon';

import { ScheduleGridContext } from './ScheduleGridContext';
import { PIXELS_PER_HOUR, PIXELS_PER_LANE } from './LayoutConstants';
import ScheduleGridHeaderBlock from './ScheduleGridHeaderBlock';
import ScheduleBlock from './ScheduleBlock';
import usePageTitle from '../../usePageTitle';
import useLayoutForTimespan from './useLayoutForTimespan';
import ScheduleGridEventRun from './ScheduleGridEventRun';

function ScheduleGrid({ timespan }) {
  const { config, schedule } = useContext(ScheduleGridContext);

  usePageTitle(config.title);

  const layout = useLayoutForTimespan(schedule, timespan);

  return (
    <div className="schedule-grid" style={{ overflowX: 'auto' }}>
      <div className="schedule-grid-content" style={{ backgroundSize: `${PIXELS_PER_HOUR}px ${PIXELS_PER_LANE}px` }}>
        <div className="mt-1 d-flex">
          {
            schedule.shouldUseRowHeaders()
              ? (<div style={{ width: `${PIXELS_PER_HOUR}px`, minWidth: `${PIXELS_PER_HOUR}px` }} />)
              : null
          }
          <ScheduleGridHeaderBlock timespan={layout.timespan} eventRuns={layout.eventRuns} />
        </div>
        {layout.blocksWithOptions.map(([scheduleBlock, options]) => (
          <div className={classNames('d-flex', { 'flex-grow-1': (options || {}).flexGrow })} key={scheduleBlock.id}>
            <ScheduleBlock
              scheduleBlock={scheduleBlock}
              rowHeader={options.rowHeader}
              renderEventRun={({ layoutResult, runDimensions }) => (
                <ScheduleGridEventRun
                  layoutResult={layoutResult}
                  runDimensions={runDimensions}
                />
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

ScheduleGrid.propTypes = {
  timespan: PropTypes.shape({
    clone: PropTypes.func.isRequired,
  }).isRequired,
};

export default ScheduleGrid;
