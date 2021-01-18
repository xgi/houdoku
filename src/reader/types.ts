import {
  Chapter,
  LayoutDirection,
  PageFit,
  PageView,
  Series,
} from '../models/types';

export const SET_PAGE_NUMBER = 'SET_PAGE_NUMBER';
export const CHANGE_PAGE_NUMBER = 'CHANGE_PAGE_NUMBER';
export const SET_PAGE_FIT = 'SET_PAGE_FIT';
export const TOGGLE_PAGE_FIT = 'TOGGLE_PAGE_FIT';
export const TOGGLE_PAGE_VIEW = 'TOGGLE_PAGE_VIEW';
export const TOGGLE_LAYOUT_DIRECTION = 'TOGGLE_LAYOUT_DIRECTION';
export const SET_PRELOAD_AMOUNT = 'SET_PRELOAD_AMOUNT';
export const SET_PAGE_URLS = 'SET_PAGE_URLS';
export const SET_SOURCE = 'SET_SOURCE';
export const SET_CHAPTER_ID_LIST = 'SET_CHAPTER_ID_LIST';

export interface ReaderState {
  pageNumber: number;
  lastPageNumber: number;
  pageFit: PageFit;
  pageView: PageView;
  layoutDirection: LayoutDirection;
  preloadAmount: number;
  pageUrls: string[];
  series?: Series;
  chapter?: Chapter;
  chapterIdList: number[];
  createdChapterIdList: boolean;
}

interface SetPageNumberAction {
  type: typeof SET_PAGE_NUMBER;
  payload: {
    pageNumber: number;
  };
}

interface ChangePageNumberAction {
  type: typeof CHANGE_PAGE_NUMBER;
  payload: {
    delta: number;
  };
}

interface SetPageFitAction {
  type: typeof SET_PAGE_FIT;
  payload: {
    pageFit: PageFit;
  };
}

interface TogglePageFitAction {
  type: typeof TOGGLE_PAGE_FIT;
}

interface TogglePageViewAction {
  type: typeof TOGGLE_PAGE_VIEW;
}

interface ToggleLayoutDirectionAction {
  type: typeof TOGGLE_LAYOUT_DIRECTION;
}

interface SetPreloadAmountAction {
  type: typeof SET_PRELOAD_AMOUNT;
  payload: {
    preloadAmount: number;
  };
}

interface SetPageUrlsAction {
  type: typeof SET_PAGE_URLS;
  payload: {
    pageUrls: string[];
  };
}

interface SetSourceAction {
  type: typeof SET_SOURCE;
  payload: {
    series?: Series;
    chapter?: Chapter;
  };
}

interface SetChapterIdListAction {
  type: typeof SET_CHAPTER_ID_LIST;
  payload: {
    chapterIdList: number[];
  };
}

export type ReaderAction =
  | SetPageNumberAction
  | ChangePageNumberAction
  | SetPageFitAction
  | TogglePageFitAction
  | TogglePageViewAction
  | ToggleLayoutDirectionAction
  | SetPreloadAmountAction
  | SetPageUrlsAction
  | SetSourceAction
  | SetChapterIdListAction;