import { LayoutDirection, PageFit } from '../models/types';
import { PageUrlFunction } from '../services/extensions/interface';

export const SET_PAGE_NUMBER = 'SET_PAGE_NUMBER';
export const CHANGE_PAGE_NUMBER = 'CHANGE_PAGE_NUMBER';
export const SET_PAGE_FIT = 'SET_PAGE_FIT';
export const TOGGLE_PAGE_FIT = 'TOGGLE_PAGE_FIT';
export const TOGGLE_TWO_PAGE_VIEW = 'TOGGLE_TWO_PAGE_VIEW';
export const TOGGLE_TWO_PAGE_EVEN_START = 'TOGGLE_TWO_PAGE_EVEN_START';
export const TOGGLE_LAYOUT_DIRECTION = 'TOGGLE_LAYOUT_DIRECTION';
export const SET_PRELOAD_AMOUNT = 'SET_PRELOAD_AMOUNT';
export const SET_PAGE_URL_FUNCTION = 'SET_PAGE_URL_FUNCTION';

export interface ReaderState {
  pageNumber: number;
  lastPageNumber: number;
  pageFit: PageFit;
  twoPageView: boolean;
  twoPageEvenStart: boolean;
  layoutDirection: LayoutDirection;
  preloadAmount: number;
  pageUrlFunction: PageUrlFunction;
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

interface ToggleTwoPageViewAction {
  type: typeof TOGGLE_TWO_PAGE_VIEW;
}

interface ToggleTwoPageEvenStartAction {
  type: typeof TOGGLE_TWO_PAGE_EVEN_START;
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

interface SetPageUrlFunction {
  type: typeof SET_PAGE_URL_FUNCTION;
  payload: {
    pageUrlFunction: PageUrlFunction;
  };
}

export type ReaderAction =
  | SetPageNumberAction
  | ChangePageNumberAction
  | SetPageFitAction
  | TogglePageFitAction
  | ToggleTwoPageViewAction
  | ToggleTwoPageEvenStartAction
  | ToggleLayoutDirectionAction
  | SetPreloadAmountAction
  | SetPageUrlFunction;
