export const UPDATE_SERIES_LIST = 'UPDATE_SERIES_LIST';
export const CHANGE_NUM_COLUMNS = 'CHANGE_NUM_COLUMNS';
export const SET_FILTER = 'SET_FILTER';
export const SET_SEARCH_EXTENSION = 'SET_SEARCH_EXTENSION';

export interface LibraryState {
  seriesList: string[];
  columns: number;
  filter: string;
  searchExtension: number;
}

interface UpdateSeriesListAction {
  type: typeof UPDATE_SERIES_LIST;
}

interface ChangeNumColumnsAction {
  type: typeof CHANGE_NUM_COLUMNS;
  payload: {
    columns: number;
  };
}

interface SetFilterAction {
  type: typeof SET_FILTER;
  payload: {
    filter: string;
  };
}

interface SetSearchExtensionAction {
  type: typeof SET_SEARCH_EXTENSION;
  payload: {
    searchExtension: number;
  };
}

export type LibraryAction =
  | UpdateSeriesListAction
  | ChangeNumColumnsAction
  | SetFilterAction
  | SetSearchExtensionAction;
