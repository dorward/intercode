import React, { useMemo, useCallback, useContext } from 'react';
import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';

import { getValidTimeblockColumns } from '../../FormPresenter/TimeblockUtils';
import ChoiceSet from '../../BuiltInFormControls/ChoiceSet';
import Timespan from '../../Timespan';
import { timespanFromConvention } from '../../TimespanUtils';
import { TimeblockDefinition } from '../../FormPresenter/TimeblockTypes';
import { FormEditorContext } from '../FormEditorContexts';
import AppRootContext from '../../AppRootContext';
import { FormItemEditorProps } from '../FormItemEditorProps';
import { TimeblockPreferenceFormItem } from '../FormItemUtils';
import { notEmpty } from '../../ValueUtils';

export type TimeblockPreferenceEditorOmissionsRowProps = FormItemEditorProps<
  TimeblockPreferenceFormItem
> & {
  timeblock: TimeblockDefinition;
};
function TimeblockPreferenceEditorOmissionsRow({
  formItem,
  setFormItem,
  timeblock,
}: TimeblockPreferenceEditorOmissionsRowProps) {
  const { timezoneName } = useContext(AppRootContext);
  const { convention } = useContext(FormEditorContext);

  const conventionTimespan = useMemo(() => timespanFromConvention(convention), [convention]);

  const omissionDates = useMemo(
    () =>
      (formItem.properties.omit_timeblocks || [])
        .filter((omission) => omission.label === timeblock.label)
        .map((omission) => omission.date),
    [formItem.properties.omit_timeblocks, timeblock.label],
  );

  const omissionDatesChanged = useCallback(
    (newOmissionDates: string[]) => {
      setFormItem((prevFormItem) => {
        const prevOmissions = prevFormItem.properties.omit_timeblocks || [];
        const newOmissions = [
          ...prevOmissions.filter((omission) => omission.label !== timeblock.label),
          ...newOmissionDates.map((date) => ({
            generatedId: uuidv4(),
            label: timeblock.label,
            date,
          })),
        ];
        return {
          ...prevFormItem,
          properties: {
            ...prevFormItem.properties,
            omit_timeblocks: newOmissions,
          },
        };
      });
    },
    [setFormItem, timeblock.label],
  );

  const columns = useMemo(() => getValidTimeblockColumns(convention, formItem), [
    convention,
    formItem,
  ]);

  const choices = useMemo(
    () =>
      columns
        .map((column) => {
          const dayStart = moment.tz(column.dayStart, timezoneName);
          const start = moment(dayStart).add(timeblock.start);
          const finish = moment(dayStart).add(timeblock.finish);
          if (start.isAfter(finish)) {
            return undefined;
          }
          const timespan = Timespan.fromMoments(start, finish);

          return {
            label: dayStart.format('dddd'),
            value: dayStart.format('YYYY-MM-DD'),
            disabled: !timespan.overlapsTimespan(conventionTimespan),
          };
        })
        .filter(notEmpty),
    [columns, timezoneName, conventionTimespan, timeblock.finish, timeblock.start],
  );

  const inclusionDates = useMemo(
    () =>
      choices
        .filter(({ value, disabled }) => !disabled && !omissionDates.includes(value))
        .map(({ value }) => value),
    [choices, omissionDates],
  );

  const inclusionDatesChanged = useCallback(
    (newInclusionDates) => {
      omissionDatesChanged(
        choices.filter(({ value }) => !newInclusionDates.includes(value)).map(({ value }) => value),
      );
    },
    [choices, omissionDatesChanged],
  );

  return (
    <tr>
      <td className="border-top-0 pt-0" />
      <td colSpan={4} className="border-top-0 pt-0">
        <div className="d-flex">
          <span className="mr-2">Offer on:</span>
          <ChoiceSet
            choiceClassName="form-check-inline"
            multiple
            choices={choices}
            value={inclusionDates}
            onChange={inclusionDatesChanged}
          />
        </div>
      </td>
    </tr>
  );
}

export default TimeblockPreferenceEditorOmissionsRow;
