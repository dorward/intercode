import * as React from 'react';
import { FormEditorQueryQuery } from './queries.generated';
import { FormType, TimezoneMode } from '../graphqlTypes.generated';
import type {
  AgeRestrictionsFormItem,
  DateFormItem,
  EventEmailFormItem,
  FormTypeDefinition,
  FreeTextFormItem,
  MultipleChoiceFormItem,
  ParsedFormItemWithGeneratedIds,
  RegistrationPolicyFormItem,
  StaticTextFormItem,
  TimeblockPreferenceFormItem,
  TimespanFormItem,
  TypedFormItem,
  WithRequiredProperties,
} from './FormItemUtils';
import FormTypes from '../../../config/form_types.json';

export type FormEditorForm = Omit<FormEditorQueryQuery['form'], 'form_sections'> & {
  form_sections: (Omit<FormEditorQueryQuery['form']['form_sections'][0], 'form_items'> & {
    form_items: TypedFormItem[];
  })[];
};

export type FormEditorFormItem =
  | ParsedFormItemWithGeneratedIds<WithRequiredProperties<AgeRestrictionsFormItem>>
  | ParsedFormItemWithGeneratedIds<WithRequiredProperties<DateFormItem>>
  | ParsedFormItemWithGeneratedIds<WithRequiredProperties<EventEmailFormItem>>
  | ParsedFormItemWithGeneratedIds<WithRequiredProperties<FreeTextFormItem>>
  | ParsedFormItemWithGeneratedIds<WithRequiredProperties<MultipleChoiceFormItem>>
  | ParsedFormItemWithGeneratedIds<WithRequiredProperties<RegistrationPolicyFormItem>>
  | ParsedFormItemWithGeneratedIds<WithRequiredProperties<StaticTextFormItem>>
  | ParsedFormItemWithGeneratedIds<WithRequiredProperties<TimeblockPreferenceFormItem>>
  | ParsedFormItemWithGeneratedIds<WithRequiredProperties<TimespanFormItem>>;

export type FormEditorContextValue = {
  convention: NonNullable<FormEditorQueryQuery['convention']>;
  currentSection?: FormEditorForm['form_sections'][0];
  form: FormEditorForm;
  formType: FormTypeDefinition;
  formItemsById: Map<number, TypedFormItem>;
};

export const FormEditorContext = React.createContext<FormEditorContextValue>({
  convention: {
    __typename: 'Convention',
    id: 0,
    name: '',
    timezone_mode: TimezoneMode.UserLocal,
  },
  currentSection: undefined,
  form: {
    __typename: 'Form',
    id: 0,
    title: '',
    form_type: FormType.Event,
    form_sections: [],
  },
  formType: FormTypes.event,
  formItemsById: new Map(),
});

export type FormItemEditorContextValue = {
  formItem: FormEditorFormItem;
  previewFormItem?: TypedFormItem;
  setFormItem: React.Dispatch<React.SetStateAction<FormEditorFormItem>>;
  standardItem?: any;
  disabled: boolean;
};

export const FormItemEditorContext = React.createContext<FormItemEditorContextValue>({
  formItem: {
    __typename: 'FormItem',
    id: 0,
    item_type: 'static_text',
    properties: {
      content: '',
      style: 'normal',
    },
    rendered_properties: {
      content: '',
      style: 'normal',
    },
  },
  previewFormItem: {
    __typename: 'FormItem',
    id: 0,
    item_type: 'static_text',
    rendered_properties: {
      content: '',
      style: 'normal',
    },
  },
  setFormItem: () => {},
  standardItem: undefined,
  disabled: false,
});
