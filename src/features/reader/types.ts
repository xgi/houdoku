import { Chapter, Series } from 'houdoku-extension-lib';

export const SET_PAGE_NUMBER = 'SET_PAGE_NUMBER';
export const CHANGE_PAGE_NUMBER = 'CHANGE_PAGE_NUMBER';
export const SET_PAGE_URLS = 'SET_PAGE_URLS';
export const SET_PAGE_DATA_LIST = 'SET_PAGE_DATA_LIST';
export const SET_SOURCE = 'SET_SOURCE';
export const SET_RELEVANT_CHAPTER_LIST = 'SET_RELEVANT_CHAPTER_LIST';
export const TOGGLE_SHOWING_SETTINGS_MODAL = 'TOGGLE_SHOWING_SETTINGS_MODAL';
export const TOGGLE_SHOWING_SIDEBAR = 'TOGGLE_SHOWING_SIDEBAR';
export const TOGGLE_SHOWING_HEADER = 'TOGGLE_SHOWING_HEADER';

export interface ReaderState {
  pageNumber: number;
  lastPageNumber: number;
  pageUrls: string[];
  pageDataList: string[];
  series?: Series;
  chapter?: Chapter;
  relevantChapterList: Chapter[];
  showingSettingsModal: boolean;
  showingSidebar: boolean;
  showingHeader: boolean;
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

interface SetPageDataListAction {
  type: typeof SET_PAGE_DATA_LIST;
  payload: {
    pageDataList: string[];
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

interface ToggleShowingSidebarAction {
  type: typeof TOGGLE_SHOWING_SIDEBAR;
}

interface ToggleShowingHeaderAction {
  type: typeof TOGGLE_SHOWING_HEADER;
}

export type ReaderAction =
  | SetPageNumberAction
  | ChangePageNumberAction
  | SetPageUrlsAction
  | SetPageDataListAction
  | SetSourceAction
  | SetRelevantChapterListAction
  | ToggleShowingSettingsModal
  | ToggleShowingSidebarAction
  | ToggleShowingHeaderAction;
