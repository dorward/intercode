/* eslint-disable */
import * as Types from '../../graphqlTypes.generated';

import { TeamMemberFieldsFragment, TeamMemberTicketFieldsFragment, TeamMemberFieldsWithoutPersonalInfoFragment } from './queries.generated';
import { gql } from '@apollo/client';
import { TeamMemberFieldsFragmentDoc, TeamMemberTicketFieldsFragmentDoc, TeamMemberFieldsWithoutPersonalInfoFragmentDoc } from './queries.generated';
import * as Apollo from '@apollo/client';
export type CreateTeamMemberMutationVariables = Types.Exact<{
  input: Types.CreateTeamMemberInput;
}>;


export type CreateTeamMemberMutation = (
  { __typename: 'Mutation' }
  & { createTeamMember?: Types.Maybe<(
    { __typename: 'CreateTeamMemberPayload' }
    & { team_member: (
      { __typename: 'TeamMember' }
      & Pick<Types.TeamMember, 'id'>
      & TeamMemberFieldsFragment
    ) }
  )> }
);

export type DeleteTeamMemberMutationVariables = Types.Exact<{
  input: Types.DeleteTeamMemberInput;
}>;


export type DeleteTeamMemberMutation = (
  { __typename: 'Mutation' }
  & { deleteTeamMember?: Types.Maybe<(
    { __typename: 'DeleteTeamMemberPayload' }
    & { team_member: (
      { __typename: 'TeamMember' }
      & Pick<Types.TeamMember, 'id'>
      & TeamMemberFieldsWithoutPersonalInfoFragment
    ) }
  )> }
);

export type UpdateTeamMemberMutationVariables = Types.Exact<{
  input: Types.UpdateTeamMemberInput;
}>;


export type UpdateTeamMemberMutation = (
  { __typename: 'Mutation' }
  & { updateTeamMember?: Types.Maybe<(
    { __typename: 'UpdateTeamMemberPayload' }
    & { team_member: (
      { __typename: 'TeamMember' }
      & Pick<Types.TeamMember, 'id'>
      & TeamMemberFieldsWithoutPersonalInfoFragment
    ) }
  )> }
);

export type ProvideEventTicketMutationVariables = Types.Exact<{
  eventId: Types.Scalars['Int'];
  userConProfileId: Types.Scalars['Int'];
  ticketTypeId: Types.Scalars['Int'];
}>;


export type ProvideEventTicketMutation = (
  { __typename: 'Mutation' }
  & { provideEventTicket?: Types.Maybe<(
    { __typename: 'ProvideEventTicketPayload' }
    & { ticket: (
      { __typename: 'Ticket' }
      & Pick<Types.Ticket, 'id'>
      & TeamMemberTicketFieldsFragment
    ) }
  )> }
);


export const CreateTeamMemberDocument = gql`
    mutation CreateTeamMember($input: CreateTeamMemberInput!) {
  createTeamMember(input: $input) {
    team_member {
      id
      ...TeamMemberFields
    }
  }
}
    ${TeamMemberFieldsFragmentDoc}`;
export type CreateTeamMemberMutationFn = Apollo.MutationFunction<CreateTeamMemberMutation, CreateTeamMemberMutationVariables>;

