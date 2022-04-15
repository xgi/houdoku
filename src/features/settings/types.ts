import { LanguageKey, SeriesStatus } from 'houdoku-extension-lib';
import {
  PageStyle,
  ProgressFilter,
  ReaderSetting,
  ReadingDirection,
} from '../../models/types';

export const SET_CHAPTER_LANGUAGES = 'SET_CHAPTER_LANGUAGES';
export const SET_FIT_CONTAIN_TO_WIDTH = 'SET_FIT_CONTAIN_TO_WIDTH';
export const SET_FIT_CONTAIN_TO_HEIGHT = 'SET_FIT_CONTAIN_TO_HEIGHT';
export const SET_FIT_STRETCH = 'SET_FIT_STRETCH';
export const SET_PAGE_STYLE = 'SET_PAGE_STYLE';
export const TOGGLE_PAGE_STYLE = 'TOGGLE_PAGE_STYLE';
export const SET_READING_DIRECTION = 'SET_READING_DIRECTION';
export const TOGGLE_READING_DIRECTION = 'TOGGLE_READING_DIRECTION';
export const SET_PRELOAD_AMOUNT = 'SET_PRELOAD_AMOUNT';
export const SET_REFRESH_ON_START = 'SET_REFRESH_ON_START';
export const SET_AUTO_CHECK_FOR_UPDATES = 'SET_AUTO_CHECK_FOR_UPDATES';
export const SET_AUTO_CHECK_FOR_EXTENSION_UPDATES =
  'SET_AUTO_CHECK_FOR_EXTENSION_UPDATES';
export const SET_CUSTOM_DOWNLOADS_DIR = 'SET_CUSTOM_DOWNLOADS_DIR';
export const SET_LIBRARY_COLUMNS = 'SET_LIBRARY_COLUMNS';
export const SET_LIBRARY_FILTER_STATUS = 'SET_LIBRARY_FILTER_STATUS';
export const SET_LIBRARY_FILTER_PROGRESS = 'SET_LIBRARY_FILTER_PROGRESS';
export const SET_LIBRARY_FILTER_USER_TAGS = 'SET_LIBRARY_FILTER_USER_TAGS';
export const SET_OVERLAY_PAGE_NUMBER = 'SET_OVERLAY_PAGE_NUMBER';
export const SET_HIDE_SCROLLBAR = 'SET_HIDE_SCROLLBAR';
export const SET_TRACKER_AUTO_UPDATE = 'SET_TRACKER_AUTO_UPDATE';
export const SET_DISCORD_PRESENCE_ENABLED = 'SET_DISCORD_PRESENCE_ENABLED';
export const SET_KEYBINDING = 'SET_KEYBINDING';

export interface SettingsState {
  chapterLanguages: LanguageKey[];
  refreshOnStart: boolean;
  autoCheckForUpdates: boolean;
  autoCheckForExtensionUpdates: boolean;
  customDownloadsDir: string;
  libraryColumns: number;
  libraryFilterStatus: SeriesStatus | null;
  libraryFilterProgress: ProgressFilter;
  libraryFilterUserTags: string[];
  fitContainToWidth: boolean;
  fitContainToHeight: boolean;
  fitStretch: boolean;
  pageStyle: PageStyle;
  readingDirection: ReadingDirection;
  preloadAmount: number;
  overlayPageNumber: boolean;
  hideScrollbar: boolean;
  trackerAutoUpdate: boolean;
  discordPresenceEnabled: boolean;
  keyPreviousPage: string;
  keyFirstPage: string;
  keyNextPage: string;
  keyLastPage: string;
  keyPreviousChapter: string;
  keyNextChapter: string;
  keyToggleReadingDirection: string;
  keyTogglePageStyle: string;
  keyToggleShowingSettingsModal: string;
  keyToggleShowingSidebar: string;
  keyToggleShowingHeader: string;
  keyExit: string;
  keyCloseOrBack: string;
}

interface SetChapterLanguagesAction {
  type: typeof SET_CHAPTER_LANGUAGES;
  payload: {
    chapterLanguages: LanguageKey[];
  };
}

interface SetFitContainToWidth {
  type: typeof SET_FIT_CONTAIN_TO_WIDTH;
  payload: {
    fitContainToWidth: boolean;
  };
}

