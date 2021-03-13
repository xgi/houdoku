import { useState } from 'react';

// adapted from https://stackoverflow.com/a/53837442
// eslint-disable-next-line import/prefer-default-export
export function useForceUpdate() {
  const [, setValue] = useState(0);
  return () => setValue((value) => value + 1);
}
