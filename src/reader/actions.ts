import { Series, Chapter, PageFit } from '../models/types';
import {
  SET_PAGE_FIT,
  TOGGLE_PAGE_FIT,
  ReaderAction,
  SET_SOURCE,
} from './types';

export function setSource(series: Series, chapter: Chapter): ReaderAction {
  return {
    type: SET_SOURCE,
    payload: {
      series,
      chapter,
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
