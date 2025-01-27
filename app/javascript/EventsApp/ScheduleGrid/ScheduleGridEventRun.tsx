import { useContext, useMemo, useCallback, Ref, useState } from 'react';

import { ScheduleGridContext } from './ScheduleGridContext';
import SignupCountData from '../SignupCountData';
import RunDetails from './RunDetails';
import RunDisplay from './RunDisplay';
import ScheduleLayoutBlock, {
  RunDimensions,
  ScheduleLayoutResult,
} from './ScheduleLayout/ScheduleLayoutBlock';
import { useIntercodePopper } from '../../UIComponents/PopperUtils';

export type ScheduleGridEventRunProps = {
  runDimensions: RunDimensions;
  layoutResult: ScheduleLayoutResult;
  scheduleLayoutBlock: ScheduleLayoutBlock;
};

function ScheduleGridEventRun({
  runDimensions,
  layoutResult,
  scheduleLayoutBlock,
}: ScheduleGridEventRunProps) {
  const { schedule, toggleRunDetailsVisibility, isRunDetailsVisible, config } = useContext(
    ScheduleGridContext,
  );
  const detailsVisible = useMemo(
    () =>
      isRunDetailsVisible({ runId: runDimensions.runId, scheduleBlockId: scheduleLayoutBlock.id }),
    [isRunDetailsVisible, runDimensions.runId, scheduleLayoutBlock.id],
  );

  const [runDisplayElement, setRunDisplayElement] = useState<HTMLDivElement | null>(null);
  const [runDetailsElement, setRunDetailsElement] = useState<HTMLDivElement | null>(null);
  const [arrow, setArrow] = useState<HTMLSpanElement | null>(null);

  const { styles, attributes, state, update } = useIntercodePopper(
    runDetailsElement,
    runDisplayElement,
    arrow,
  );

  const run = useMemo(() => schedule.getRun(runDimensions.runId), [schedule, runDimensions.runId]);
  const event = useMemo(() => schedule.getEventForRun(runDimensions.runId), [
    schedule,
    runDimensions.runId,
  ]);

  const signupCountData = useMemo(() => {
    if (!run) {
      return null;
    }

    return SignupCountData.fromRun(run);
  }, [run]);

  const toggleVisibility = useCallback(() => {
    const runId = run?.id;
    if (runId) {
      toggleRunDetailsVisibility({ runId, scheduleBlockId: scheduleLayoutBlock.id });
      if (update) {
        update();
      }
    }
  }, [run, toggleRunDetailsVisibility, update, scheduleLayoutBlock.id]);

  if (event == null || run == null) {
    return null;
  }

  const renderRunDisplay = (ref: Ref<HTMLDivElement>) => (
    <RunDisplay
      event={event}
      run={run}
      signupCountData={signupCountData!}
      ref={ref}
      toggle={toggleVisibility}
      runDimensions={runDimensions}
      layoutResult={layoutResult}
      classifyEventsBy={config.classifyEventsBy}
      showExtendedCounts={config.showExtendedCounts ?? false}
      showSignedUp={config.showSignedUp}
      showSignupStatusBadge={config.showSignupStatusBadge ?? false}
    />
  );

  if (run.disableDetailsPopup) {
    return renderRunDisplay(null);
  }

  return (
    <>
      {renderRunDisplay(setRunDisplayElement)}
      {detailsVisible && (
        <RunDetails
          ref={setRunDetailsElement}
          placement={state?.placement}
          styles={styles}
          attributes={attributes}
          arrowRef={setArrow}
          toggle={toggleVisibility}
          event={event}
          run={run}
          timespan={runDimensions.fullTimespan}
          signupCountData={signupCountData!}
        />
      )}
    </>
  );
}

export default ScheduleGridEventRun;
