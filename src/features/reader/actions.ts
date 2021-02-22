import { Chapter, Series } from '../../models/types';
import {
  ReaderAction,
  SET_PAGE_NUMBER,
  CHANGE_PAGE_NUMBER,
  SET_PAGE_URLS,
  SET_SOURCE,
  SET_CHAPTER_ID_LIST,
  TOGGLE_SHOWING_SETTINGS_MODAL,
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

export function setSource(series?: Series, chapter?: Chapter): ReaderAction {
  return {
    type: SET_SOURCE,
    payload: {
      series,
      chapter,
    },
  };
}

export function setChapterIdList(chapterIdList: number[]): ReaderAction {
  return {
    type: SET_CHAPTER_ID_LIST,
    payload: {
      chapterIdList,
    },
  };
}

export function toggleShowingSettingsModal(): ReaderAction {
  return {
    type: TOGGLE_SHOWING_SETTINGS_MODAL,
  };
}
