import { useRef, useMemo, useEffect, RefObject } from 'react';
import {
  ApolloClient,
  ApolloLink,
  Operation,
  NextLink,
  InMemoryCache,
  FieldFunctionOptions,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { createUploadLink } from 'apollo-upload-client';
import { DateTime } from 'luxon';

import possibleTypes from './possibleTypes.json';

function mergeArrayByField<T extends Record<string, any>, F extends keyof T>(
  existing: T[],
  incoming: T[],
  field: F,
  { readField, mergeObjects }: FieldFunctionOptions<T>,
) {
  const merged: T[] = existing ? existing.slice(0) : [];
  const fieldValueToIndex = new Map<T[F], number>();
  if (existing) {
    existing.forEach((record, index) => {
      fieldValueToIndex.set(readField<T[F]>(field as string, record)!, index);
    });
  }
  incoming.forEach((record) => {
    const fieldValue = readField<T[F]>(field as string, record)!;
    const index = fieldValueToIndex.get(fieldValue);
    if (typeof index === 'number') {
      // Merge the new record data with the existing record data.
      merged[index] = mergeObjects(merged[index], record)!;
    } else {
      // First time we've seen this record in this array.
      fieldValueToIndex.set(fieldValue, merged.length);
      merged.push(record);
    }
  });
  return merged;
}

export function useIntercodeApolloLink(
  authenticityToken: string,
  onUnauthenticatedRef?: RefObject<() => void>,
) {
  const authenticityTokenRef = useRef(authenticityToken);
  useEffect(() => {
    authenticityTokenRef.current = authenticityToken;
  }, [authenticityToken]);

  const AuthLink = useMemo(
    () =>
      new ApolloLink((operation: Operation, next: NextLink) => {
        operation.setContext((context: Record<string, any>) => ({
          ...context,
          credentials: 'same-origin',
          headers: {
            ...context.headers,
            'X-CSRF-Token': authenticityTokenRef.current,
          },
        }));

        return next(operation);
      }),
    [],
  );

  const AddTimezoneLink = useMemo(
    () =>
      new ApolloLink((operation: Operation, next: NextLink) => {
        const localTime = DateTime.local();
        operation.setContext((context: Record<string, any>) => ({
          ...context,
          headers: {
            ...context.headers,
            'X-Intercode-User-Timezone': localTime.zoneName,
          },
        }));

        return next(operation);
      }),
    [],
  );

  const ErrorHandlerLink = useMemo(
    () =>
      onError(({ graphQLErrors }) => {
        if (graphQLErrors) {
          if (graphQLErrors.some((err) => (err.extensions || {}).code === 'NOT_AUTHENTICATED')) {
            if (onUnauthenticatedRef?.current) {
              onUnauthenticatedRef.current();
            }
          }
        }
      }),
    [onUnauthenticatedRef],
  );

  const link = useMemo(
    () =>
      ApolloLink.from([
        AuthLink,
        AddTimezoneLink,
        ErrorHandlerLink,
        // @ts-ignore because @types/apollo-upload-client hasn't been updated for 14.x.x
        createUploadLink({ uri: '/graphql', fetch }),
      ]),
    [AuthLink, AddTimezoneLink, ErrorHandlerLink],
  );

  return link;
}

function useIntercodeApolloClient(
  authenticityToken: string,
  onUnauthenticatedRef: RefObject<() => void>,
) {
  const link = useIntercodeApolloLink(authenticityToken, onUnauthenticatedRef);

  const client = useMemo(
    () =>
      new ApolloClient({
        link,
        cache: new InMemoryCache({
          addTypename: true,
          possibleTypes,
          typePolicies: {
            Event: {
              fields: {
                registration_policy: {
                  merge: (existing, incoming, { mergeObjects }) => mergeObjects(existing, incoming),
                },
              },
            },
            RegistrationPolicy: {
              fields: {
                buckets: {
                  merge: (existing, incoming, functions) =>
                    mergeArrayByField(existing, incoming, 'key', functions),
                },
              },
            },
            UserConProfile: {
              fields: {
                ability: {
                  merge: (existing, incoming, { mergeObjects }) => mergeObjects(existing, incoming),
                },
              },
            },
            Query: {
              fields: {
                currentAbility: {
                  merge: (existing, incoming, { mergeObjects }) => mergeObjects(existing, incoming),
                },
              },
            },
          },
        }),
      }),
    [link],
  );

  return client;
}

export default useIntercodeApolloClient;
