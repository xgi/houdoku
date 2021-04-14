import {
  CHANGE_PAGE_NUMBER,
  ReaderState,
  SET_PAGE_NUMBER,
  SET_PAGE_URLS,
  SET_SOURCE,
  TOGGLE_SHOWING_SETTINGS_MODAL,
  SET_RELEVANT_CHAPTER_LIST,
  SET_PAGE_DATA_LIST,
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
};

function sanitizedPageNumber(
  pageNumber: number,
  lastPageNumber: number
): number {
  if (pageNumber < 1) {
    return 1;
  }
  if (pageNumber > lastPageNumber) {
    return lastPageNumber;
  }
  return pageNumber;
}

export default function reader(
  state = initialState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
): ReaderState {
  switch (action.type) {
    case SET_PAGE_NUMBER:
      return {
        ...state,
        pageNumber: sanitizedPageNumber(
          action.payload.pageNumber,
          state.lastPageNumber
        ),
      };
    case CHANGE_PAGE_NUMBER:
      return {
        ...state,
        pageNumber: sanitizedPageNumber(
          state.pageNumber + action.payload.delta,
          state.lastPageNumber
        ),
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
    default:
      return state;
  }
}
