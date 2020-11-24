import { Series, Chapter } from '../models/types';

export const BEFORE_LOAD_SERIES_LIST = 'BEFORE_LOAD_SERIES_LIST';
export const AFTER_LOAD_SERIES_LIST = 'AFTER_LOAD_SERIES_LIST';
export const BEFORE_LOAD_SERIES = 'BEFORE_LOAD_SERIES';
export const AFTER_LOAD_SERIES = 'AFTER_LOAD_SERIES';
export const BEFORE_LOAD_CHAPTER_LIST = 'BEFORE_LOAD_CHAPTER_LIST';
export const AFTER_LOAD_CHAPTER_LIST = 'AFTER_LOAD_CHAPTER_LIST';
export const BEFORE_ADD_SERIES = 'BEFORE_ADD_SERIES';
export const AFTER_ADD_SERIES = 'AFTER_ADD_SERIES';

export interface DatabaseState {
  fetchingSeriesList: boolean;
  fetchingSeries: boolean;
  fetchingChapterList: boolean;
  addingSeries: boolean;
  seriesList: Series[];
  series?: Series;
  chapterList: Chapter[];
  addedSeries?: Series;
}

interface BeforeLoadSeriesListAction {
  type: typeof BEFORE_LOAD_SERIES_LIST;
  payload: unknown;
}

interface AfterLoadSeriesListAction {
  type: typeof AFTER_LOAD_SERIES_LIST;
  payload: {
    response: unknown;
  };
}

interface BeforeLoadSeriesAction {
  type: typeof BEFORE_LOAD_SERIES;
  payload: unknown;
}

interface AfterLoadSeriesAction {
  type: typeof AFTER_LOAD_SERIES;
  payload: {
    series: Series;
  };
}

interface BeforeLoadChapterListAction {
  type: typeof BEFORE_LOAD_CHAPTER_LIST;
  payload: unknown;
}

interface AfterLoadChapterListAction {
  type: typeof AFTER_LOAD_CHAPTER_LIST;
  payload: {
    response: unknown;
  };
}

interface BeforeAddSeriesAction {
  type: typeof BEFORE_ADD_SERIES;
  payload: unknown;
}

interface AfterAddSeriesAction {
  type: typeof AFTER_ADD_SERIES;
  payload: {
    addedSeries: Series;
  };
}

export type DatabaseAction =
  | BeforeLoadSeriesListAction
  | AfterLoadSeriesListAction
  | BeforeLoadSeriesAction
  | AfterLoadSeriesAction
  | BeforeLoadChapterListAction
  | AfterLoadChapterListAction
  | BeforeAddSeriesAction
  | AfterAddSeriesAction;
