import {
  Chapter,
  ProgressFilter,
  Series,
  SeriesStatus,
} from '../../models/types';

export const SET_SERIES_LIST = 'SET_SERIES_LIST';
export const SET_SERIES = 'SET_SERIES';
export const SET_CHAPTER_LIST = 'SET_CHAPTER_LIST';
export const CHANGE_NUM_COLUMNS = 'CHANGE_NUM_COLUMNS';
export const SET_FILTER = 'SET_FILTER';
export const SET_FILTER_STATUS = 'SET_FILTER_STATUS';
export const SET_FILTER_PROGRESS = 'SET_FILTER_PROGRESS';
export const SET_SERIES_BANNER_URL = 'SET_SERIES_BANNER_URL';

export interface LibraryState {
  seriesList: Series[];
  series: Series | undefined;
  chapterList: Chapter[];
  userTags: string[];
  columns: number;
  filter: string;
  filterStatus: SeriesStatus | null;
  filterProgress: ProgressFilter;
  seriesBannerUrl: string | null;
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

interface SetFilterStatusAction {
  type: typeof SET_FILTER_STATUS;
  payload: {
    status: SeriesStatus | null;
  };
}

interface SetFilterProgressAction {
  type: typeof SET_FILTER_PROGRESS;
  payload: {
    progress: ProgressFilter;
  };
}

interface SetSeriesBannerUrlAction {
  type: typeof SET_SERIES_BANNER_URL;
  payload: {
    seriesBannerUrl: string | null;
  };
}

export type LibraryAction =
  | SetSeriesListAction
  | SetSeriesAction
  | SetChapterListAction
  | ChangeNumColumnsAction
  | SetFilterAction
  | SetFilterStatusAction
  | SetFilterProgressAction
  | SetSeriesBannerUrlAction;
