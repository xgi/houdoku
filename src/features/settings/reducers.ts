/* eslint-disable no-case-declarations */
import {
  GeneralSetting,
  IntegrationSetting,
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
  SET_DISCORD_PRESENCE_ENABLED,
  SET_AUTO_CHECK_FOR_UPDATES,
  SET_LIBRARY_COLUMNS,
  SET_LIBRARY_FILTER_STATUS,
  SET_LIBRARY_FILTER_PROGRESS,
  SET_LIBRARY_FILTER_USER_TAGS,
  SET_AUTO_CHECK_FOR_EXTENSION_UPDATES,
} from './types';
import {
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_INTEGRATION_SETTINGS,
  DEFAULT_READER_SETTINGS,
  DEFAULT_TRACKER_SETTINGS,
  getStoredGeneralSettings,
  getStoredIntegrationSettings,
  getStoredReaderSettings,
  getStoredTrackerSettings,
  saveGeneralSetting,
  saveIntegrationSetting,
  saveReaderSetting,
  saveTrackerSetting,
} from './utils';

const storedGeneralSettings = getStoredGeneralSettings();
const storedReaderSettings = getStoredReaderSettings();
const storedTrackerSettings = getStoredTrackerSettings();
const storedIntegrationSettings = getStoredIntegrationSettings();

const initialState: SettingsState = {
  chapterLanguages:
    storedGeneralSettings.ChapterLanguages === undefined
      ? DEFAULT_GENERAL_SETTINGS[GeneralSetting.ChapterLanguages]
      : storedGeneralSettings.ChapterLanguages,
  refreshOnStart:
    storedGeneralSettings.RefreshOnStart === undefined
      ? DEFAULT_GENERAL_SETTINGS[GeneralSetting.RefreshOnStart]
      : storedGeneralSettings.RefreshOnStart,
  autoCheckForUpdates:
    storedGeneralSettings.AutoCheckForUpdates === undefined
      ? DEFAULT_GENERAL_SETTINGS[GeneralSetting.AutoCheckForUpdates]
      : storedGeneralSettings.AutoCheckForUpdates,
  autoCheckForExtensionUpdates:
    storedGeneralSettings.AutoCheckForExtensionUpdates === undefined
      ? DEFAULT_GENERAL_SETTINGS[GeneralSetting.AutoCheckForExtensionUpdates]
      : storedGeneralSettings.AutoCheckForExtensionUpdates,
  libraryColumns:
    storedGeneralSettings.LibraryColumns === undefined
      ? DEFAULT_GENERAL_SETTINGS[GeneralSetting.LibraryColumns]
      : storedGeneralSettings.LibraryColumns,
  libraryFilterStatus:
    storedGeneralSettings.LibraryFilterStatus === undefined
      ? DEFAULT_GENERAL_SETTINGS[GeneralSetting.LibraryFilterStatus]
      : storedGeneralSettings.LibraryFilterStatus,
  libraryFilterProgress:
    storedGeneralSettings.LibraryFilterProgress === undefined
      ? DEFAULT_GENERAL_SETTINGS[GeneralSetting.LibraryFilterProgress]
      : storedGeneralSettings.LibraryFilterProgress,
  libraryFilterUserTags:
    storedGeneralSettings.LibraryFilterUserTags === undefined
      ? DEFAULT_GENERAL_SETTINGS[GeneralSetting.LibraryFilterUserTags]
      : storedGeneralSettings.LibraryFilterUserTags,
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
  discordPresenceEnabled:
    storedIntegrationSettings.DiscordPresenceEnabled === undefined
      ? DEFAULT_INTEGRATION_SETTINGS[IntegrationSetting.DiscordPresenceEnabled]
      : storedIntegrationSettings.DiscordPresenceEnabled,
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
    case SET_AUTO_CHECK_FOR_UPDATES:
      saveGeneralSetting(
        GeneralSetting.AutoCheckForUpdates,
        action.payload.autoCheckForUpdates
      );
      return {
        ...state,
        autoCheckForUpdates: action.payload.autoCheckForUpdates,
      };
    case SET_AUTO_CHECK_FOR_EXTENSION_UPDATES:
      saveGeneralSetting(
        GeneralSetting.AutoCheckForExtensionUpdates,
        action.payload.autoCheckForExtensionUpdates
      );
      return {
        ...state,
        autoCheckForExtensionUpdates:
          action.payload.autoCheckForExtensionUpdates,
      };
    case SET_LIBRARY_COLUMNS:
      saveGeneralSetting(
        GeneralSetting.LibraryColumns,
        action.payload.libraryColumns
      );
      return {
        ...state,
        libraryColumns: action.payload.libraryColumns,
      };
    case SET_LIBRARY_FILTER_STATUS:
      saveGeneralSetting(
        GeneralSetting.LibraryFilterStatus,
        action.payload.status
      );
      return {
        ...state,
        libraryFilterStatus: action.payload.status,
      };
    case SET_LIBRARY_FILTER_PROGRESS:
      saveGeneralSetting(
        GeneralSetting.LibraryFilterProgress,
        action.payload.progress
      );
      return {
        ...state,
        libraryFilterProgress: action.payload.progress,
      };
    case SET_LIBRARY_FILTER_USER_TAGS:
      saveGeneralSetting(
        GeneralSetting.LibraryFilterUserTags,
        action.payload.userTags
      );
      return {
        ...state,
        libraryFilterUserTags: action.payload.userTags,
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
    case SET_DISCORD_PRESENCE_ENABLED:
      saveIntegrationSetting(
        IntegrationSetting.DiscordPresenceEnabled,
        action.payload.discordPresenceEnabled
      );
      return {
        ...state,
        discordPresenceEnabled: action.payload.discordPresenceEnabled,
      };
    default:
      return state;
  }
}
