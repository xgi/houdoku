import { Series, Chapter } from '../models/types';

export const BEFORE_LOAD_SERIES_LIST = 'BEFORE_LOAD_SERIES_LIST';
export const AFTER_LOAD_SERIES_LIST = 'AFTER_LOAD_SERIES_LIST';
export const BEFORE_LOAD_SERIES = 'BEFORE_LOAD_SERIES';
export const AFTER_LOAD_SERIES = 'AFTER_LOAD_SERIES';
export const BEFORE_LOAD_CHAPTER = 'BEFORE_LOAD_CHAPTER';
export const AFTER_LOAD_CHAPTER = 'AFTER_LOAD_CHAPTER';
export const BEFORE_LOAD_CHAPTER_LIST = 'BEFORE_LOAD_CHAPTER_LIST';
export const AFTER_LOAD_CHAPTER_LIST = 'AFTER_LOAD_CHAPTER_LIST';
export const BEFORE_ADD_SERIES = 'BEFORE_ADD_SERIES';
export const AFTER_ADD_SERIES = 'AFTER_ADD_SERIES';

export interface DatabaseState {
  fetchingSeriesList: boolean;
  fetchingSeries: boolean;
  fetchingChapter: boolean;
  fetchingChapterList: boolean;
  addingSeries: boolean;
  seriesList: Series[];
  series?: Series;
  chapter?: Chapter;
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

interface BeforeLoadChapterAction {
  type: typeof BEFORE_LOAD_CHAPTER;
  payload: unknown;
}

interface AfterLoadChapterAction {
  type: typeof AFTER_LOAD_CHAPTER;
  payload: {
    chapter: Chapter;
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
  | BeforeLoadChapterAction
  | AfterLoadChapterAction
  | BeforeLoadChapterListAction
  | AfterLoadChapterListAction
  | BeforeAddSeriesAction
  | AfterAddSeriesAction;
