/* eslint-disable no-case-declarations */
import {
  LayoutDirection,
  PageFit,
  PageView,
  ReaderSetting,
} from '../../models/types';
import {
  CHANGE_PAGE_NUMBER,
  ReaderState,
  SET_PAGE_FIT,
  SET_PAGE_NUMBER,
  SET_PAGE_URLS,
  SET_PRELOAD_AMOUNT,
  TOGGLE_LAYOUT_DIRECTION,
  TOGGLE_PAGE_FIT,
  TOGGLE_PAGE_VIEW,
  SET_SOURCE,
  SET_CHAPTER_ID_LIST,
  SET_LAYOUT_DIRECTION,
  SET_PAGE_VIEW,
  TOGGLE_SHOWING_SETTINGS_MODAL,
} from './types';
import { saveReaderSetting } from './utils';

const initialState: ReaderState = {
  pageNumber: 1,
  lastPageNumber: 20,
  pageFit: PageFit.Auto,
  pageView: PageView.Single,
  layoutDirection: LayoutDirection.LeftToRight,
  preloadAmount: 2,
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

function nextPageFit(pageFit: PageFit): PageFit {
  if (pageFit === PageFit.Auto) {
    return PageFit.Width;
  }
  if (pageFit === PageFit.Width) {
    return PageFit.Height;
  }
  return PageFit.Auto;
}

function nextLayoutDirection(
  layoutDirection: LayoutDirection
): LayoutDirection {
  if (layoutDirection === LayoutDirection.LeftToRight) {
    return LayoutDirection.RightToLeft;
  }
  return LayoutDirection.LeftToRight;
}

function nextPageView(pageView: PageView): PageView {
  if (pageView === PageView.Single) {
    return PageView.Double;
  }
  if (pageView === PageView.Double) {
    return PageView.Double_OddStart;
  }
  return PageView.Single;
}

export default function status(
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
    case SET_PAGE_FIT:
      saveReaderSetting(ReaderSetting.PageFit, action.payload.pageFit);
      return { ...state, pageFit: action.payload.pageFit };
    case TOGGLE_PAGE_FIT:
      const newPageFit: PageFit = nextPageFit(state.pageFit);
      saveReaderSetting(ReaderSetting.PageFit, newPageFit);
      return { ...state, pageFit: newPageFit };
    case SET_PAGE_VIEW:
      saveReaderSetting(ReaderSetting.PageView, action.payload.pageView);
      return { ...state, pageView: action.payload.pageView };
    case TOGGLE_PAGE_VIEW:
      const newPageView: PageView = nextPageView(state.pageView);
      saveReaderSetting(ReaderSetting.PageView, newPageView);
      return { ...state, pageView: newPageView };
    case SET_LAYOUT_DIRECTION:
      saveReaderSetting(
        ReaderSetting.LayoutDirection,
        action.payload.layoutDirection
      );
      return { ...state, layoutDirection: action.payload.layoutDirection };
    case TOGGLE_LAYOUT_DIRECTION:
      const newLayoutDirection: LayoutDirection = nextLayoutDirection(
        state.layoutDirection
      );
      saveReaderSetting(ReaderSetting.LayoutDirection, newLayoutDirection);
      return {
        ...state,
        layoutDirection: newLayoutDirection,
      };
    case SET_PRELOAD_AMOUNT:
      saveReaderSetting(
        ReaderSetting.PreloadAmount,
        action.payload.preloadAmount
      );
      return { ...state, preloadAmount: action.payload.preloadAmount };
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
