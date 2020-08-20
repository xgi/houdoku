export const UPDATE_SERIES_LIST = 'UPDATE_SERIES_LIST';
export const CHANGE_NUM_COLUMNS = 'CHANGE_NUM_COLUMNS';
export const SAVE_LIBRARY = 'SAVE_LIBRARY';
export const READ_LIBRARY = 'READ_LIBRARY';
export const DELETE_LIBRARY = 'DELETE_LIBRARY';

interface UpdateSeriesListAction {
  type: typeof UPDATE_SERIES_LIST;
}

interface SaveLibraryAction {
  type: typeof SAVE_LIBRARY;
}

interface ReadLibraryAction {
  type: typeof READ_LIBRARY;
}

interface DeleteLibraryAction {
  type: typeof DELETE_LIBRARY;
}

interface ChangeNumColumnsAction {
  type: typeof CHANGE_NUM_COLUMNS;
  payload: {
    columns: number;
  };
}

export type LibraryAction =
  | UpdateSeriesListAction
  | ChangeNumColumnsAction
  | SaveLibraryAction
  | ReadLibraryAction
  | DeleteLibraryAction;
