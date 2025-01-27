import { Suspense, useCallback, useRef, useEffect, ReactNode, useState } from 'react';
import * as React from 'react';
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import { i18n } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import type { Stripe } from '@stripe/stripe-js';

import AuthenticationModalContext, {
  useAuthenticationModalProvider,
} from './Authentication/AuthenticationModalContext';
import Confirm, { useConfirm } from './ModalDialogs/Confirm';
import { LazyStripeContext } from './LazyStripe';
import AuthenticationModal from './Authentication/AuthenticationModal';
import AuthenticityTokensContext, { useAuthenticityTokens } from './AuthenticityTokensContext';
import PageLoadingIndicator from './PageLoadingIndicator';
import { AlertProvider } from './ModalDialogs/Alert';
import useIntercodeApolloClient from './useIntercodeApolloClient';
import ErrorBoundary from './ErrorBoundary';
import MapboxContext, { useMapboxContext } from './MapboxContext';
import getI18n from './setupI18Next';
import ErrorDisplay from './ErrorDisplay';

function I18NextWrapper({ children }: { children: ReactNode }) {
  const [i18nInstance, seti18nInstance] = useState<i18n>();
  const [error, setError] = useState<Error>();

  useEffect(() => {
    getI18n()
      .then((instance) => seti18nInstance(instance))
      .catch((err) => setError(err));
  }, []);

  if (i18nInstance) {
    return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
  }

  if (error) {
    return <ErrorDisplay stringError={error.message} />;
  }

  return <PageLoadingIndicator visible />;
}

export type AppWrapperProps = {
  authenticityTokens: {
    graphql: string;
  };
  mapboxAccessToken: string;
  recaptchaSiteKey: string;
  stripeAccountId?: string;
  stripePublishableKey: string;
};

function AppWrapper<P>(WrappedComponent: React.ComponentType<P>) {
  function Wrapper(props: P & AppWrapperProps) {
    const {
      authenticityTokens,
      mapboxAccessToken,
      recaptchaSiteKey,
      stripeAccountId,
      stripePublishableKey,
      ...otherProps
    } = props;
    const confirm = useConfirm();
    const authenticityTokensProviderValue = useAuthenticityTokens(authenticityTokens);
    const { graphql: authenticityToken, refresh } = authenticityTokensProviderValue;
    const authenticationModalContextValue = useAuthenticationModalProvider(recaptchaSiteKey);
    const {
      open: openAuthenticationModal,
      unauthenticatedError,
      setUnauthenticatedError,
    } = authenticationModalContextValue;
    const openSignIn = useCallback(async () => {
      setUnauthenticatedError(true);
      await refresh();
      openAuthenticationModal({ currentView: 'signIn' });
    }, [openAuthenticationModal, setUnauthenticatedError, refresh]);
    const onUnauthenticatedRef = useRef(openSignIn);
    useEffect(() => {
      onUnauthenticatedRef.current = openSignIn;
    }, [openSignIn]);
    const apolloClient = useIntercodeApolloClient(authenticityToken, onUnauthenticatedRef);
    const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

    const getUserConfirmation = useCallback(
      (message: ReactNode, callback: (confirmed: boolean) => void) => {
        confirm({
          prompt: message,
          action: () => callback(true),
          onCancel: () => callback(false),
        });
      },
      [confirm],
    );

    const mapboxContextValue = useMapboxContext({ mapboxAccessToken });

    if (!apolloClient) {
      // we need one render cycle to initialize the client
      return <></>;
    }

    return (
      <React.StrictMode>
        <BrowserRouter basename="/" getUserConfirmation={getUserConfirmation}>
          <LazyStripeContext.Provider
            value={{
              publishableKey: stripePublishableKey,
              accountId: stripeAccountId,
              stripePromise,
              setStripePromise,
            }}
          >
            <AuthenticityTokensContext.Provider value={authenticityTokensProviderValue}>
              <MapboxContext.Provider value={mapboxContextValue}>
                <ApolloProvider client={apolloClient}>
                  <AuthenticationModalContext.Provider value={authenticationModalContextValue}>
                    <>
                      {!unauthenticatedError && (
                        <Suspense fallback={<PageLoadingIndicator visible />}>
                          <I18NextWrapper>
                            <AlertProvider>
                              <ErrorBoundary placement="replace" errorType="plain">
                                <WrappedComponent {...((otherProps as unknown) as P)} />
                              </ErrorBoundary>
                            </AlertProvider>
                          </I18NextWrapper>
                        </Suspense>
                      )}
                      <AuthenticationModal />
                    </>
                  </AuthenticationModalContext.Provider>
                </ApolloProvider>
              </MapboxContext.Provider>
            </AuthenticityTokensContext.Provider>
          </LazyStripeContext.Provider>
        </BrowserRouter>
      </React.StrictMode>
    );
  }

  const wrappedComponentDisplayName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';

  Wrapper.displayName = `AppWrapper(${wrappedComponentDisplayName})`;

  function ConfirmWrapper(props: P & AppWrapperProps) {
    return (
      <Confirm>
        <Wrapper {...props} />
      </Confirm>
    );
  }

  return ConfirmWrapper;
}

export default AppWrapper;
