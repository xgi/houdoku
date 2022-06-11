import {
  CHANGE_PAGE_NUMBER,
  ReaderState,
  SET_PAGE_NUMBER,
  SET_PAGE_URLS,
  SET_SOURCE,
  TOGGLE_SHOWING_SETTINGS_MODAL,
  SET_RELEVANT_CHAPTER_LIST,
  SET_PAGE_DATA_LIST,
  TOGGLE_SHOWING_SIDEBAR,
  TOGGLE_SHOWING_HEADER,
  SET_SHOWING_NO_NEXT_CHAPTER,
} from './types';

const initialState: ReaderState = {
  pageNumber: 1,
  lastPageNumber: 0,
  pageUrls: [],
  pageDataList: [],
  series: undefined,
  chapter: undefined,
  relevantChapterList: [],
  showingSettingsModal: false,
  showingSidebar: true,
  showingHeader: true,
  showingNoNextChapter: false,
};

export default function reader(
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state = initialState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
): ReaderState {
  switch (action.type) {
    case SET_PAGE_NUMBER:
      return {
        ...state,
        pageNumber: action.payload.pageNumber,
      };
    case CHANGE_PAGE_NUMBER:
      return {
        ...state,
        pageNumber: state.pageNumber + action.payload.delta,
      };
    case SET_PAGE_URLS:
      return {
        ...state,
        pageUrls: action.payload.pageUrls,
        lastPageNumber: action.payload.pageUrls.length,
      };
    case SET_PAGE_DATA_LIST:
      return { ...state, pageDataList: action.payload.pageDataList };
    case SET_SOURCE:
      return {
        ...state,
        series:
          action.payload.series === undefined
            ? state.series
            : action.payload.series,
        chapter:
          action.payload.chapter === undefined
            ? state.chapter
            : action.payload.chapter,
      };
    case SET_RELEVANT_CHAPTER_LIST:
      return {
        ...state,
        relevantChapterList: action.payload.relevantChapterList,
      };
    case TOGGLE_SHOWING_SETTINGS_MODAL:
      return { ...state, showingSettingsModal: !state.showingSettingsModal };
    case TOGGLE_SHOWING_SIDEBAR:
      return { ...state, showingSidebar: !state.showingSidebar };
    case TOGGLE_SHOWING_HEADER:
      return { ...state, showingHeader: !state.showingHeader };
    case SET_SHOWING_NO_NEXT_CHAPTER:
      return {
        ...state,
        showingNoNextChapter: action.payload.showingNoNextChapter,
      };
    default:
      return state;
  }
}
