/* eslint-disable */
import * as Types from '../graphqlTypes.generated';

import { OrganizationRoleFieldsFragment } from './queries.generated';
import { gql } from '@apollo/client';
import { OrganizationRoleFieldsFragmentDoc } from './queries.generated';
import * as Apollo from '@apollo/client';
export type CreateOrganizationRoleMutationVariables = Types.Exact<{
  organizationId: Types.Scalars['Int'];
  name: Types.Scalars['String'];
  userIds: Array<Types.Scalars['Int']> | Types.Scalars['Int'];
  permissions: Array<Types.PermissionInput> | Types.PermissionInput;
}>;


export type CreateOrganizationRoleMutation = (
  { __typename: 'Mutation' }
  & { createOrganizationRole?: Types.Maybe<(
    { __typename: 'CreateOrganizationRolePayload' }
    & { organization_role: (
      { __typename: 'OrganizationRole' }
      & Pick<Types.OrganizationRole, 'id'>
      & OrganizationRoleFieldsFragment
    ) }
  )> }
);

export type UpdateOrganizationRoleMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
  name?: Types.Maybe<Types.Scalars['String']>;
  addUserIds?: Types.Maybe<Array<Types.Scalars['Int']> | Types.Scalars['Int']>;
  removeUserIds?: Types.Maybe<Array<Types.Scalars['Int']> | Types.Scalars['Int']>;
  addPermissions?: Types.Maybe<Array<Types.PermissionInput> | Types.PermissionInput>;
  removePermissionIds?: Types.Maybe<Array<Types.Scalars['Int']> | Types.Scalars['Int']>;
}>;


export type UpdateOrganizationRoleMutation = (
  { __typename: 'Mutation' }
  & { updateOrganizationRole?: Types.Maybe<(
    { __typename: 'UpdateOrganizationRolePayload' }
    & { organization_role: (
      { __typename: 'OrganizationRole' }
      & Pick<Types.OrganizationRole, 'id'>
      & OrganizationRoleFieldsFragment
    ) }
  )> }
);

export type DeleteOrganizationRoleMutationVariables = Types.Exact<{
  id: Types.Scalars['Int'];
}>;


export type DeleteOrganizationRoleMutation = (
  { __typename: 'Mutation' }
  & { deleteOrganizationRole?: Types.Maybe<(
    { __typename: 'DeleteOrganizationRolePayload' }
    & Pick<Types.DeleteOrganizationRolePayload, 'clientMutationId'>
  )> }
);


export const CreateOrganizationRoleDocument = gql`
    mutation CreateOrganizationRole($organizationId: Int!, $name: String!, $userIds: [Int!]!, $permissions: [PermissionInput!]!) {
  createOrganizationRole(
    input: {organization_id: $organizationId, organization_role: {name: $name}, user_ids: $userIds, permissions: $permissions}
  ) {
    organization_role {
      id
      ...OrganizationRoleFields
    }
  }
}
    ${OrganizationRoleFieldsFragmentDoc}`;
export type CreateOrganizationRoleMutationFn = Apollo.MutationFunction<CreateOrganizationRoleMutation, CreateOrganizationRoleMutationVariables>;

/**
 * __useCreateOrganizationRoleMutation__
 *
 * To run a mutation, you first call `useCreateOrganizationRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrganizationRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrganizationRoleMutation, { data, loading, error }] = useCreateOrganizationRoleMutation({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      name: // value for 'name'
 *      userIds: // value for 'userIds'
 *      permissions: // value for 'permissions'
 *   },
 * });
 */
export function useCreateOrganizationRoleMutation(baseOptions?: Apollo.MutationHookOptions<CreateOrganizationRoleMutation, CreateOrganizationRoleMutationVariables>) {
        return Apollo.useMutation<CreateOrganizationRoleMutation, CreateOrganizationRoleMutationVariables>(CreateOrganizationRoleDocument, baseOptions);
      }
