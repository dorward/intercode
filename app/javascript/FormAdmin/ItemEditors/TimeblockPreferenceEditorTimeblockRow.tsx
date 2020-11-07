import { useCallback, useMemo, useContext } from 'react';
import * as React from 'react';
import moment from 'moment-timezone';

import TimeSelect from '../../BuiltInFormControls/TimeSelect';
import { useConfirm } from '../../ModalDialogs/Confirm';
import Timespan from '../../Timespan';
import useSortable from '../../useSortable';
import AppRootContext from '../../AppRootContext';
import { TimeblockDefinition } from '../../FormPresenter/TimeblockTypes';
import { WithGeneratedId } from '../../GeneratedIdUtils';

function useTimeblockPropertyUpdater(
  onChange: (generatedId: string, updater: React.SetStateAction<TimeblockDefinition>) => void,
  generatedId: string,
  property: keyof TimeblockDefinition,
) {
  return useCallback(
    (value) =>
      onChange(generatedId, (prevTimeblock) => ({
        ...prevTimeblock,
        [property]: value,
      })),
    [generatedId, onChange, property],
  );
}

export type TimeblockPreferenceEditorTimeblockRowProps = {
  timeblock: WithGeneratedId<TimeblockDefinition, string>;
  index: number;
  onChange: (generatedId: string, updater: React.SetStateAction<TimeblockDefinition>) => void;
  deleteTimeblock: (generatedId: string) => void;
  moveTimeblock: (dragIndex: number, hoverIndex: number) => void;
};

function TimeblockPreferenceEditorTimeblockRow({
  timeblock,
  index,
  onChange,
  deleteTimeblock,
  moveTimeblock,
}: TimeblockPreferenceEditorTimeblockRowProps) {
  const { timezoneName } = useContext(AppRootContext);
  const confirm = useConfirm();
  const startChanged = useTimeblockPropertyUpdater(onChange, timeblock.generatedId, 'start');
  const finishChanged = useTimeblockPropertyUpdater(onChange, timeblock.generatedId, 'finish');
  const labelChanged = useTimeblockPropertyUpdater(onChange, timeblock.generatedId, 'label');
  const [rowRef, drag, { isDragging }] = useSortable<HTMLTableRowElement>(
    index,
    moveTimeblock,
    'timeblock',
  );

  const selectTimespan = useMemo(
    () =>
      Timespan.finiteFromMoments(
        moment.tz({ hour: 0 }, timezoneName),
        moment.tz({ hour: 0 }, timezoneName).add(31, 'hours'),
      ),
    [timezoneName],
  );

  const timespanError = useMemo(() => {
    if (!timeblock.start || !timeblock.finish) {
      return null;
    }

    try {
      // eslint-disable-next-line no-new
      new Timespan(
        moment.tz(timeblock.start, timezoneName),
        moment.tz(timeblock.finish, timezoneName),
      );
    } catch (e) {
      return e.message;
    }

    return null;
  }, [timeblock, timezoneName]);

  return (
    <tr ref={rowRef}>
      <td style={{ cursor: isDragging ? 'grabbing' : 'grab' }} ref={drag}>
        <span className="sr-only">Drag to reorder</span>
        <i className="fa fa-bars" />
      </td>
      <td>
        <TimeSelect
          value={timeblock.start}
          onChange={(value) => startChanged(value)}
          timespan={selectTimespan}
        />
        {timespanError && (
          <div className="small text-danger mt-1">
            <i className="fa fa-warning" /> {timespanError}
          </div>
        )}
      </td>
      <td>
        <TimeSelect
          value={timeblock.finish}
          onChange={(value) => finishChanged(value)}
          timespan={selectTimespan}
        />
      </td>
      <td>
        <input
          aria-label="Timeblock label"
          value={timeblock.label || ''}
          className="form-control"
          onChange={(event) => labelChanged(event.target.value)}
        />
      </td>
      <td>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          aria-label="Delete timeblock"
          onClick={() =>
            confirm({
              prompt: 'Are you sure you want to delete this timeblock?',
              action: () => deleteTimeblock(timeblock.generatedId),
            })
          }
        >
          <i className="fa fa-trash-o" />
        </button>
      </td>
    </tr>
  );
}

export default TimeblockPreferenceEditorTimeblockRow;
