import { useCallback, useContext } from 'react';
import { useApolloClient } from 'react-apollo-hooks';

import AuthenticityTokensContext from '../AuthenticityTokensContext';
import AuthenticationModalContext from './AuthenticationModalContext';

export default function useAfterSessionChange(history) {
  const apolloClient = useApolloClient();
  const { refresh } = useContext(AuthenticityTokensContext);
  const { close: closeModal, setUnauthenticatedError } = useContext(AuthenticationModalContext);

  const afterSessionChange = useCallback(
    async (destPath) => {
      const destUrl = new URL(
        destPath || window.location.href,
        window.location.href,
      );

      destUrl.searchParams.delete('show_authentication');
      if (destUrl.toString() === window.location.href) {
        window.location.reload();
        // await refresh();
        // await apolloClient.reFetchObservableQueries(true);
        // closeModal();
        // setUnauthenticatedError(false);
      } else if (destUrl.host === window.location.host) {
        window.location.href = destUrl.toString();
        // await refresh();
        // await apolloClient.clearStore();
        // history.push(`${destUrl.pathname}${destUrl.search}${destUrl.hash}`);
        // closeModal();
        // setUnauthenticatedError(false);
        // apolloClient.reFetchObservableQueries(true);
      } else {
        window.location.href = destUrl.toString();
      }
    },
    [apolloClient, closeModal, history, refresh, setUnauthenticatedError],
  );

  return afterSessionChange;
}