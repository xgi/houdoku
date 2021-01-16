import { Chapter, PageFit, Series } from '../models/types';
import {
  SET_PAGE_FIT,
  TOGGLE_PAGE_FIT,
  ReaderAction,
  SET_PAGE_NUMBER,
  CHANGE_PAGE_NUMBER,
  TOGGLE_PAGE_VIEW,
  TOGGLE_LAYOUT_DIRECTION,
  SET_PRELOAD_AMOUNT,
  SET_PAGE_URLS,
  SET_SOURCE,
  SET_CHAPTER_ID_LIST,
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

export function setPageFit(pageFit: PageFit): ReaderAction {
  return {
    type: SET_PAGE_FIT,
    payload: {
      pageFit,
    },
  };
}

export function togglePageFit(): ReaderAction {
  return {
    type: TOGGLE_PAGE_FIT,
  };
}

export function togglePageView(): ReaderAction {
  return {
    type: TOGGLE_PAGE_VIEW,
  };
}

export function toggleLayoutDirection(): ReaderAction {
  return {
    type: TOGGLE_LAYOUT_DIRECTION,
  };
}

export function setPreloadAmount(preloadAmount: number): ReaderAction {
  return {
    type: SET_PRELOAD_AMOUNT,
    payload: {
      preloadAmount,
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
