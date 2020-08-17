import { useRef, useEffect } from 'react';

export default function useWhyDidYouUpdate<P>(name: string, props: P) {
  // Get a mutable ref object where we can store props ...
  // ... for comparison next time this hook runs.
  const previousProps = useRef<P>();

  useEffect(() => {
    const previousValue = previousProps.current;

    if (previousValue) {
      // Get all keys from previous and current props
      const allKeys = Object.keys({ ...previousValue, ...props });
      // Use this object to keep track of changed props
      const changesObj = {};
      // Iterate through keys
      allKeys.forEach((key) => {
        // If previous is different from current
        if (previousValue[key] !== props[key]) {
          // Add to changesObj
          changesObj[key] = {
            from: previousValue[key],
            to: props[key],
          };
        }
      });

      // If changesObj not empty then output to console
      if (Object.keys(changesObj).length) {
        // eslint-disable-next-line no-console
        console.log('[why-did-you-update]', name, changesObj);
      }
    }

    // Finally update previousProps with current props for next hook call
    previousProps.current = props;
  });
}