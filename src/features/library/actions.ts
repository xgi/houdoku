import { Chapter, Series, SeriesStatus } from '../../models/types';
import {
  CHANGE_NUM_COLUMNS,
  LibraryAction,
  SET_CHAPTER_LIST,
  SET_FILTER,
  SET_FILTER_STATUS,
  SET_SERIES,
  SET_SERIES_BANNER_URL,
  SET_SERIES_LIST,
} from './types';

export function setSeriesList(seriesList: Series[]): LibraryAction {
  return {
    type: SET_SERIES_LIST,
    payload: {
      seriesList,
    },
  };
}

export function setSeries(series: Series): LibraryAction {
  return {
    type: SET_SERIES,
    payload: {
      series,
    },
  };
}

export function setChapterList(chapterList: Chapter[]): LibraryAction {
  return {
    type: SET_CHAPTER_LIST,
    payload: {
      chapterList,
    },
  };
}

export function changeNumColumns(columns: number): LibraryAction {
  return {
    type: CHANGE_NUM_COLUMNS,
    payload: {
      columns,
    },
  };
}

export function setFilter(filter: string): LibraryAction {
  return {
    type: SET_FILTER,
    payload: {
      filter,
    },
  };
}

export function setFilterStatus(status: SeriesStatus | null): LibraryAction {
  return {
    type: SET_FILTER_STATUS,
    payload: {
      status,
    },
  };
}

export function setSeriesBannerUrl(
  seriesBannerUrl: string | null
): LibraryAction {
  return {
    type: SET_SERIES_BANNER_URL,
    payload: {
      seriesBannerUrl,
    },
  };
}
