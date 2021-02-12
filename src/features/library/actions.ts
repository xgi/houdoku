import {
  UPDATE_SERIES_LIST,
  CHANGE_NUM_COLUMNS,
  LibraryAction,
  SET_FILTER,
  SET_SEARCH_EXTENSION,
} from './types';

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

export function setFilter(filter: string): LibraryAction {
  return {
    type: SET_FILTER,
    payload: {
      filter,
    },
  };
}

export function setSearchExtension(searchExtension: number): LibraryAction {
  return {
    type: SET_SEARCH_EXTENSION,
    payload: {
      searchExtension,
    },
  };
}
