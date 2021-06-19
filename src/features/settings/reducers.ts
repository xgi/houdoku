/* eslint-disable no-case-declarations */
import {
  GeneralSetting,
  LayoutDirection,
  PageFit,
  PageView,
  ReaderSetting,
  TrackerSetting,
} from '../../models/types';
import {
  SettingsState,
  SET_PAGE_FIT,
  SET_PRELOAD_AMOUNT,
  TOGGLE_LAYOUT_DIRECTION,
  TOGGLE_PAGE_FIT,
  TOGGLE_PAGE_VIEW,
  SET_LAYOUT_DIRECTION,
  SET_PAGE_VIEW,
  SET_CHAPTER_LANGUAGES,
  SET_REFRESH_ON_START,
  SET_OVERLAY_PAGE_NUMBER,
  SET_TRACKER_AUTO_UPDATE,
} from './types';
import {
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_READER_SETTINGS,
  DEFAULT_TRACKER_SETTINGS,
  getStoredGeneralSettings,
  getStoredReaderSettings,
  getStoredTrackerSettings,
  saveGeneralSetting,
  saveReaderSetting,
  saveTrackerSetting,
} from './utils';

const storedGeneralSettings = getStoredGeneralSettings();
const storedReaderSettings = getStoredReaderSettings();
const storedTrackerSettings = getStoredTrackerSettings();

const initialState: SettingsState = {
  chapterLanguages:
    storedGeneralSettings.ChapterLanguages === undefined
      ? DEFAULT_GENERAL_SETTINGS[GeneralSetting.ChapterLanguages]
      : storedGeneralSettings.ChapterLanguages,
  refreshOnStart:
    storedGeneralSettings.RefreshOnStart === undefined
      ? DEFAULT_GENERAL_SETTINGS[GeneralSetting.RefreshOnStart]
      : storedGeneralSettings.RefreshOnStart,
  pageFit:
    storedReaderSettings.PageFit === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.PageFit]
      : storedReaderSettings.PageFit,
  pageView:
    storedReaderSettings.PageView === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.PageView]
      : storedReaderSettings.PageView,
  layoutDirection:
    storedReaderSettings.LayoutDirection === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.LayoutDirection]
      : storedReaderSettings.LayoutDirection,
  preloadAmount:
    storedReaderSettings.PreloadAmount === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.PreloadAmount]
      : storedReaderSettings.PreloadAmount,
  overlayPageNumber:
    storedReaderSettings.OverlayPageNumber === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.OverlayPageNumber]
      : storedReaderSettings.OverlayPageNumber,
  trackerAutoUpdate:
    storedTrackerSettings.TrackerAutoUpdate === undefined
      ? DEFAULT_TRACKER_SETTINGS[TrackerSetting.TrackerAutoUpdate]
      : storedTrackerSettings.TrackerAutoUpdate,
};

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
  if (layoutDirection === LayoutDirection.RightToLeft) {
    return LayoutDirection.Vertical;
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

export default function settings(
  state = initialState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
): SettingsState {
  switch (action.type) {
    case SET_CHAPTER_LANGUAGES:
      saveGeneralSetting(
        GeneralSetting.ChapterLanguages,
        action.payload.chapterLanguages
      );
      return { ...state, chapterLanguages: action.payload.chapterLanguages };
    case SET_REFRESH_ON_START:
      saveGeneralSetting(
        GeneralSetting.RefreshOnStart,
        action.payload.refreshOnStart
      );
      return { ...state, refreshOnStart: action.payload.refreshOnStart };
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
    case SET_OVERLAY_PAGE_NUMBER:
      saveReaderSetting(
        ReaderSetting.OverlayPageNumber,
        action.payload.overlayPageNumber
      );
      return { ...state, overlayPageNumber: action.payload.overlayPageNumber };
    case SET_TRACKER_AUTO_UPDATE:
      saveTrackerSetting(
        TrackerSetting.TrackerAutoUpdate,
        action.payload.trackerAutoUpdate
      );
      return { ...state, trackerAutoUpdate: action.payload.trackerAutoUpdate };
    default:
      return state;
  }
}
