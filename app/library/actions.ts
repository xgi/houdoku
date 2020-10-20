import {
  UPDATE_SERIES_LIST,
  CHANGE_NUM_COLUMNS,
  LibraryAction,
  READ_LIBRARY,
  SAVE_LIBRARY,
  DELETE_LIBRARY,
  SHOW_HIDE_SERIES_DETAILS,
} from './types';
import Series from '../models/series';

export function updateSeriesList(): LibraryAction {
  return {
    type: UPDATE_SERIES_LIST,
  };
}

export function saveLibrary(): LibraryAction {
  return {
    type: SAVE_LIBRARY,
  };
}

export function readLibrary(): LibraryAction {
  return {
    type: READ_LIBRARY,
  };
}

export function deleteLibrary(): LibraryAction {
  return {
    type: DELETE_LIBRARY,
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

export function showHideSeriesDetails(series?: Series): LibraryAction {
  return {
    type: SHOW_HIDE_SERIES_DETAILS,
    payload: {
      series,
    },
  };
}
