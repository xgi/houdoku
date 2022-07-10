/* eslint-disable no-case-declarations */
import {
  DefaultSettings,
  GeneralSetting,
  IntegrationSetting,
  PageStyle,
  ReaderSetting,
  ReadingDirection,
  TrackerSetting,
} from '../../models/types';
import {
  SettingsState,
  SET_PRELOAD_AMOUNT,
  SET_CHAPTER_LANGUAGES,
  SET_REFRESH_ON_START,
  SET_OVERLAY_PAGE_NUMBER,
  SET_TRACKER_AUTO_UPDATE,
  SET_DISCORD_PRESENCE_ENABLED,
  SET_AUTO_CHECK_FOR_UPDATES,
  SET_LIBRARY_COLUMNS,
  SET_LIBRARY_FILTER_STATUS,
  SET_LIBRARY_FILTER_PROGRESS,
  SET_AUTO_CHECK_FOR_EXTENSION_UPDATES,
  SET_KEYBINDING,
  SET_CUSTOM_DOWNLOADS_DIR,
  SET_HIDE_SCROLLBAR,
  SET_FIT_CONTAIN_TO_WIDTH,
  SET_FIT_CONTAIN_TO_HEIGHT,
  SET_FIT_STRETCH,
  SET_PAGE_STYLE,
  TOGGLE_PAGE_STYLE,
  TOGGLE_READING_DIRECTION,
  SET_READING_DIRECTION,
  SET_LIBRARY_TYPES,
  SET_LIBRARY_SORT,
} from './types';
import {
  getAllStoredSettings,
  saveGeneralSetting,
  saveIntegrationSetting,
  saveReaderSetting,
  saveTrackerSetting,
} from './utils';

const storedSettings = getAllStoredSettings();

const fromSetting = (
  key: GeneralSetting | ReaderSetting | TrackerSetting | IntegrationSetting
) => {
  return storedSettings[key] === undefined
    ? DefaultSettings[key]
    : storedSettings[key];
};

const initialState: SettingsState = {
  chapterLanguages: fromSetting(GeneralSetting.ChapterLanguages),
  refreshOnStart: fromSetting(GeneralSetting.RefreshOnStart),
  autoCheckForUpdates: fromSetting(GeneralSetting.AutoCheckForUpdates),
  autoCheckForExtensionUpdates: fromSetting(
    GeneralSetting.AutoCheckForExtensionUpdates
  ),
  customDownloadsDir: fromSetting(GeneralSetting.CustomDownloadsDir),
  libraryColumns: fromSetting(GeneralSetting.LibraryColumns),
  libraryViews: fromSetting(GeneralSetting.LibraryViews),
  libraryFilterStatus: fromSetting(GeneralSetting.LibraryFilterStatus),
  librarySort: fromSetting(GeneralSetting.LibrarySort),
  libraryFilterProgress: fromSetting(GeneralSetting.LibraryFilterProgress),
  fitContainToWidth: fromSetting(ReaderSetting.FitContainToWidth),
  fitContainToHeight: fromSetting(ReaderSetting.FitContainToHeight),
  fitStretch: fromSetting(ReaderSetting.FitStretch),
  pageStyle: fromSetting(ReaderSetting.PageStyle),
  readingDirection: fromSetting(ReaderSetting.ReadingDirection),
  preloadAmount: fromSetting(ReaderSetting.PreloadAmount),
  overlayPageNumber: fromSetting(ReaderSetting.OverlayPageNumber),
  hideScrollbar: fromSetting(ReaderSetting.HideScrollbar),
  keyPreviousPage: fromSetting(ReaderSetting.KeyPreviousPage),
  keyFirstPage: fromSetting(ReaderSetting.KeyFirstPage),
  keyNextPage: fromSetting(ReaderSetting.KeyNextPage),
  keyLastPage: fromSetting(ReaderSetting.KeyLastPage),
  keyPreviousChapter: fromSetting(ReaderSetting.KeyPreviousChapter),
  keyNextChapter: fromSetting(ReaderSetting.KeyNextChapter),
  keyToggleReadingDirection: fromSetting(
    ReaderSetting.KeyToggleReadingDirection
  ),
  keyTogglePageStyle: fromSetting(ReaderSetting.KeyTogglePageStyle),
  keyToggleShowingSettingsModal: fromSetting(
    ReaderSetting.KeyToggleShowingSettingsModal
  ),
  keyToggleShowingSidebar: fromSetting(ReaderSetting.KeyToggleShowingSidebar),
  keyToggleShowingHeader: fromSetting(ReaderSetting.KeyToggleShowingHeader),
  keyExit: fromSetting(ReaderSetting.KeyExit),
  keyCloseOrBack: fromSetting(ReaderSetting.KeyCloseOrBack),
  trackerAutoUpdate: fromSetting(TrackerSetting.TrackerAutoUpdate),
  discordPresenceEnabled: fromSetting(
    IntegrationSetting.DiscordPresenceEnabled
  ),
};

