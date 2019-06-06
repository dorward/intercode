import React from 'react';
import { mount } from 'enzyme';
import moment from 'moment';
import buildTestScheduledValueInput from './buildTestScheduledValueInput';
import ScheduledValueEditor, { scheduledValueIsValid } from '../../../app/javascript/BuiltInFormControls/ScheduledValueEditor';
import ScheduledValueTimespanRow from '../../../app/javascript/BuiltInFormControls/ScheduledValueTimespanRow';

describe('ScheduledValueEditor', () => {
  const renderScheduledValueEditor = props => mount((
    <ScheduledValueEditor
      scheduledValue={{ timespans: [] }}
      timezone="UTC"
      setScheduledValue={() => {}}
      buildValueInput={buildTestScheduledValueInput}
      {...props}
    />
  ));

  test('it renders the correct values', () => {
    const cutoff = moment();
    const component = renderScheduledValueEditor({
      scheduledValue: {
        timespans: [
          { value: 1, start: null, finish: cutoff.toISOString() },
          { value: 2, start: cutoff.toISOString(), finish: null },
        ],
      },
    });

    expect(component.find(ScheduledValueTimespanRow).length).toEqual(2);
    expect(component.find('input.testInput').map(input => input.props().value)).toEqual([1, 2]);
  });

  test('adding a row', () => {
    const setScheduledValue = jest.fn();
    const component = renderScheduledValueEditor({ setScheduledValue });
    const button = component.find('button').filterWhere(b => b.text() === 'Add row');
    button.simulate('click');
    expect(setScheduledValue).toHaveBeenCalledWith({
      timespans: [
        { value: null, start: null, finish: null },
      ],
    });
  });

  test('deleting a row', () => {
    const setScheduledValue = jest.fn();
    const component = renderScheduledValueEditor({
      scheduledValue: {
        timespans: [
          { value: 'something', start: null, finish: null },
        ],
      },
      setScheduledValue,
    });
    component.find('.btn-danger').simulate('click');
    expect(setScheduledValue).toHaveBeenCalledWith({ timespans: [] });
  });

  test('changing something in a row', () => {
    const setScheduledValue = jest.fn();
    const component = renderScheduledValueEditor({
      scheduledValue: {
        timespans: [
          { value: 'something', start: null, finish: null },
        ],
      },
      setScheduledValue,
    });
    component.find('input.testInput').simulate('change', { target: { value: 'something else' } });
    expect(setScheduledValue).toHaveBeenCalledWith({
      timespans: [
        { value: 'something else', start: null, finish: null },
      ],
    });
  });

  describe('scheduledValueIsValid', () => {
    test('it requires at least one timespan', () => {
      expect(scheduledValueIsValid({ timespans: null })).toBeFalsy();
      expect(scheduledValueIsValid({ timespans: [] })).toBeFalsy();
      expect(scheduledValueIsValid({})).toBeFalsy();
    });

    test('it requires every timespan have a value', () => {
      expect(scheduledValueIsValid({
        timespans: [{ start: null, finish: null, value: null }],
      })).toBeFalsy();

      expect(scheduledValueIsValid({
        timespans: [
          { start: null, finish: null, value: null },
          { start: null, finish: null, value: 6 },
        ],
      })).toBeFalsy();
    });

    test('it passes if every timespan has a value', () => {
      expect(scheduledValueIsValid({
        timespans: [
          { start: null, finish: null, value: 6 },
        ],
      })).toBeTruthy();
    });
  });
});
