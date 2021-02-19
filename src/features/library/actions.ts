import {
  UPDATE_SERIES_LIST,
  CHANGE_NUM_COLUMNS,
  LibraryAction,
  SET_FILTER,
} from './types';

export function changeNumColumns(columns: number): LibraryAction {
  return {
    type: CHANGE_NUM_COLUMNS,
    payload: {
      columns,
    },
  };
}

export function setFilter(filter: string): LibraryAction {
  return {
    type: SET_FILTER,
    payload: {
      filter,
    },
  };
}
