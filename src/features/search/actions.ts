import { Series } from '../../models/types';
import {
  SearchAction,
  SET_ADD_MODAL_SERIES,
  SET_SEARCH_EXTENSION,
  SET_SEARCH_RESULTS,
  TOGGLE_SHOWING_ADD_MODAL,
} from './types';

export function setSearchExtension(searchExtension: number): SearchAction {
  return {
    type: SET_SEARCH_EXTENSION,
    payload: {
      searchExtension,
    },
  };
}

export function setSearchResults(searchResults: Series[]): SearchAction {
  return {
    type: SET_SEARCH_RESULTS,
    payload: {
      searchResults,
    },
  };
}

export function toggleShowingAddModal(): SearchAction {
  return {
    type: TOGGLE_SHOWING_ADD_MODAL,
  };
}

export function setAddModalSeries(addModalSeries: Series): SearchAction {
  return {
    type: SET_ADD_MODAL_SERIES,
    payload: {
      addModalSeries,
    },
  };
}
