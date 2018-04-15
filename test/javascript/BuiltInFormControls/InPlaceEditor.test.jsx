import React from 'react';
import { mount } from 'enzyme';
import InPlaceEditor from '../../../app/javascript/BuiltInFormControls/InPlaceEditor';

describe('InPlaceEditor', () => {
  const onChange = jest.fn();
  beforeEach(onChange.mockReset);

  const renderEditor = props => mount(<InPlaceEditor
    value="someValue"
    onChange={onChange}
    {...props}
  />);

  test('it renders just the value by default', () => {
    const component = renderEditor();
    expect(component.text()).toEqual('someValue');
    expect(component.find('input').length).toEqual(0);
  });

  test('it renders children rather than the value if they are passed', () => {
    const component = renderEditor({ children: (<a href="http://homestarrunner.com">its dot net</a>) });
    expect(component.text()).toEqual('its dot net');
    expect(component.find('a').length).toEqual(1);
    expect(component.find('input').length).toEqual(0);
  });

  test('it goes to editing mode when the edit button is clicked', () => {
    const component = renderEditor();
    component.find('button').simulate('click');
    expect(component.find('input').length).toEqual(1);
  });

  test('editing the text works', () => {
    const component = renderEditor();
    component.find('button').simulate('click');
    component.find('input').simulate('change', { target: { value: 'someOtherValue' } });
    component.find('button.btn-primary').simulate('click');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('someOtherValue');
  });

  test('reverting the changes works', () => {
    const component = renderEditor();
    component.find('button').simulate('click');
    component.find('input').simulate('change', { target: { value: 'someOtherValue' } });
    component.find('button.btn-secondary').simulate('click');
    expect(onChange).not.toHaveBeenCalled();
    expect(component.find('input').length).toEqual(0);
  });

  test('pressing enter commits the changes', () => {
    const component = renderEditor();
    component.find('button').simulate('click');
    component.find('input').simulate('change', { target: { value: 'someOtherValue' } });
    component.find('input').simulate('keyDown', { key: 'Enter' });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('someOtherValue');
  });

  test('pressing escape reverts the changes', () => {
    const component = renderEditor();
    component.find('button').simulate('click');
    component.find('input').simulate('change', { target: { value: 'someOtherValue' } });
    component.find('input').simulate('keyDown', { key: 'Escape' });
    expect(onChange).not.toHaveBeenCalled();
    expect(component.find('input').length).toEqual(0);
  });
});