function nextReadingDirection(
  readingDirection: ReadingDirection
): ReadingDirection {
  return readingDirection === ReadingDirection.LeftToRight
    ? ReadingDirection.RightToLeft
    : ReadingDirection.LeftToRight;
}

function nextPageStyle(pageStyle: PageStyle): PageStyle {
  return {
    [PageStyle.Single]: PageStyle.Double,
    [PageStyle.Double]: PageStyle.LongStrip,
    [PageStyle.LongStrip]: PageStyle.Single,
  }[pageStyle];
}

export default function settings(
  // eslint-disable-next-line @typescript-eslint/default-param-last
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
    case SET_LIBRARY_TYPES:
      saveGeneralSetting(
        GeneralSetting.LibraryViews,
        action.payload.libraryViews
      );
      return {
        ...state,
        libraryViews: action.payload.libraryViews,
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
    case SET_LIBRARY_SORT:
      saveGeneralSetting(
        GeneralSetting.LibrarySort,
        action.payload.librarySort
      );
      return {
        ...state,
        librarySort: action.payload.librarySort,
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
    case SET_PAGE_STYLE:
      saveReaderSetting(ReaderSetting.PageStyle, action.payload.pageStyle);
      return { ...state, pageStyle: action.payload.pageStyle };
    case TOGGLE_PAGE_STYLE:
      const newPageStyle: PageStyle = nextPageStyle(state.pageStyle);
      saveReaderSetting(ReaderSetting.PageStyle, newPageStyle);
      return { ...state, pageStyle: newPageStyle };
    case SET_READING_DIRECTION:
      saveReaderSetting(
        ReaderSetting.ReadingDirection,
        action.payload.readingDirection
      );
      return { ...state, readingDirection: action.payload.readingDirection };
    case TOGGLE_READING_DIRECTION:
      const newReadingDirection: ReadingDirection = nextReadingDirection(
        state.readingDirection
      );
      saveReaderSetting(ReaderSetting.ReadingDirection, newReadingDirection);
      return {
        ...state,
        readingDirection: newReadingDirection,
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
        case ReaderSetting.KeyPreviousChapter:
          return { ...state, keyPreviousChapter: action.payload.value };
        case ReaderSetting.KeyNextChapter:
          return { ...state, keyNextChapter: action.payload.value };
        case ReaderSetting.KeyToggleReadingDirection:
          return { ...state, keyToggleReadingDirection: action.payload.value };
        case ReaderSetting.KeyTogglePageStyle:
          return { ...state, keyTogglePageStyle: action.payload.value };
        case ReaderSetting.KeyToggleShowingSettingsModal:
          return {
            ...state,
            keyToggleShowingSettingsModal: action.payload.value,
          };
        case ReaderSetting.KeyToggleShowingSidebar:
          return { ...state, keyToggleShowingSidebar: action.payload.value };
        case ReaderSetting.KeyToggleShowingHeader:
          return { ...state, keyToggleShowingHeader: action.payload.value };
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
