import React from 'react';

import RegistrationPolicyDisplay from '../../RegistrationPolicy/RegistrationPolicyDisplay';
import { RegistrationPolicyFormItem, FormItemValueType } from '../../FormAdmin/FormItemUtils';

export type RegistrationPolicyItemDisplayProps = {
  formItem: RegistrationPolicyFormItem,
  value: FormItemValueType<RegistrationPolicyFormItem>,
};

function RegistrationPolicyItemDisplay({ formItem, value }: RegistrationPolicyItemDisplayProps) {
  return (
    <RegistrationPolicyDisplay
      registrationPolicy={value}
      presets={formItem.rendered_properties.presets}
    />
  );
}

export default RegistrationPolicyItemDisplay;
