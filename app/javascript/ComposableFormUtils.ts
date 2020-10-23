import moment, { Moment } from 'moment-timezone';

export function parseIntOrNull(stringValue: string) {
  const intValue = parseInt(stringValue, 10);
  if (Number.isNaN(intValue)) {
    return null;
  }
  return intValue;
}

export function parseFloatOrNull(stringValue: string) {
  const floatValue = parseFloat(stringValue);
  if (Number.isNaN(floatValue)) {
    return null;
  }
  return floatValue;
}

export function parseMoneyOrNull(value: string) {
  const newPrice = parseFloatOrNull(value);

  if (newPrice == null) {
    return null;
  }

  return {
    fractional: Math.floor(newPrice * 100),
    currency_code: 'USD',
  };
}

export function forceTimezoneForDatetimeValue(
  value: string | null | Moment,
  timezoneName: string,
): string | null {
  if (value == null) {
    return value;
  }

  if (typeof value === 'string') {
    const valueWithoutTimezone = value.replace(/(Z|[+-]\d\d(:\d\d)?)$/, '');
    return forceTimezoneForDatetimeValue(moment(valueWithoutTimezone), timezoneName);
  }

  // it's hopefully a moment
  const valueInTimezone = moment.tz(value.toObject(), timezoneName);
  return valueInTimezone.toISOString(true);
}

export function convertDatetimeValue(
  value: string | null | Moment | undefined,
  timezoneName?: string,
) {
  if (value == null) {
    return value;
  }

  const momentValue = timezoneName ? moment.tz(value, timezoneName) : moment(value);
  if (momentValue.isValid()) {
    return momentValue.toISOString(!!timezoneName);
  }

  return null;
}

function namedFunction<A extends any[], R>(
  func: (...args: A) => R,
  name: string,
): (...args: A) => R {
  try {
    Object.defineProperty(func, 'name', { value: name });
  } catch (error) {
    // fall back to just not naming the function if the browser doesn't support it (e.g. Safari 9)
  }
  return func;
}

export const Transforms = {
  identity<T>(value: T) {
    return value;
  },
  integer(value: string) {
    return parseIntOrNull(value);
  },
  float(value: string) {
    return parseFloatOrNull(value);
  },
  datetime(value: string | null | Moment) {
    return convertDatetimeValue(value);
  },
  datetimeWithTimezone(timezoneName: string) {
    return namedFunction(
      (value: string | null | Moment) => convertDatetimeValue(value, timezoneName),
      `datetimeWithTimezone('${timezoneName}')`,
    );
  },
  datetimeWithForcedTimezone(timezoneName: string) {
    return namedFunction(
      (value: string | null | Moment) => forceTimezoneForDatetimeValue(value, timezoneName),
      `datetimeWithForcedTimezone('${timezoneName}')`,
    );
  },
  negate<T>(func: (value: T) => boolean) {
    return namedFunction((value: T) => !func(value), 'negate');
  },
  parseInt<T>(func: (value: T) => string) {
    return namedFunction((value: T) => Number.parseInt(func(value), 10), 'parseInt');
  },
  booleanString(value: string) {
    return value === 'true';
  },
  multiValue<T>(choices: { value: T }[]) {
    return choices.map((choice) => choice.value);
  },
};
