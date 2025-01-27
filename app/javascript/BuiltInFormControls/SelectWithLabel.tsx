import { ReactNode } from 'react';
import Select, { Props } from 'react-select';

import FormGroupWithLabel from './FormGroupWithLabel';

export type SelectWithLabelProps<OptionType, IsMulti extends boolean> = Props<
  OptionType,
  IsMulti
> & {
  label: ReactNode;
  helpText?: ReactNode;
};

function SelectWithLabel<OptionType, IsMulti extends boolean = false>({
  label,
  helpText,
  ...otherProps
}: SelectWithLabelProps<OptionType, IsMulti>) {
  return (
    <FormGroupWithLabel label={label} name={otherProps.name} helpText={helpText}>
      {(id) => <Select<OptionType, IsMulti> inputId={id} {...otherProps} />}
    </FormGroupWithLabel>
  );
}

export default SelectWithLabel;
