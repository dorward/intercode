import { ReactNode } from 'react';

import SinglePageFormPresenter from '../FormPresenter/SinglePageFormPresenter';
import { useTabs, TabList, TabBody } from '../UIComponents/Tabs';
import { CommonFormFieldsFragment } from '../Models/commonFormFragments.generated';
import { FormResponse } from '../FormPresenter/useFormResponse';
import { ConventionForFormItemDisplay } from '../FormPresenter/ItemDisplays/FormItemDisplay';

export type UserConProfileFormProps<UserConProfileType extends FormResponse> = {
  form: CommonFormFieldsFragment;
  footerContent?: ReactNode;
  userConProfile: UserConProfileType;
  onChange: (userConProfile: UserConProfileType) => void;
  convention: ConventionForFormItemDisplay;
};

function UserConProfileForm<UserConProfileType extends FormResponse>(
  props: UserConProfileFormProps<UserConProfileType>,
) {
  const formResponseValuesChanged = (
    newResponseValues: UserConProfileType['form_response_attrs'],
  ) => {
    props.onChange({
      ...props.userConProfile,
      form_response_attrs: {
        ...props.userConProfile.form_response_attrs,
        ...newResponseValues,
      },
    });
  };

  const tabProps = useTabs([
    {
      name: 'Profile',
      id: 'profile',
      renderContent: () => (
        <SinglePageFormPresenter
          form={props.form}
          convention={props.convention}
          response={props.userConProfile}
          responseValuesChanged={formResponseValuesChanged}
        />
      ),
    },
  ]);

  return (
    <div>
      <TabList {...tabProps} />
      <div className="card border-top-0">
        <div className="card-body">
          <TabBody {...tabProps} />
        </div>
        <div className="card-footer">{props.footerContent}</div>
      </div>
    </div>
  );
}

export default UserConProfileForm;
