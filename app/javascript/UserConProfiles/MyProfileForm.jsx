import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { isEqual, flowRight } from 'lodash';
import buildFormStateFromData from './buildFormStateFromData';
import FormController from '../FormPresenter/FormController';
import FormPresenterApp from '../FormPresenter';
import FormPresenter from '../FormPresenter/Layouts/FormPresenter';
import GraphQLQueryResultWrapper from '../GraphQLQueryResultWrapper';
import GraphQLResultPropType from '../GraphQLResultPropType';
import { myProfileQuery } from './queries';
import { updateUserConProfileMutation } from './mutations';

function parseResponseErrors(error) {
  const { graphQLErrors } = error;
  const updateError = graphQLErrors.find(graphQLError => isEqual(graphQLError.path, ['updateUserConProfile']));
  const { validationErrors } = (updateError || {});
  return validationErrors;
}

@flowRight([
  graphql(myProfileQuery),
  graphql(updateUserConProfileMutation, {
    props: ({ mutate }) => ({
      updateUserConProfile: userConProfile => mutate({
        variables: {
          input: {
            id: userConProfile.id,
            user_con_profile: {
              form_response_attrs_json: JSON.stringify(userConProfile.form_response_attrs),
            },
          },
        },
      }),
    }),
  }),
])
@GraphQLQueryResultWrapper
class MyProfileForm extends React.Component {
  static propTypes = {
    data: GraphQLResultPropType(myProfileQuery).isRequired,
    updateUserConProfile: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      ...buildFormStateFromData(props.data.myProfile, props.data.convention),
    };
  }

  responseValuesChanged = (newResponseValues, callback) => {
    this.setState({
      userConProfile: {
        ...this.state.userConProfile,
        form_response_attrs: {
          ...this.state.userConProfile.form_response_attrs,
          ...newResponseValues,
        },
      },
    }, callback);
  }

  updateUserConProfile = () => this.props.updateUserConProfile(this.state.userConProfile)

  render = () => (
    <FormController
      form={this.state.form}
      convention={this.state.convention}
      response={this.state.userConProfile.form_response_attrs}
      responseValuesChanged={this.responseValuesChanged}
      updateResponse={this.updateUserConProfile}
      parseResponseErrors={parseResponseErrors}
      submitForm={() => {}}
      autocommit="change"

      renderContent={formPresenterProps => (
        <FormPresenterApp form={this.state.form}>
          <FormPresenter {...formPresenterProps} />
        </FormPresenterApp>
      )}
    />
  )
}

export default MyProfileForm;
