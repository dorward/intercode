import React, { useMemo, useCallback } from 'react';

import CaptionLegend from './CaptionLegend';
import {
  describeTimeblock,
  getColumnHeader,
  getValidTimeblockColumns,
  rotateTimeblockColumnsToRows,
} from '../TimeblockUtils';
import {
  preferencesMatch,
  parseTimeblockPreference,
  serializeTimeblockPreference,
  ParsedTimeblockPreference,
  TimeblockPreferenceOrdinality,
} from '../TimeblockTypes';
import TimeblockPreferenceCell, {
  TimeblockPreferenceCellChangeCallback,
} from './TimeblockPreferenceCell';
import { CommonFormItemInputProps } from './CommonFormItemInputProps';
import { TimeblockPreferenceFormItem, FormItemValueType } from '../../FormAdmin/FormItemUtils';
import { ConventionForTimespanUtils } from '../../TimespanUtils';

function valueIsTimeblockPreferenceValue(
  value: unknown | undefined | null,
): value is FormItemValueType<TimeblockPreferenceFormItem> {
  if (value == null || typeof value !== 'object') {
    return false;
  }

  return ['start', 'finish', 'label', 'ordinality'].every(
    (field) =>
      Object.prototype.hasOwnProperty.call(value, field) && typeof value![field] === 'string',
  );
}

export type TimeblockPreferenceItemInputProps = CommonFormItemInputProps<
  TimeblockPreferenceFormItem
> & {
  convention: ConventionForTimespanUtils;
};

function TimeblockPreferenceItemInput({
  convention,
  formItem,
  value: uncheckedValue,
  onChange,
}: TimeblockPreferenceItemInputProps) {
  const value = useMemo(
    () => (valueIsTimeblockPreferenceValue(uncheckedValue) ? uncheckedValue : []),
    [uncheckedValue],
  );

  const preferences = useMemo(() => value.map(parseTimeblockPreference), [value]);

  const preferencesDidChange = useCallback(
    (newPreferences: ParsedTimeblockPreference[]) => {
      onChange(newPreferences.map(serializeTimeblockPreference));
    },
    [onChange],
  );

  const preferenceDidChange: TimeblockPreferenceCellChangeCallback = (
    newOrdinality,
    hypotheticalPreference,
  ) => {
    const existingPreference = preferences.find((p) => preferencesMatch(p, hypotheticalPreference));

    if (newOrdinality === '') {
      preferencesDidChange(preferences.filter((p) => !preferencesMatch(p, hypotheticalPreference)));
    } else if (existingPreference) {
      preferencesDidChange(
        preferences.map((p) => {
          if (preferencesMatch(p, hypotheticalPreference)) {
            return { ...p, ordinality: newOrdinality };
          }

          return p;
        }),
      );
    } else {
      preferencesDidChange([
        ...preferences,
        {
          ...hypotheticalPreference,
          ordinality: newOrdinality as TimeblockPreferenceOrdinality,
        },
      ]);
    }
  };

  const columns = useMemo(() => getValidTimeblockColumns(convention, formItem), [
    convention,
    formItem,
  ]);
  const rows = useMemo(() => rotateTimeblockColumnsToRows(formItem, columns), [columns, formItem]);

  return (
    <fieldset className="form-group">
      <CaptionLegend formItem={formItem} />
      <table className="table">
        <thead>
          <tr>
            <th />
            {columns.map((column) => (
              <th key={column.dayStart.toString()}>{getColumnHeader(column)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.timeblock.label}>
              <td>
                {row.timeblock.label}
                {formItem.rendered_properties.hide_timestamps ? null : (
                  <>
                    <br />
                    <small>{describeTimeblock(row.timeblock)}</small>
                  </>
                )}
              </td>
              {row.cells.map((cell, x) =>
                cell ? (
                  <TimeblockPreferenceCell
                    key={cell.dayStart.format('dddd')}
                    timeblock={cell.timeblock}
                    existingPreferences={preferences}
                    dayStart={cell.dayStart}
                    start={cell.timespan.start}
                    finish={cell.timespan.finish}
                    onChange={preferenceDidChange}
                  />
                ) : (
                  <td key={columns[x].dayStart.format('dddd')} />
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </fieldset>
  );
}

export default TimeblockPreferenceItemInput;