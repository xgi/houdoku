import { Chapter, Series } from 'houdoku-extension-lib';
import {
  LibraryAction,
  SET_CHAPTER_FILTER_GROUP,
  SET_CHAPTER_FILTER_TITLE,
  SET_CHAPTER_LIST,
  SET_COMPLETED_START_RELOAD,
  SET_FILTER,
  SET_RELOADING_SERIES_LIST,
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

export function setReloadingSeriesList(
  reloadingSeriesList: boolean
): LibraryAction {
  return {
    type: SET_RELOADING_SERIES_LIST,
    payload: {
      reloadingSeriesList,
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

export function setCompletedStartReload(
  completedStartReload: boolean
): LibraryAction {
  return {
    type: SET_COMPLETED_START_RELOAD,
    payload: {
      completedStartReload,
    },
  };
}

export function setChapterFilterTitle(value: string): LibraryAction {
  return {
    type: SET_CHAPTER_FILTER_TITLE,
    payload: {
      chapterFilterTitle: value,
    },
  };
}

export function setChapterFilterGroup(value: string): LibraryAction {
  return {
    type: SET_CHAPTER_FILTER_GROUP,
    payload: {
      chapterFilterGroup: value,
    },
  };
}
