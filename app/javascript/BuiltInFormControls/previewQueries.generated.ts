/* eslint-disable */
import * as Types from '../graphqlTypes.generated';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type PreviewLiquidQueryQueryVariables = Types.Exact<{
  liquid: Types.Scalars['String'];
}>;


export type PreviewLiquidQueryQuery = (
  { __typename: 'Query' }
  & Pick<Types.Query, 'previewLiquid'>
);

export type PreviewMarkdownQueryQueryVariables = Types.Exact<{
  markdown: Types.Scalars['String'];
}>;


export type PreviewMarkdownQueryQuery = (
  { __typename: 'Query' }
  & Pick<Types.Query, 'previewMarkdown'>
);

export type PreviewNotifierLiquidQueryQueryVariables = Types.Exact<{
  eventKey: Types.Scalars['String'];
  liquid: Types.Scalars['String'];
}>;


export type PreviewNotifierLiquidQueryQuery = (
  { __typename: 'Query' }
  & { previewLiquid: Types.Query['previewNotifierLiquid'] }
);


export const PreviewLiquidQueryDocument = gql`
    query PreviewLiquidQuery($liquid: String!) {
  previewLiquid(content: $liquid)
}
    `;

/**
 * __usePreviewLiquidQueryQuery__
 *
 * To run a query within a React component, call `usePreviewLiquidQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `usePreviewLiquidQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePreviewLiquidQueryQuery({
 *   variables: {
 *      liquid: // value for 'liquid'
 *   },
 * });
 */
export function usePreviewLiquidQueryQuery(baseOptions?: Apollo.QueryHookOptions<PreviewLiquidQueryQuery, PreviewLiquidQueryQueryVariables>) {
        return Apollo.useQuery<PreviewLiquidQueryQuery, PreviewLiquidQueryQueryVariables>(PreviewLiquidQueryDocument, baseOptions);
      }
export function usePreviewLiquidQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PreviewLiquidQueryQuery, PreviewLiquidQueryQueryVariables>) {
          return Apollo.useLazyQuery<PreviewLiquidQueryQuery, PreviewLiquidQueryQueryVariables>(PreviewLiquidQueryDocument, baseOptions);
        }
export type PreviewLiquidQueryQueryHookResult = ReturnType<typeof usePreviewLiquidQueryQuery>;
export type PreviewLiquidQueryLazyQueryHookResult = ReturnType<typeof usePreviewLiquidQueryLazyQuery>;
export type PreviewLiquidQueryQueryResult = Apollo.QueryResult<PreviewLiquidQueryQuery, PreviewLiquidQueryQueryVariables>;
export const PreviewMarkdownQueryDocument = gql`
    query PreviewMarkdownQuery($markdown: String!) {
  previewMarkdown(markdown: $markdown)
}
    `;

/**
 * __usePreviewMarkdownQueryQuery__
 *
 * To run a query within a React component, call `usePreviewMarkdownQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `usePreviewMarkdownQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePreviewMarkdownQueryQuery({
 *   variables: {
 *      markdown: // value for 'markdown'
 *   },
 * });
 */
export function usePreviewMarkdownQueryQuery(baseOptions?: Apollo.QueryHookOptions<PreviewMarkdownQueryQuery, PreviewMarkdownQueryQueryVariables>) {
        return Apollo.useQuery<PreviewMarkdownQueryQuery, PreviewMarkdownQueryQueryVariables>(PreviewMarkdownQueryDocument, baseOptions);
      }
export function usePreviewMarkdownQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PreviewMarkdownQueryQuery, PreviewMarkdownQueryQueryVariables>) {
          return Apollo.useLazyQuery<PreviewMarkdownQueryQuery, PreviewMarkdownQueryQueryVariables>(PreviewMarkdownQueryDocument, baseOptions);
        }
export type PreviewMarkdownQueryQueryHookResult = ReturnType<typeof usePreviewMarkdownQueryQuery>;
export type PreviewMarkdownQueryLazyQueryHookResult = ReturnType<typeof usePreviewMarkdownQueryLazyQuery>;
export type PreviewMarkdownQueryQueryResult = Apollo.QueryResult<PreviewMarkdownQueryQuery, PreviewMarkdownQueryQueryVariables>;
export const PreviewNotifierLiquidQueryDocument = gql`
    query PreviewNotifierLiquidQuery($eventKey: String!, $liquid: String!) {
  previewLiquid: previewNotifierLiquid(eventKey: $eventKey, content: $liquid)
}
    `;

/**
 * __usePreviewNotifierLiquidQueryQuery__
 *
 * To run a query within a React component, call `usePreviewNotifierLiquidQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `usePreviewNotifierLiquidQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePreviewNotifierLiquidQueryQuery({
 *   variables: {
 *      eventKey: // value for 'eventKey'
 *      liquid: // value for 'liquid'
 *   },
 * });
 */
export function usePreviewNotifierLiquidQueryQuery(baseOptions?: Apollo.QueryHookOptions<PreviewNotifierLiquidQueryQuery, PreviewNotifierLiquidQueryQueryVariables>) {
        return Apollo.useQuery<PreviewNotifierLiquidQueryQuery, PreviewNotifierLiquidQueryQueryVariables>(PreviewNotifierLiquidQueryDocument, baseOptions);
      }
export function usePreviewNotifierLiquidQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<PreviewNotifierLiquidQueryQuery, PreviewNotifierLiquidQueryQueryVariables>) {
          return Apollo.useLazyQuery<PreviewNotifierLiquidQueryQuery, PreviewNotifierLiquidQueryQueryVariables>(PreviewNotifierLiquidQueryDocument, baseOptions);
        }
export type PreviewNotifierLiquidQueryQueryHookResult = ReturnType<typeof usePreviewNotifierLiquidQueryQuery>;
export type PreviewNotifierLiquidQueryLazyQueryHookResult = ReturnType<typeof usePreviewNotifierLiquidQueryLazyQuery>;
export type PreviewNotifierLiquidQueryQueryResult = Apollo.QueryResult<PreviewNotifierLiquidQueryQuery, PreviewNotifierLiquidQueryQueryVariables>;