interface SetFitContainToHeight {
  type: typeof SET_FIT_CONTAIN_TO_HEIGHT;
  payload: {
    fitContainToHeight: boolean;
  };
}

interface SetFitStretch {
  type: typeof SET_FIT_STRETCH;
  payload: {
    fitStretch: boolean;
  };
}

interface SetPageStyleAction {
  type: typeof SET_PAGE_STYLE;
  payload: {
    pageStyle: PageStyle;
  };
}

interface TogglePageStyleAction {
  type: typeof TOGGLE_PAGE_STYLE;
}

interface SetReadingDirectionAction {
  type: typeof SET_READING_DIRECTION;
  payload: {
    readingDirection: ReadingDirection;
  };
}

interface ToggleReadingDirectionAction {
  type: typeof TOGGLE_READING_DIRECTION;
}

interface SetPreloadAmountAction {
  type: typeof SET_PRELOAD_AMOUNT;
  payload: {
    preloadAmount: number;
  };
}

interface SetRefreshOnStartAction {
  type: typeof SET_REFRESH_ON_START;
  payload: {
    refreshOnStart: boolean;
  };
}

interface SetAutoCheckForUpdatesAction {
  type: typeof SET_AUTO_CHECK_FOR_UPDATES;
  payload: {
    autoCheckForUpdates: boolean;
  };
}

interface SetAutoCheckForExtensionUpdatesAction {
  type: typeof SET_AUTO_CHECK_FOR_EXTENSION_UPDATES;
  payload: {
    autoCheckForExtensionUpdates: boolean;
  };
}

interface SetCustomDownloadsDirAction {
  type: typeof SET_CUSTOM_DOWNLOADS_DIR;
  payload: {
    customDownloadsDir: string;
  };
}

interface SetLibraryColumnsAction {
  type: typeof SET_LIBRARY_COLUMNS;
  payload: {
    libraryColumns: number;
  };
}

interface SetLibraryFilterStatusAction {
  type: typeof SET_LIBRARY_FILTER_STATUS;
  payload: {
    status: SeriesStatus | null;
  };
}

interface SetLibraryFilterProgressAction {
  type: typeof SET_LIBRARY_FILTER_PROGRESS;
  payload: {
    progress: ProgressFilter;
  };
}

interface SetLibraryFilterUserTagsAction {
  type: typeof SET_LIBRARY_FILTER_USER_TAGS;
  payload: {
    userTags: string[];
  };
}

interface SetOverlayPageNumberAction {
  type: typeof SET_OVERLAY_PAGE_NUMBER;
  payload: {
    overlayPageNumber: boolean;
  };
}

interface SetHideScrollbar {
  type: typeof SET_HIDE_SCROLLBAR;
  payload: {
    hideScrollbar: boolean;
  };
}

interface SetTrackerAutoUpdateAction {
  type: typeof SET_TRACKER_AUTO_UPDATE;
  payload: {
    trackerAutoUpdate: boolean;
  };
}

interface SetDiscordPresenceEnabledAction {
  type: typeof SET_DISCORD_PRESENCE_ENABLED;
  payload: {
    discordPresenceEnabled: boolean;
  };
}

interface SetKeybindingAction {
  type: typeof SET_KEYBINDING;
  payload: {
    keySetting: ReaderSetting;
    value: string;
  };
}

export type SettingsAction =
  | SetChapterLanguagesAction
  | SetFitContainToWidth
  | SetFitContainToHeight
  | SetFitStretch
  | SetPageStyleAction
  | TogglePageStyleAction
  | SetReadingDirectionAction
  | ToggleReadingDirectionAction
  | SetPreloadAmountAction
  | SetRefreshOnStartAction
  | SetAutoCheckForUpdatesAction
  | SetAutoCheckForExtensionUpdatesAction
  | SetCustomDownloadsDirAction
  | SetLibraryColumnsAction
  | SetLibraryFilterStatusAction
  | SetLibraryFilterProgressAction
  | SetLibraryFilterUserTagsAction
  | SetOverlayPageNumberAction
  | SetHideScrollbar
  | SetTrackerAutoUpdateAction
  | SetDiscordPresenceEnabledAction
  | SetKeybindingAction;
