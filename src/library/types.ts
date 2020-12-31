import Chapter from '../models/chapter';
import Library from '../models/library';
import Series from '../models/series';

export const UPDATE_SERIES_LIST = 'UPDATE_SERIES_LIST';
export const CHANGE_NUM_COLUMNS = 'CHANGE_NUM_COLUMNS';
export const SAVE_LIBRARY = 'SAVE_LIBRARY';
export const READ_LIBRARY = 'READ_LIBRARY';
export const DELETE_LIBRARY = 'DELETE_LIBRARY';
export const GET_SERIES = 'GET_SERIES';
export const SET_CHAPTER_READ = 'SET_CHAPTER_READ';

export interface LibraryState {
  seriesList: string[];
  columns: number;
}

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

interface GetSeriesAction {
  type: typeof GET_SERIES;
  payload: {
    uuid: string;
  };
}

interface SetChapterReadAction {
  type: typeof SET_CHAPTER_READ;
  payload: {
    chapter: Chapter;
    read: boolean;
  };
}

export type LibraryAction =
  | UpdateSeriesListAction
  | ChangeNumColumnsAction
  | SaveLibraryAction
  | ReadLibraryAction
  | DeleteLibraryAction
  | GetSeriesAction
  | SetChapterReadAction;
