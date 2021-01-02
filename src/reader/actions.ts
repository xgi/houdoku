import { PageFit } from '../models/types';
import {
  SET_PAGE_FIT,
  TOGGLE_PAGE_FIT,
  ReaderAction,
  SET_PAGE_NUMBER,
  CHANGE_PAGE_NUMBER,
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
