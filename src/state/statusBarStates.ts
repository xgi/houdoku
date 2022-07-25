import { atom } from 'recoil';

// eslint-disable-next-line import/prefer-default-export
export const statusTextState = atom({
  key: 'statusBarStatusTextState',
  default: '' as string | undefined,
});
