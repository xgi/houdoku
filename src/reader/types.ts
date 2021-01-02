import { Series, Chapter, PageFit } from '../models/types';

export const SET_SOURCE = 'SET_SOURCE';
export const SET_PAGE_FIT = 'SET_PAGE_FIT';
export const TOGGLE_PAGE_FIT = 'TOGGLE_PAGE_FIT';

export interface ReaderState {
  series?: Series;
  chapter?: Chapter;
  pageFit: PageFit;
}

interface SetSource {
  type: typeof SET_SOURCE;
  payload: {
    series: Series;
    chapter: Chapter;
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

export type ReaderAction = SetPageFitAction | TogglePageFitAction;
