import { Chapter, Series } from 'houdoku-extension-lib';

export const SET_SERIES_LIST = 'SET_SERIES_LIST';
export const SET_SERIES = 'SET_SERIES';
export const SET_CHAPTER_LIST = 'SET_CHAPTER_LIST';
export const SET_RELOADING_SERIES_LIST = 'SET_RELOADING_SERIES_LIST';
export const SET_FILTER = 'SET_FILTER';
export const SET_SERIES_BANNER_URL = 'SET_SERIES_BANNER_URL';
export const SET_COMPLETED_START_RELOAD = 'SET_COMPLETED_START_RELOAD';

export interface LibraryState {
  seriesList: Series[];
  series: Series | undefined;
  chapterList: Chapter[];
  reloadingSeriesList: boolean;
  userTags: string[];
  filter: string;
  seriesBannerUrl: string | null;
  completedStartReload: boolean;
}

interface SetSeriesListAction {
  type: typeof SET_SERIES_LIST;
  payload: {
    seriesList: Series[];
  };
}

interface SetSeriesAction {
  type: typeof SET_SERIES;
  payload: {
    series: Series;
  };
}

interface SetChapterListAction {
  type: typeof SET_CHAPTER_LIST;
  payload: {
    chapterList: Chapter[];
  };
}

interface SetReloadingSeriesListAction {
  type: typeof SET_RELOADING_SERIES_LIST;
  payload: {
    reloadingSeriesList: boolean;
  };
}

interface SetFilterAction {
  type: typeof SET_FILTER;
  payload: {
    filter: string;
  };
}

interface SetSeriesBannerUrlAction {
  type: typeof SET_SERIES_BANNER_URL;
  payload: {
    seriesBannerUrl: string | null;
  };
}

interface SetCompletedStartReloadAction {
  type: typeof SET_COMPLETED_START_RELOAD;
  payload: {
    completedStartReload: boolean;
  };
}

export type LibraryAction =
  | SetSeriesListAction
  | SetSeriesAction
  | SetChapterListAction
  | SetReloadingSeriesListAction
  | SetFilterAction
  | SetSeriesBannerUrlAction
  | SetCompletedStartReloadAction;
