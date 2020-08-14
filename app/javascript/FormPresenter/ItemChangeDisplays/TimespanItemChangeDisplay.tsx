import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import TextDiffDisplay from './TextDiffDisplay';
import { describeTimespan } from '../ItemDisplays/TimespanItemDisplay';
import { ParsedFormResponseChange } from './FormItemChangeUtils';
import { TimespanFormItem } from '../../FormAdmin/FormItemUtils';

export type TimespanItemChangeDisplayProps = {
  change: ParsedFormResponseChange<TimespanFormItem>,
};

function TimespanItemChangeDisplay({ change }: TimespanItemChangeDisplayProps) {
  const before = useMemo(
    () => describeTimespan(change.previous_value || 0),
    [change.previous_value],
  );
  const after = useMemo(
    () => describeTimespan(change.new_value || 0),
    [change.new_value],
  );

  return <TextDiffDisplay before={before} after={after} />;
}

export default TimespanItemChangeDisplay;
