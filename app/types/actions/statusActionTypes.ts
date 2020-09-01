export const SET_STATUS_TEXT = 'SET_STATUS_TEXT';

interface SetStatusTextAction {
  type: typeof SET_STATUS_TEXT;
  payload: {
    text?: string;
  };
}

export type StatusAction = SetStatusTextAction;
