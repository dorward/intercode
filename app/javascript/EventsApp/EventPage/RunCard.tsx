import React, { useContext, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { useHistory, useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { ApolloError } from '@apollo/client';
import { TFunction } from 'i18next';

import ErrorDisplay from '../../ErrorDisplay';
import RunCapacityGraph from './RunCapacityGraph';
import SignupButtons from './SignupButtons';
import { timespanFromRun } from '../../TimespanUtils';
import ViewSignupsOptions from './ViewSignupsOptions';
import AppRootContext from '../../AppRootContext';
import useAsyncFunction from '../../useAsyncFunction';
import WithdrawSignupButton from './WithdrawSignupButton';
import LoadingIndicator from '../../LoadingIndicator';
import AuthenticationModalContext from '../../Authentication/AuthenticationModalContext';
import { EventPageQueryQuery } from './queries.generated';
import { PartitionedSignupOptions, SignupOption } from './buildSignupOptions';

function describeSignupState(
  mySignup: EventPageQueryQuery['event']['runs'][0]['my_signups'][0],
  t: TFunction,
) {
  if (mySignup.state === 'confirmed') {
    return t('signups.runCardText.confirmed', 'You are signed up.');
  }

  if (mySignup.waitlist_position) {
    return t('signups.runCardText.waitlisted', 'You are #{{ waitlistNumber }} on the waitlist.', {
      waitlistPosition: mySignup.waitlist_position,
    });
  }

  return t('signups.runCardText.waitlistedUnknownPosition', 'You are on the waitlist.');
}

export type RunCardProps = {
  run: EventPageQueryQuery['event']['runs'][0];
  event: EventPageQueryQuery['event'];
  signupOptions: PartitionedSignupOptions;
  currentAbility: EventPageQueryQuery['currentAbility'];
  myProfile?: object | null;
  mySignup?: EventPageQueryQuery['event']['runs'][0]['my_signups'][0] | null;
  myPendingSignupRequest?: EventPageQueryQuery['event']['runs'][0]['my_signup_requests'][0] | null;
  showViewSignups?: boolean;
  createSignup: (signupOption: SignupOption) => Promise<any>;
  withdrawSignup: () => Promise<any>;
  withdrawPendingSignupRequest: () => Promise<any>;
};

function RunCard({
  run,
  event,
  signupOptions,
  currentAbility,
  myProfile,
  mySignup,
  myPendingSignupRequest,
  showViewSignups,
  createSignup,
  withdrawSignup,
  withdrawPendingSignupRequest,
}: RunCardProps) {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const { siteMode, timezoneName } = useContext(AppRootContext);
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (history.location.hash === `#run-${run.id}`) {
      cardRef.current?.scrollIntoView(false);
    }
  }, [history.location.hash, run.id]);
  const [signupButtonClicked, signupError, mutationInProgress] = useAsyncFunction(createSignup);
  const { setAfterSignInPath, open: openAuthenticationModal } = useContext(
    AuthenticationModalContext,
  );

  const renderMainSignupSection = () => {
    if (!myProfile) {
      return (
        <button
          type="button"
          onClick={() => {
            setAfterSignInPath(location.pathname);
            openAuthenticationModal({ currentView: 'signIn' });
          }}
          className="btn btn-outline-primary"
          style={{ whiteSpace: 'normal' }}
        >
          <Trans i18nKey="signups.signedOutSignupButton">
            <strong>Log in</strong> to sign up for
            <br />
            <em>{{ eventTitle: event.title }}</em>
          </Trans>
        </button>
      );
    }

    if (mySignup) {
      return (
        <>
          <em>{describeSignupState(mySignup, t)}</em>
          <p className="mb-0">
            <WithdrawSignupButton withdrawSignup={withdrawSignup} />
          </p>
        </>
      );
    }

    if (myPendingSignupRequest) {
      return (
        <>
          <em>
            {t(
              'signups.runCardText.requestPending',
              'You have requested to sign up for this event.',
            )}
          </em>
          <p className="mb-0">
            <button
              className="btn btn-outline-danger"
              type="button"
              onClick={withdrawPendingSignupRequest}
            >
              {t('signups.withdrawSignupRequestButton', 'Withdraw signup request')}
            </button>
          </p>
        </>
      );
    }

    return (
      <>
        <SignupButtons
          signupOptions={signupOptions.mainPreference}
          disabled={mutationInProgress}
          onClick={signupButtonClicked}
        />
        <SignupButtons
          signupOptions={signupOptions.mainNoPreference}
          disabled={mutationInProgress}
          onClick={signupButtonClicked}
        />
        {mutationInProgress && <LoadingIndicator />}
        <ErrorDisplay graphQLError={signupError as ApolloError} />
      </>
    );
  };

  const renderAuxiliarySignupSection = () => {
    if (!myProfile || mySignup || signupOptions.auxiliary.length === 0) {
      return null;
    }

    return (
      <ul className="list-group list-group-flush">
        <li className="list-group-item border-bottom-0">
          <SignupButtons
            signupOptions={signupOptions.auxiliary}
            disabled={mutationInProgress}
            onClick={signupButtonClicked}
          />
        </li>
      </ul>
    );
  };

  const runTimespan = timespanFromRun(timezoneName, event, run);
  const acceptsSignups =
    event.registration_policy &&
    (!event.registration_policy.slots_limited ||
      (event.registration_policy.total_slots_including_not_counted &&
        event.registration_policy.total_slots_including_not_counted > 0));

  return (
    <div
      ref={cardRef}
      className={classNames('card run-card', {
        'glow-success': history.location.hash === `#run-${run.id}`,
      })}
      id={`run-${run.id}`}
    >
      {(siteMode !== 'single_event' || event.runs.length !== 1) && (
        <div className="card-header">
          {run.title_suffix ? (
            <p>
              <strong>{run.title_suffix}</strong>
            </p>
          ) : null}

          <div className="d-flex flex-wrap">
            <div className="flex-grow-1">
              {runTimespan.start.format('ddd h:mma')}-{runTimespan.finish.format('h:mma')}
            </div>

            <div>
              {run.rooms
                .map((room) => room.name)
                .sort()
                .join(', ')}
            </div>
          </div>
        </div>
      )}
      {acceptsSignups ? (
        <>
          <div className="card-body text-center">
            <RunCapacityGraph run={run} event={event} signupsAvailable />
            {renderMainSignupSection()}
          </div>

          {renderAuxiliarySignupSection()}

          {showViewSignups && (
            <ViewSignupsOptions event={event} run={run} currentAbility={currentAbility} />
          )}
        </>
      ) : (
        <div className="card-body">
          <small>{t('signups.noSignupsAvailable', 'This event does not take signups.')}</small>
        </div>
      )}
    </div>
  );
}

export default RunCard;