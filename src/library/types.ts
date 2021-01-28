import { Chapter } from "../models/types";

export const UPDATE_SERIES_LIST = 'UPDATE_SERIES_LIST';
export const CHANGE_NUM_COLUMNS = 'CHANGE_NUM_COLUMNS';
export const SAVE_LIBRARY = 'SAVE_LIBRARY';
export const READ_LIBRARY = 'READ_LIBRARY';
export const DELETE_LIBRARY = 'DELETE_LIBRARY';
export const GET_SERIES = 'GET_SERIES';
export const SET_CHAPTER_READ = 'SET_CHAPTER_READ';
export const SET_RELOADING_SERIES = 'SET_RELOADING_SERIES';

export interface LibraryState {
  seriesList: string[];
  columns: number;
  reloadingSeries: boolean;
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

interface SetReloadingSeriesAction {
  type: typeof SET_RELOADING_SERIES;
  payload: {
    reloading: boolean;
  };
}

export type LibraryAction =
  | UpdateSeriesListAction
  | ChangeNumColumnsAction
  | SaveLibraryAction
  | ReadLibraryAction
  | DeleteLibraryAction
  | GetSeriesAction
  | SetChapterReadAction
  | SetReloadingSeriesAction;
