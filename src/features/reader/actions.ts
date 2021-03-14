import { Chapter, Series } from '../../models/types';
import {
  ReaderAction,
  SET_PAGE_NUMBER,
  CHANGE_PAGE_NUMBER,
  SET_PAGE_URLS,
  SET_SOURCE,
  TOGGLE_SHOWING_SETTINGS_MODAL,
  SET_RELEVANT_CHAPTER_LIST,
  SET_PAGE_DATA_LIST,
} from './types';

export function setPageNumber(pageNumber: number): ReaderAction {
  return {
    type: SET_PAGE_NUMBER,
    payload: {
      pageNumber,
    },
  };
}

export function changePageNumber(delta: number): ReaderAction {
  return {
    type: CHANGE_PAGE_NUMBER,
    payload: {
      delta,
    },
  };
}

export function setPageUrls(pageUrls: string[]): ReaderAction {
  return {
    type: SET_PAGE_URLS,
    payload: {
      pageUrls,
    },
  };
}

export function setPageDataList(pageDataList: string[]): ReaderAction {
  return {
    type: SET_PAGE_DATA_LIST,
    payload: {
      pageDataList,
    },
  };
}

export function setSource(series?: Series, chapter?: Chapter): ReaderAction {
  return {
    type: SET_SOURCE,
    payload: {
      series,
      chapter,
    },
  };
}

export function setRelevantChapterList(
  relevantChapterList: Chapter[]
): ReaderAction {
  return {
    type: SET_RELEVANT_CHAPTER_LIST,
    payload: {
      relevantChapterList,
    },
  };
}

export function toggleShowingSettingsModal(): ReaderAction {
  return {
    type: TOGGLE_SHOWING_SETTINGS_MODAL,
  };
}
