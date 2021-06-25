import log from 'electron-log';
import { StatusState, SET_STATUS_TEXT } from './types';

const initialState: StatusState = {
  text: '',
};

export default function status(
  state = initialState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
): StatusState {
  switch (action.type) {
    case SET_STATUS_TEXT:
      log.debug(`statusbar: ${action.payload.text}`);
      return { ...state, text: action.payload.text };
    default:
      return state;
  }
}
