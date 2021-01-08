import { PageFit } from '../models/types';
import {
  SET_PAGE_FIT,
  TOGGLE_PAGE_FIT,
  ReaderAction,
  SET_PAGE_NUMBER,
  CHANGE_PAGE_NUMBER,
  TOGGLE_TWO_PAGE_VIEW,
  TOGGLE_TWO_PAGE_EVEN_START,
  TOGGLE_LAYOUT_DIRECTION,
  SET_PRELOAD_AMOUNT,
  SET_PAGE_URLS,
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

export function toggleTwoPageView(): ReaderAction {
  return {
    type: TOGGLE_TWO_PAGE_VIEW,
  };
}

export function toggleTwoPageEvenStart(): ReaderAction {
  return {
    type: TOGGLE_TWO_PAGE_EVEN_START,
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
