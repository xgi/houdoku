import { PageFit } from '../models/types';

export const SET_PAGE_NUMBER = 'SET_PAGE_NUMBER';
export const CHANGE_PAGE_NUMBER = 'CHANGE_PAGE_NUMBER';
export const SET_PAGE_FIT = 'SET_PAGE_FIT';
export const TOGGLE_PAGE_FIT = 'TOGGLE_PAGE_FIT';

export interface ReaderState {
  pageNumber: number;
  lastPageNumber: number;
  pageFit: PageFit;
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

export type ReaderAction =
  | SetPageNumberAction
  | ChangePageNumberAction
  | SetPageFitAction
  | TogglePageFitAction;
