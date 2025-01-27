import { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { TFunction } from 'i18next';

import { useTranslation, Trans } from 'react-i18next';
import useUniqueId from '../../useUniqueId';
import FieldRequiredFeedback from './FieldRequiredFeedback';
import MarkdownInput from '../../BuiltInFormControls/MarkdownInput';
import RequiredIndicator from './RequiredIndicator';
import BootstrapFormInput from '../../BuiltInFormControls/BootstrapFormInput';
import { parseIntOrNull } from '../../ValueUtils';
import { CommonFormItemInputProps } from './CommonFormItemInputProps';
import { AgeRestrictionsFormItem, AgeRestrictionsValue } from '../../FormAdmin/FormItemUtils';

function getDefaultAgeRestrictionsDescription(minimumAge: number | null | undefined, t: TFunction) {
  if (!minimumAge) {
    return t('forms.ageRestrictions.noRestrictions', 'No age restrictions.');
  }

  return t('forms.ageRestrictions.minimumAgeDescription', 'Must be {{ count }} years or older.', {
    count: minimumAge,
  });
}

function valueIsAgeRestrictionsValue(
  value: unknown | undefined | null,
): value is AgeRestrictionsValue {
  // AgeRestrictionsValue has no required properties so literally any object will do
  return value != null && typeof value === 'object';
}

export type AgeRestrictionsInputProps = CommonFormItemInputProps<AgeRestrictionsFormItem>;

function AgeRestrictionsInput(props: AgeRestrictionsInputProps) {
  const { t } = useTranslation();
  const { formItem, onChange, onInteract, valueInvalid } = props;
  const value = useMemo(() => (valueIsAgeRestrictionsValue(props.value) ? props.value : {}), [
    props.value,
  ]);

  const descriptionId = useUniqueId(`${formItem.identifier}-description-`);

  const userInteracted = useCallback(() => onInteract(formItem.identifier), [
    onInteract,
    formItem.identifier,
  ]);

  const descriptionChanged = useCallback(
    (newDescription) => {
      onChange({ ...value, age_restrictions_description: newDescription });
      userInteracted();
    },
    [onChange, userInteracted, value],
  );

  const minimumAgeChanged = useCallback(
    (newMinimumAgeString) => {
      const newMinimumAge = parseIntOrNull(newMinimumAgeString);

      if (
        !value.age_restrictions_description ||
        value.age_restrictions_description.trim() === '' ||
        value.age_restrictions_description ===
          getDefaultAgeRestrictionsDescription(value.minimum_age, t)
      ) {
        onChange({
          ...value,
          age_restrictions_description: getDefaultAgeRestrictionsDescription(newMinimumAge, t),
          minimum_age: newMinimumAge,
        });
      } else {
        onChange({ ...value, minimum_age: newMinimumAge });
      }

      userInteracted();
    },
    [onChange, userInteracted, value, t],
  );

  return (
    <div className="card my-2">
      <div className="card-header py-0">
        <legend
          className="col-form-label"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: formItem.rendered_properties.caption }}
        />
      </div>

      <div className="card-body pb-1">
        <div className="form-group">
          <label htmlFor={descriptionId}>
            {t('forms.ageRestrictions.descriptionLabel', 'Publicly visible age restrictions text')}
            <RequiredIndicator formItem={formItem} />
          </label>
          <MarkdownInput
            value={value.age_restrictions_description || ''}
            onChange={descriptionChanged}
            onBlur={userInteracted}
            lines={1}
            formControlClassName={classNames({ 'is-invalid': valueInvalid })}
          >
            <FieldRequiredFeedback valueInvalid={valueInvalid} />
          </MarkdownInput>
        </div>

        <BootstrapFormInput
          value={value.minimum_age ? value.minimum_age.toString() : ''}
          onTextChange={minimumAgeChanged}
          type="number"
          min="0"
          label={t('forms.ageRestrictions.minimumAgeLabel', 'Minimum age')}
          helpText={
            <Trans i18nKey="forms.ageRestrictions.minimumAgeHelpText">
              If specified, the signups list will warn you if someone too young to play has signed
              up.{' '}
              <strong>The site does not enforce age restrictions; you must do so yourself.</strong>
            </Trans>
          }
        />
      </div>
    </div>
  );
}

export default AgeRestrictionsInput;
