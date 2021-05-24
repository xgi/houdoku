import { Series } from 'houdoku-extension-lib';
import {
  SearchAction,
  SET_ADD_MODAL_SERIES,
  SET_SEARCH_EXTENSION,
  SET_SEARCH_RESULTS,
  TOGGLE_SHOWING_ADD_MODAL,
} from './types';

export function setSearchExtension(searchExtension: string): SearchAction {
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

export function toggleShowingAddModal(editable: boolean): SearchAction {
  return {
    type: TOGGLE_SHOWING_ADD_MODAL,
    payload: {
      editable,
    },
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
