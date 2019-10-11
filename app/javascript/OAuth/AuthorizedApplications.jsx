import React from 'react';
import { useQuery } from 'react-apollo-hooks';

import { OAuthAuthorizedApplicationsQuery } from './queries.gql';
import { useConfirm } from '../ModalDialogs/Confirm';
import ErrorDisplay from '../ErrorDisplay';
import PageLoadingIndicator from '../PageLoadingIndicator';
import PermissionsPrompt from './PermissionsPrompt';
import { RevokeAuthorizedApplication } from './mutations.gql';
import { useDeleteMutation } from '../MutationUtils';

function AuthorizedApplications() {
  const { data, loading, errors } = useQuery(OAuthAuthorizedApplicationsQuery);
  const revokeAuthorizedApplication = useDeleteMutation(RevokeAuthorizedApplication, {
    query: OAuthAuthorizedApplicationsQuery,
    arrayPath: ['myAuthorizedApplications'],
    idVariablePath: ['uid'],
    idAttribute: 'uid',
  });
  const confirm = useConfirm();

  if (loading) {
    return <PageLoadingIndicator />;
  }

  if (errors) {
    return <ErrorDisplay graphQLError={error} />;
  }

  const revokeClicked = (authorizedApplication) => {
    confirm({
      prompt: `Are you sure you want to revoke the authorization for ${authorizedApplication.name}?`,
      action: () => revokeAuthorizedApplication({ variables: { uid: authorizedApplication.uid } }),
      renderError: (error) => <ErrorDisplay graphQLError={error} />,
    });
  };

  return (
    <>
      <h1 className="mb-4">Authorized applications</h1>

      <table className="table table-striped">
        <thead>
          <th>Name</th>
          <th>Permissions</th>
          <th />
        </thead>
        <tbody>
          {
            data.myAuthorizedApplications.map((authorizedApplication) => (
              <tr key={authorizedApplication.uid}>
                <td>{authorizedApplication.name}</td>
                <td>
                  <PermissionsPrompt scopeNames={authorizedApplication.scopes} />
                </td>
                <td className="text-right">
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => revokeClicked(authorizedApplication)}
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </>
  );
}

export default AuthorizedApplications;