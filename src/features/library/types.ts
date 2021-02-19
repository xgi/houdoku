export const UPDATE_SERIES_LIST = 'UPDATE_SERIES_LIST';
export const CHANGE_NUM_COLUMNS = 'CHANGE_NUM_COLUMNS';
export const SET_FILTER = 'SET_FILTER';

export interface LibraryState {
  seriesList: string[];
  columns: number;
  filter: string;
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

export type LibraryAction = ChangeNumColumnsAction | SetFilterAction;
