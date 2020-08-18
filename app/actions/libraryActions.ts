import {
  UPDATE_SERIES_LIST,
  CHANGE_NUM_COLUMNS,
  LibraryAction,
} from '../types/actions/libraryActionTypes';

export function updateSeriesList(): LibraryAction {
  return {
    type: UPDATE_SERIES_LIST,
  };
}

export function changeNumColumns(columns: number): LibraryAction {
  return {
    type: CHANGE_NUM_COLUMNS,
    payload: {
      columns,
    },
  };
}
