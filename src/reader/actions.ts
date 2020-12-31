import { PageFit } from '../models/types';
import { SET_PAGE_FIT, TOGGLE_PAGE_FIT, ReaderAction } from './types';

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
