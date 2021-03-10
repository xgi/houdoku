import { Chapter, Series } from '../../models/types';

export const SET_PAGE_NUMBER = 'SET_PAGE_NUMBER';
export const CHANGE_PAGE_NUMBER = 'CHANGE_PAGE_NUMBER';
export const SET_PAGE_URLS = 'SET_PAGE_URLS';
export const SET_SOURCE = 'SET_SOURCE';
export const SET_RELEVANT_CHAPTER_LIST = 'SET_RELEVANT_CHAPTER_LIST';
export const TOGGLE_SHOWING_SETTINGS_MODAL = 'TOGGLE_SHOWING_SETTINGS_MODAL';

export interface ReaderState {
  pageNumber: number;
  lastPageNumber: number;
  pageUrls: string[];
  series?: Series;
  chapter?: Chapter;
  relevantChapterList: Chapter[];
  showingSettingsModal: boolean;
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

interface SetRelevantChapterListAction {
  type: typeof SET_RELEVANT_CHAPTER_LIST;
  payload: {
    relevantChapterList: Chapter[];
  };
}

interface ToggleShowingSettingsModal {
  type: typeof TOGGLE_SHOWING_SETTINGS_MODAL;
}

export type ReaderAction =
  | SetPageNumberAction
  | ChangePageNumberAction
  | SetPageUrlsAction
  | SetSourceAction
  | SetRelevantChapterListAction
  | ToggleShowingSettingsModal;
