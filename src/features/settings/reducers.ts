/* eslint-disable no-case-declarations */
import {
  GeneralSetting,
  IntegrationSetting,
  LayoutDirection,
  PageView,
  ReaderSetting,
  TrackerSetting,
} from '../../models/types';
import {
  SettingsState,
  SET_PRELOAD_AMOUNT,
  TOGGLE_LAYOUT_DIRECTION,
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
  SET_KEYBINDING,
  SET_CUSTOM_DOWNLOADS_DIR,
  SET_HIDE_SCROLLBAR,
  SET_FIT_CONTAIN_TO_WIDTH,
  SET_FIT_CONTAIN_TO_HEIGHT,
  SET_FIT_STRETCH,
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
  customDownloadsDir:
    storedGeneralSettings.CustomDownloadsDir === undefined
      ? DEFAULT_GENERAL_SETTINGS[GeneralSetting.CustomDownloadsDir]
      : storedGeneralSettings.CustomDownloadsDir,
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
  fitContainToWidth:
    storedReaderSettings.FitContainToWidth === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.FitContainToWidth]
      : storedReaderSettings.FitContainToWidth,
  fitContainToHeight:
    storedReaderSettings.FitContainToHeight === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.FitContainToHeight]
      : storedReaderSettings.FitContainToHeight,
  fitStretch:
    storedReaderSettings.FitStretch === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.FitStretch]
      : storedReaderSettings.FitStretch,
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
  hideScrollbar:
    storedReaderSettings.HideScrollbar === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.HideScrollbar]
      : storedReaderSettings.HideScrollbar,
  keyPreviousPage:
    storedReaderSettings.KeyPreviousPage === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.KeyPreviousPage]
      : storedReaderSettings.KeyPreviousPage,
  keyFirstPage:
    storedReaderSettings.KeyFirstPage === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.KeyFirstPage]
      : storedReaderSettings.KeyFirstPage,
  keyNextPage:
    storedReaderSettings.KeyNextPage === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.KeyNextPage]
      : storedReaderSettings.KeyNextPage,
  keyLastPage:
    storedReaderSettings.KeyLastPage === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.KeyLastPage]
      : storedReaderSettings.KeyLastPage,
  keyScrollUp:
    storedReaderSettings.KeyScrollUp === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.KeyScrollUp]
      : storedReaderSettings.KeyScrollUp,
  keyScrollDown:
    storedReaderSettings.KeyScrollDown === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.KeyScrollDown]
      : storedReaderSettings.KeyScrollDown,
  keyPreviousChapter:
    storedReaderSettings.KeyPreviousChapter === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.KeyPreviousChapter]
      : storedReaderSettings.KeyPreviousChapter,
  keyNextChapter:
    storedReaderSettings.KeyNextChapter === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.KeyNextChapter]
      : storedReaderSettings.KeyNextChapter,
  keyToggleLayoutDirection:
    storedReaderSettings.KeyToggleLayoutDirection === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.KeyToggleLayoutDirection]
      : storedReaderSettings.KeyToggleLayoutDirection,
  keyTogglePageView:
    storedReaderSettings.KeyTogglePageView === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.KeyTogglePageView]
      : storedReaderSettings.KeyTogglePageView,
  keyToggleShowingSettingsModal:
    storedReaderSettings.KeyToggleShowingSettingsModal === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.KeyToggleShowingSettingsModal]
      : storedReaderSettings.KeyToggleShowingSettingsModal,
  keyToggleShowingSidebar:
    storedReaderSettings.KeyToggleShowingSidebar === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.KeyToggleShowingSidebar]
      : storedReaderSettings.KeyToggleShowingSidebar,
  keyExit:
    storedReaderSettings.KeyExit === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.KeyExit]
      : storedReaderSettings.KeyExit,
  keyCloseOrBack:
    storedReaderSettings.KeyCloseOrBack === undefined
      ? DEFAULT_READER_SETTINGS[ReaderSetting.KeyCloseOrBack]
      : storedReaderSettings.KeyCloseOrBack,
  trackerAutoUpdate:
    storedTrackerSettings.TrackerAutoUpdate === undefined
      ? DEFAULT_TRACKER_SETTINGS[TrackerSetting.TrackerAutoUpdate]
      : storedTrackerSettings.TrackerAutoUpdate,
  discordPresenceEnabled:
    storedIntegrationSettings.DiscordPresenceEnabled === undefined
      ? DEFAULT_INTEGRATION_SETTINGS[IntegrationSetting.DiscordPresenceEnabled]
      : storedIntegrationSettings.DiscordPresenceEnabled,
};

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
    case SET_CUSTOM_DOWNLOADS_DIR:
      saveGeneralSetting(
        GeneralSetting.CustomDownloadsDir,
        action.payload.customDownloadsDir
      );
      return {
        ...state,
        customDownloadsDir: action.payload.customDownloadsDir,
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
    case SET_FIT_CONTAIN_TO_WIDTH:
      saveReaderSetting(
        ReaderSetting.FitContainToWidth,
        action.payload.fitContainToWidth
      );
      return { ...state, fitContainToWidth: action.payload.fitContainToWidth };
    case SET_FIT_CONTAIN_TO_HEIGHT:
      saveReaderSetting(
        ReaderSetting.FitContainToHeight,
        action.payload.fitContainToHeight
      );
      return {
        ...state,
        fitContainToHeight: action.payload.fitContainToHeight,
      };
    case SET_FIT_STRETCH:
      saveReaderSetting(ReaderSetting.FitStretch, action.payload.fitStretch);
      return { ...state, fitStretch: action.payload.fitStretch };
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
    case SET_HIDE_SCROLLBAR:
      saveReaderSetting(
        ReaderSetting.HideScrollbar,
        action.payload.hideScrollbar
      );
      return { ...state, hideScrollbar: action.payload.hideScrollbar };
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
    case SET_KEYBINDING:
      saveReaderSetting(action.payload.keySetting, action.payload.value);
      switch (action.payload.keySetting) {
        case ReaderSetting.KeyPreviousPage:
          return { ...state, keyPreviousPage: action.payload.value };
        case ReaderSetting.KeyFirstPage:
          return { ...state, keyFirstPage: action.payload.value };
        case ReaderSetting.KeyNextPage:
          return { ...state, keyNextPage: action.payload.value };
        case ReaderSetting.KeyLastPage:
          return { ...state, keyLastPage: action.payload.value };
        case ReaderSetting.KeyScrollUp:
          return { ...state, keyScrollUp: action.payload.value };
        case ReaderSetting.KeyScrollDown:
          return { ...state, keyScrollDown: action.payload.value };
        case ReaderSetting.KeyPreviousChapter:
          return { ...state, keyPreviousChapter: action.payload.value };
        case ReaderSetting.KeyNextChapter:
          return { ...state, keyNextChapter: action.payload.value };
        case ReaderSetting.KeyToggleLayoutDirection:
          return { ...state, keyToggleLayoutDirection: action.payload.value };
        case ReaderSetting.KeyTogglePageView:
          return { ...state, keyTogglePageView: action.payload.value };
        case ReaderSetting.KeyToggleShowingSettingsModal:
          return {
            ...state,
            keyToggleShowingSettingsModal: action.payload.value,
          };
        case ReaderSetting.KeyToggleShowingSidebar:
          return { ...state, keyToggleShowingSidebar: action.payload.value };
        case ReaderSetting.KeyExit:
          return { ...state, keyExit: action.payload.value };
        case ReaderSetting.KeyCloseOrBack:
          return { ...state, keyCloseOrBack: action.payload.value };
        default:
          return state;
      }
    default:
      return state;
  }
}
