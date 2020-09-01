import {
  SET_STATUS_TEXT,
  StatusAction,
} from '../types/actions/statusActionTypes';

// eslint-disable-next-line import/prefer-default-export
export function setStatusText(text?: string): StatusAction {
  return {
    type: SET_STATUS_TEXT,
    payload: {
      text,
    },
  };
}
