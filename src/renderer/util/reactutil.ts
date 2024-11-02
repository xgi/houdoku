import { useState } from 'react';

/**
 * Provide a function that forces a React component to update.
 * To use, just declare a reference to this function within the component
 * (i.e. `const forceUpdate = useForceUpdate()`) and then call the function as necessary.
 * adapted from https://stackoverflow.com/a/53837442
 * @returns a function which forces a React component to update
 */
// eslint-disable-next-line import/prefer-default-export
export function useForceUpdate() {
  const [, setValue] = useState(0);
  return () => setValue((value) => value + 1);
}

export function classNames(...classNames: string[]) {
  return classNames.join(' ');
}
