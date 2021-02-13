export const SET_SEARCH_EXTENSION = 'SET_SEARCH_EXTENSION';

export interface SearchState {
  searchExtension: number;
}

interface SetSearchExtensionAction {
  type: typeof SET_SEARCH_EXTENSION;
  payload: {
    searchExtension: number;
  };
}

export type SearchAction = SetSearchExtensionAction;
