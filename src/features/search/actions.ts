import { SearchAction, SET_SEARCH_EXTENSION } from './types';

// eslint-disable-next-line import/prefer-default-export
export function setSearchExtension(searchExtension: number): SearchAction {
  return {
    type: SET_SEARCH_EXTENSION,
    payload: {
      searchExtension,
    },
  };
}
