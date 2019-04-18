import React from 'react';
import moment from 'moment-timezone';

import { render, fireEvent } from '../testUtils';
import ConventionForm from '../../../app/javascript/ConventionAdmin/ConventionForm';

describe('ConventionForm', () => {
  const defaultInitialConvention = {
    starts_at: '',
    ends_at: '',
    name: '',
    domain: '',
    timezone_name: '',
    accepting_proposals: false,
    show_schedule: 'no',
    show_event_list: 'no',
    maximum_event_signups: {
      timespans: [
        { start: null, finish: null, value: 'unlimited' },
      ],
    },
    maximum_tickets: null,
    ticket_name: 'ticket',
    default_layout_id: null,
    root_page_id: null,
  };

  const renderConventionForm = (props, initialConventionProps) => render(
    <ConventionForm
      initialConvention={{ ...defaultInitialConvention, ...initialConventionProps }}
      saveConvention={() => {}}
      cmsLayouts={[]}
      pages={[]}
      {...props}
    />,
  );

  test('it renders the given values', () => {
    const now = moment.tz('2019-04-18T18:34:04.283Z', 'UTC').toISOString();
    const { getByLabelText, getByText, getMultipleChoiceInput } = renderConventionForm({}, {
      starts_at: now,
      ends_at: now,
      name: 'myName',
      domain: 'myDomain',
      timezone_name: 'UTC',
      accepting_proposals: true,
      show_schedule: 'gms',
      maximum_event_signups: {
        timespans: [
          { start: null, finish: now, value: 'not_yet' },
          { start: now, finish: null, value: 'unlimited' },
        ],
      },
      maximum_tickets: 100,
    });

    expect(getByLabelText('Convention starts').value).toEqual('2019-04-18');
    expect(getByLabelText('Convention ends').value).toEqual('2019-04-18');
    expect(getByLabelText('Name').value).toEqual('myName');
    expect(getByLabelText('Convention domain name').value).toEqual('myDomain');
    expect(getByLabelText('Time zone').closest('.form-group')).toHaveTextContent('Time zone[UTC-00:00] UTC');

    fireEvent.click(getByText('Events'));

    expect(getMultipleChoiceInput('Accepting event proposals', 'Yes').checked).toBe(true);
    expect(getMultipleChoiceInput(
      'Show event schedule',
      'Only to event team members and users with any privileges',
    ).checked).toBe(true);

    fireEvent.click(getByText('Payments'));
    expect(getByLabelText('Maximum tickets').value).toEqual('100');
  });

  test('mutating form fields', () => {
    const { getByText, getMultipleChoiceInput } = renderConventionForm();

    fireEvent.click(getByText('Events'));
    expect(getMultipleChoiceInput('Accepting event proposals', 'Yes').checked).toBe(false);
    fireEvent.change(getMultipleChoiceInput('Accepting event proposals', 'Yes'), { target: { checked: true } });
    expect(getMultipleChoiceInput('Accepting event proposals', 'Yes').checked).toBe(true);
  });

  test('onClickSave', () => {
    const saveConvention = jest.fn();
    const { getByText } = renderConventionForm({ saveConvention });

    fireEvent.click(getByText('Save settings'), { selector: 'button' });
    expect(saveConvention).toHaveBeenCalledTimes(1);
    expect(saveConvention).toHaveBeenCalledWith(defaultInitialConvention);
  });
});
