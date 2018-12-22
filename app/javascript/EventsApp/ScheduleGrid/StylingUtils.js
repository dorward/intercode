import classNames from 'classnames';

import getFullnessClass from './getFullnessClass';

export function userSignupStatus(run) {
  if (run.my_signups.some(signup => signup.state === 'confirmed')) {
    return 'confirmed';
  }

  if (run.my_signups.some(signup => signup.state === 'waitlisted')) {
    return 'waitlisted';
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

export function getRunClassificationStyles({
  config, signupCountData, event, signupStatus,
}) {
  if (config.classifyEventsBy === 'category') {
    let variant = 'default';
    if (signupStatus != null) {
      variant = 'signed_up';
    } else if (signupCountData.runFull(event)) {
      variant = 'full';
    }

    const color = event.event_category[`${variant}_color`];
    if (color) {
      if (variant === 'signed_up') {
        return { backgroundColor: color, borderColor: color };
      }

      return { backgroundColor: color };
    }
  }

  return {};
}

export function getRunStyle({
  event, signupStatus, config, signupCountData, runDimensions, layoutResult,
}) {
  return {
    cursor: 'pointer',
    ...getRunPositioningStyles({ runDimensions, layoutResult }),
    ...getRunClassificationStyles({
      event, signupStatus, config, signupCountData,
    }),
  };
}
