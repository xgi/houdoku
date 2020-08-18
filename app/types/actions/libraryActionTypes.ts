export const UPDATE_SERIES_LIST = 'UPDATE_SERIES_LIST';
export const CHANGE_NUM_COLUMNS = 'CHANGE_NUM_COLUMNS';

interface UpdateSeriesListAction {
  type: typeof UPDATE_SERIES_LIST;
}

interface ChangeNumColumnsAction {
  type: typeof CHANGE_NUM_COLUMNS;
  payload: {
    columns: number;
  };
}

export type LibraryAction = UpdateSeriesListAction | ChangeNumColumnsAction;
