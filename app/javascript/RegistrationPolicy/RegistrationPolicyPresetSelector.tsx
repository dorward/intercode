import * as React from 'react';

import useUniqueId from '../useUniqueId';
import { RegistrationPolicyPreset } from '../FormAdmin/FormItemUtils';

export type RegistrationPolicyPresetSelectorProps = {
  presets?: RegistrationPolicyPreset[];
  preset?: RegistrationPolicyPreset;
  presetSelected: React.Dispatch<React.ChangeEvent<HTMLSelectElement>>;
  allowCustom: boolean;
  custom: boolean;
};

function RegistrationPolicyPresetSelector({
  presets,
  preset,
  presetSelected,
  allowCustom,
  custom,
}: RegistrationPolicyPresetSelectorProps) {
  const presetSelectorId = useUniqueId('preset-');

  if (!presets) {
    return null;
  }

  if (presets.length === 1 && !allowCustom) {
    return null;
  }

  let selectorValue;
  if (preset) {
    selectorValue = preset.name;
  } else if (custom) {
    selectorValue = '_custom';
  }

  const presetOptions = presets.map((p) => (
    <option value={p.name} key={p.name}>
      {p.name}
    </option>
  ));
  if (allowCustom) {
    presetOptions.push(
      <option value="_custom" key="_custom">
        Custom registration policy (advanced)
      </option>,
    );
  }

  return (
    <div className="form-group">
      <label htmlFor={presetSelectorId}>
        Select policy
        <select
          id={presetSelectorId}
          className="form-control"
          value={selectorValue || ''}
          onChange={presetSelected}
        >
          <option value="" disabled>
            Select one...
          </option>
          {presetOptions}
        </select>
      </label>
    </div>
  );
}

export default RegistrationPolicyPresetSelector;
