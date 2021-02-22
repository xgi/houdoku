import {
  CHANGE_PAGE_NUMBER,
  ReaderState,
  SET_PAGE_NUMBER,
  SET_PAGE_URLS,
  SET_SOURCE,
  SET_CHAPTER_ID_LIST,
  TOGGLE_SHOWING_SETTINGS_MODAL,
} from './types';

const initialState: ReaderState = {
  pageNumber: 1,
  lastPageNumber: 20,
  pageUrls: [],
  series: undefined,
  chapter: undefined,
  chapterIdList: [],
  createdChapterIdList: false,
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
    case SET_CHAPTER_ID_LIST:
      return {
        ...state,
        chapterIdList: action.payload.chapterIdList,
        createdChapterIdList: true,
      };
    case TOGGLE_SHOWING_SETTINGS_MODAL:
      return { ...state, showingSettingsModal: !state.showingSettingsModal };
    default:
      return state;
  }
}
