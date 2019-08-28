import React from 'react';
import PropTypes from 'prop-types';
import BootstrapFormCheckbox from './BootstrapFormCheckbox';

class ChoiceSet extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    choices: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
      value: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    }).isRequired).isRequired,
    value: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    ]),
    onChange: PropTypes.func.isRequired,
    multiple: PropTypes.bool,
    choiceClassName: PropTypes.string,
    inputClassName: PropTypes.string,
    disabled: PropTypes.bool,
  };

  static defaultProps = {
    name: null,
    value: null,
    multiple: false,
    choiceClassName: null,
    inputClassName: null,
    disabled: false,
  };

  onChange = (event) => {
    if (this.props.multiple) {
      if (event.target.checked) {
        this.props.onChange([...(this.props.value || []), event.target.value]);
      } else {
        this.props.onChange((this.props.value || []).filter(value => value !== event.target.value));
      }
    } else {
      this.props.onChange(event.target.value);
    }
  }

  render = () => {
    const choiceType = this.props.multiple ? 'checkbox' : 'radio';

    const options = this.props.choices.map(({ label, value, disabled = false }) => (
      <BootstrapFormCheckbox
        key={`${value}`}
        name={this.props.name}
        type={choiceType}
        className={this.props.choiceClassName}
        inputClassName={this.props.inputClassName}
        label={label}
        value={value}
        checked={(
          this.props.multiple
            ? ((this.props.value || []).includes(value))
            : this.props.value === value
        )}
        onChange={this.onChange}
        disabled={this.props.disabled || disabled}
      />
    ));

    return (
      <div>
        {options}
      </div>
    );
  }
}

export default ChoiceSet;