export type CreateOrganizationRoleMutationHookResult = ReturnType<typeof useCreateOrganizationRoleMutation>;
export type CreateOrganizationRoleMutationResult = Apollo.MutationResult<CreateOrganizationRoleMutation>;
export type CreateOrganizationRoleMutationOptions = Apollo.BaseMutationOptions<CreateOrganizationRoleMutation, CreateOrganizationRoleMutationVariables>;
export const UpdateOrganizationRoleDocument = gql`
    mutation UpdateOrganizationRole($id: Int!, $name: String, $addUserIds: [Int!], $removeUserIds: [Int!], $addPermissions: [PermissionInput!], $removePermissionIds: [Int!]) {
  updateOrganizationRole(
    input: {id: $id, organization_role: {name: $name}, add_user_ids: $addUserIds, remove_user_ids: $removeUserIds, add_permissions: $addPermissions, remove_permission_ids: $removePermissionIds}
  ) {
    organization_role {
      id
      ...OrganizationRoleFields
    }
  }
}
    ${OrganizationRoleFieldsFragmentDoc}`;
export type UpdateOrganizationRoleMutationFn = Apollo.MutationFunction<UpdateOrganizationRoleMutation, UpdateOrganizationRoleMutationVariables>;

/**
 * __useUpdateOrganizationRoleMutation__
 *
 * To run a mutation, you first call `useUpdateOrganizationRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOrganizationRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOrganizationRoleMutation, { data, loading, error }] = useUpdateOrganizationRoleMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      addUserIds: // value for 'addUserIds'
 *      removeUserIds: // value for 'removeUserIds'
 *      addPermissions: // value for 'addPermissions'
 *      removePermissionIds: // value for 'removePermissionIds'
 *   },
 * });
 */
export function useUpdateOrganizationRoleMutation(baseOptions?: Apollo.MutationHookOptions<UpdateOrganizationRoleMutation, UpdateOrganizationRoleMutationVariables>) {
        return Apollo.useMutation<UpdateOrganizationRoleMutation, UpdateOrganizationRoleMutationVariables>(UpdateOrganizationRoleDocument, baseOptions);
      }
export type UpdateOrganizationRoleMutationHookResult = ReturnType<typeof useUpdateOrganizationRoleMutation>;
export type UpdateOrganizationRoleMutationResult = Apollo.MutationResult<UpdateOrganizationRoleMutation>;
export type UpdateOrganizationRoleMutationOptions = Apollo.BaseMutationOptions<UpdateOrganizationRoleMutation, UpdateOrganizationRoleMutationVariables>;
export const DeleteOrganizationRoleDocument = gql`
    mutation DeleteOrganizationRole($id: Int!) {
  deleteOrganizationRole(input: {id: $id}) {
    clientMutationId
  }
}
    `;
export type DeleteOrganizationRoleMutationFn = Apollo.MutationFunction<DeleteOrganizationRoleMutation, DeleteOrganizationRoleMutationVariables>;

/**
 * __useDeleteOrganizationRoleMutation__
 *
 * To run a mutation, you first call `useDeleteOrganizationRoleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteOrganizationRoleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteOrganizationRoleMutation, { data, loading, error }] = useDeleteOrganizationRoleMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteOrganizationRoleMutation(baseOptions?: Apollo.MutationHookOptions<DeleteOrganizationRoleMutation, DeleteOrganizationRoleMutationVariables>) {
        return Apollo.useMutation<DeleteOrganizationRoleMutation, DeleteOrganizationRoleMutationVariables>(DeleteOrganizationRoleDocument, baseOptions);
      }
export type DeleteOrganizationRoleMutationHookResult = ReturnType<typeof useDeleteOrganizationRoleMutation>;
export type DeleteOrganizationRoleMutationResult = Apollo.MutationResult<DeleteOrganizationRoleMutation>;
export type DeleteOrganizationRoleMutationOptions = Apollo.BaseMutationOptions<DeleteOrganizationRoleMutation, DeleteOrganizationRoleMutationVariables>;