import classNames from 'classnames';

import getFullnessClass from './getFullnessClass';

export function userSignupStatus(run) {
  if (run.my_signups.some(signup => signup.state === 'confirmed')) {
    return 'confirmed';
  }

  if (run.my_signups.some(signup => signup.state === 'waitlisted')) {
    return 'waitlisted';
  }

  if (run.my_signup_requests.some(signupRequest => signupRequest.state === 'pending')) {
    return 'request_pending';
  }

  return null;
}

export function getRunClassName({
  event, signupStatus, config, signupCountData,
}) {
  return classNames(
    'schedule-grid-event',
    'small',
    (
      config.classifyEventsBy === 'fullness'
        ? getFullnessClass(event, signupCountData)
        : null
    ),
    {
      'signed-up': config.showSignedUp && signupStatus != null,
      full: (
        config.classifyEventsBy !== 'fullness'
        && signupCountData.runFull(event)
        && signupStatus == null
      ),
    },
  );
}

export function getRunPositioningStyles({ runDimensions, layoutResult }) {
  return {
    top: `${(runDimensions.laneIndex / layoutResult.laneCount) * 100.0}%`,
    height: `${100.0 / layoutResult.laneCount}%`,
    left: `${runDimensions.timePlacement}%`,
    width: `${runDimensions.timeSpan}%`,
    position: 'absolute',
    zIndex: runDimensions.laneIndex,
  };
}

export function getEventCategoryStyles({ eventCategory, variant }) {
  const color = eventCategory[`${variant}_color`];

  if (color) {
    if (variant === 'signed_up') {
      return { backgroundColor: color, borderColor: color };
    }

    return { backgroundColor: color };
  }

  return {};
}

export function getRunClassificationStyles({
  config, eventCategory, signupCountData, event, signupStatus,
}) {
  if (config.classifyEventsBy === 'category') {
    let variant = 'default';
    if (signupStatus != null) {
      variant = 'signed_up';
    } else if (signupCountData.runFull(event)) {
      variant = 'full';
    }

    return getEventCategoryStyles({ eventCategory, variant });
  }

  return {};
}

export function getRunStyle({
  event, eventCategory, signupStatus, config, signupCountData, runDimensions, layoutResult,
}) {
  return {
    cursor: 'pointer',
    ...getRunPositioningStyles({ runDimensions, layoutResult }),
    ...getRunClassificationStyles({
      event, eventCategory, signupStatus, config, signupCountData,
    }),
  };
}