/**
 * __useCreateTeamMemberMutation__
 *
 * To run a mutation, you first call `useCreateTeamMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTeamMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTeamMemberMutation, { data, loading, error }] = useCreateTeamMemberMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateTeamMemberMutation(baseOptions?: Apollo.MutationHookOptions<CreateTeamMemberMutation, CreateTeamMemberMutationVariables>) {
        return Apollo.useMutation<CreateTeamMemberMutation, CreateTeamMemberMutationVariables>(CreateTeamMemberDocument, baseOptions);
      }
export type CreateTeamMemberMutationHookResult = ReturnType<typeof useCreateTeamMemberMutation>;
export type CreateTeamMemberMutationResult = Apollo.MutationResult<CreateTeamMemberMutation>;
export type CreateTeamMemberMutationOptions = Apollo.BaseMutationOptions<CreateTeamMemberMutation, CreateTeamMemberMutationVariables>;
export const DeleteTeamMemberDocument = gql`
    mutation DeleteTeamMember($input: DeleteTeamMemberInput!) {
  deleteTeamMember(input: $input) {
    team_member {
      id
      ...TeamMemberFieldsWithoutPersonalInfo
    }
  }
}
    ${TeamMemberFieldsWithoutPersonalInfoFragmentDoc}`;
export type DeleteTeamMemberMutationFn = Apollo.MutationFunction<DeleteTeamMemberMutation, DeleteTeamMemberMutationVariables>;

/**
 * __useDeleteTeamMemberMutation__
 *
 * To run a mutation, you first call `useDeleteTeamMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTeamMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTeamMemberMutation, { data, loading, error }] = useDeleteTeamMemberMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useDeleteTeamMemberMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTeamMemberMutation, DeleteTeamMemberMutationVariables>) {
        return Apollo.useMutation<DeleteTeamMemberMutation, DeleteTeamMemberMutationVariables>(DeleteTeamMemberDocument, baseOptions);
      }
export type DeleteTeamMemberMutationHookResult = ReturnType<typeof useDeleteTeamMemberMutation>;
export type DeleteTeamMemberMutationResult = Apollo.MutationResult<DeleteTeamMemberMutation>;
export type DeleteTeamMemberMutationOptions = Apollo.BaseMutationOptions<DeleteTeamMemberMutation, DeleteTeamMemberMutationVariables>;
export const UpdateTeamMemberDocument = gql`
    mutation UpdateTeamMember($input: UpdateTeamMemberInput!) {
  updateTeamMember(input: $input) {
    team_member {
      id
      ...TeamMemberFieldsWithoutPersonalInfo
    }
  }
}
    ${TeamMemberFieldsWithoutPersonalInfoFragmentDoc}`;
export type UpdateTeamMemberMutationFn = Apollo.MutationFunction<UpdateTeamMemberMutation, UpdateTeamMemberMutationVariables>;

/**
 * __useUpdateTeamMemberMutation__
 *
 * To run a mutation, you first call `useUpdateTeamMemberMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTeamMemberMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTeamMemberMutation, { data, loading, error }] = useUpdateTeamMemberMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateTeamMemberMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTeamMemberMutation, UpdateTeamMemberMutationVariables>) {
        return Apollo.useMutation<UpdateTeamMemberMutation, UpdateTeamMemberMutationVariables>(UpdateTeamMemberDocument, baseOptions);
      }
export type UpdateTeamMemberMutationHookResult = ReturnType<typeof useUpdateTeamMemberMutation>;
export type UpdateTeamMemberMutationResult = Apollo.MutationResult<UpdateTeamMemberMutation>;
export type UpdateTeamMemberMutationOptions = Apollo.BaseMutationOptions<UpdateTeamMemberMutation, UpdateTeamMemberMutationVariables>;
export const ProvideEventTicketDocument = gql`
    mutation ProvideEventTicket($eventId: Int!, $userConProfileId: Int!, $ticketTypeId: Int!) {
  provideEventTicket(
    input: {event_id: $eventId, user_con_profile_id: $userConProfileId, ticket_type_id: $ticketTypeId}
  ) {
    ticket {
      id
      ...TeamMemberTicketFields
    }
  }
}
    ${TeamMemberTicketFieldsFragmentDoc}`;
export type ProvideEventTicketMutationFn = Apollo.MutationFunction<ProvideEventTicketMutation, ProvideEventTicketMutationVariables>;

/**
 * __useProvideEventTicketMutation__
 *
 * To run a mutation, you first call `useProvideEventTicketMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useProvideEventTicketMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [provideEventTicketMutation, { data, loading, error }] = useProvideEventTicketMutation({
 *   variables: {
 *      eventId: // value for 'eventId'
 *      userConProfileId: // value for 'userConProfileId'
 *      ticketTypeId: // value for 'ticketTypeId'
 *   },
 * });
 */
export function useProvideEventTicketMutation(baseOptions?: Apollo.MutationHookOptions<ProvideEventTicketMutation, ProvideEventTicketMutationVariables>) {
        return Apollo.useMutation<ProvideEventTicketMutation, ProvideEventTicketMutationVariables>(ProvideEventTicketDocument, baseOptions);
      }
export type ProvideEventTicketMutationHookResult = ReturnType<typeof useProvideEventTicketMutation>;
export type ProvideEventTicketMutationResult = Apollo.MutationResult<ProvideEventTicketMutation>;
export type ProvideEventTicketMutationOptions = Apollo.BaseMutationOptions<ProvideEventTicketMutation, ProvideEventTicketMutationVariables>;