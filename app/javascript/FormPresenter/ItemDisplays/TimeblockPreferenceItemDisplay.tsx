import { useMemo } from 'react';
import classNames from 'classnames';

import { preferencesMatch } from '../TimeblockTypes';
import {
  describeOrdinality,
  describeTimeblock,
  getColumnHeader,
  getValidTimeblockColumns,
  rotateTimeblockColumnsToRows,
  ConcreteTimeblock,
  TimeblockColumn,
} from '../TimeblockUtils';
import { TimeblockPreferenceFormItem, FormItemValueType } from '../../FormAdmin/FormItemUtils';
import { ConventionForTimespanUtils } from '../../TimespanUtils';

export type TimeblockPreferenceItemDisplayProps = {
  formItem: TimeblockPreferenceFormItem;
  convention: ConventionForTimespanUtils;
  value: FormItemValueType<TimeblockPreferenceFormItem>;
};

function TimeblockPreferenceItemDisplay({
  formItem,
  convention,
  value,
}: TimeblockPreferenceItemDisplayProps) {
  const renderCell = (cell: ConcreteTimeblock | null, column: TimeblockColumn) => {
    const key = column.dayStart.toFormat('cccc');
    if (cell == null) {
      return <td key={key} className="table-secondary" />;
    }

    const existingPreference = value.find((p) =>
      preferencesMatch(p, {
        start: cell.timespan.start,
        finish: cell.timespan.finish,
      }),
    );
    const { ordinality } = existingPreference || {};
    const ordinalityString = (ordinality || '').toString();

    return (
      <td
        key={key}
        className={classNames('align-middle', 'text-center', {
          'bg-success text-white': ordinalityString === '1',
          'table-success': ['2', '3'].includes(ordinalityString),
          'bg-danger text-white': ordinalityString === 'X',
        })}
      >
        <span
          className={classNames({
            'font-weight-bold': ['1', '2'].includes(ordinalityString),
          })}
        >
          {describeOrdinality(ordinality)}
        </span>
      </td>
    );
  };

  const columns = useMemo(() => getValidTimeblockColumns(convention, formItem), [
    convention,
    formItem,
  ]);
  const rows = useMemo(() => rotateTimeblockColumnsToRows(formItem, columns), [columns, formItem]);

  return (
    <table className="table table-sm">
      <thead>
        <tr>
          <th />
          {columns.map((column) => (
            <th key={column.dayStart.toString()} className="text-center">
              {getColumnHeader(column)}
            </th>
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
            {row.cells.map((cell, x) => renderCell(cell, columns[x]))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TimeblockPreferenceItemDisplay;
