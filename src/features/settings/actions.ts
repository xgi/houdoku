import { LanguageKey, SeriesStatus } from 'houdoku-extension-lib';
import {
  LibrarySort,
  LibraryView,
  PageStyle,
  ProgressFilter,
  ReaderSetting,
  ReadingDirection,
} from '../../models/types';
import {
  SettingsAction,
  SET_PRELOAD_AMOUNT,
  SET_CHAPTER_LANGUAGES,
  SET_REFRESH_ON_START,
  SET_OVERLAY_PAGE_NUMBER,
  SET_HIDE_SCROLLBAR,
  SET_TRACKER_AUTO_UPDATE,
  SET_DISCORD_PRESENCE_ENABLED,
  SET_AUTO_CHECK_FOR_UPDATES,
  SET_AUTO_CHECK_FOR_EXTENSION_UPDATES,
  SET_LIBRARY_COLUMNS,
  SET_LIBRARY_FILTER_STATUS,
  SET_LIBRARY_FILTER_PROGRESS,
  SET_LIBRARY_TYPES,
  SET_LIBRARY_SORT,
  SET_KEYBINDING,
  SET_CUSTOM_DOWNLOADS_DIR,
  SET_FIT_CONTAIN_TO_WIDTH,
  SET_FIT_CONTAIN_TO_HEIGHT,
  SET_FIT_STRETCH,
  SET_PAGE_STYLE,
  SET_READING_DIRECTION,
  TOGGLE_PAGE_STYLE,
  TOGGLE_READING_DIRECTION,
} from './types';

export function setChapterLanguages(
  chapterLanguages: LanguageKey[]
): SettingsAction {
  return {
    type: SET_CHAPTER_LANGUAGES,
    payload: {
      chapterLanguages,
    },
  };
}

export function setRefreshOnStart(refreshOnStart: boolean): SettingsAction {
  return {
    type: SET_REFRESH_ON_START,
    payload: {
      refreshOnStart,
    },
  };
}

export function setAutoCheckForUpdates(
  autoCheckForUpdates: boolean
): SettingsAction {
  return {
    type: SET_AUTO_CHECK_FOR_UPDATES,
    payload: {
      autoCheckForUpdates,
    },
  };
}

export function setAutoCheckForExtensionUpdates(
  autoCheckForExtensionUpdates: boolean
): SettingsAction {
  return {
    type: SET_AUTO_CHECK_FOR_EXTENSION_UPDATES,
    payload: {
      autoCheckForExtensionUpdates,
    },
  };
}

export function setCustomDownloadsDir(
  customDownloadsDir: string
): SettingsAction {
  return {
    type: SET_CUSTOM_DOWNLOADS_DIR,
    payload: {
      customDownloadsDir,
    },
  };
}

export function setLibraryColumns(libraryColumns: number): SettingsAction {
  return {
    type: SET_LIBRARY_COLUMNS,
    payload: {
      libraryColumns,
    },
  };
}

export function setLibraryViews(libraryViews: LibraryView): SettingsAction {
  return {
    type: SET_LIBRARY_TYPES,
    payload: {
      libraryViews,
    },
  };
}

export function setLibraryFilterStatus(
  status: SeriesStatus | null
): SettingsAction {
  return {
    type: SET_LIBRARY_FILTER_STATUS,
    payload: {
      status,
    },
  };
}

export function setLibraryFilterProgress(
  progress: ProgressFilter
): SettingsAction {
  return {
    type: SET_LIBRARY_FILTER_PROGRESS,
    payload: {
      progress,
    },
  };
}

export function setLibrarySort(librarySort: LibrarySort): SettingsAction {
  return {
    type: SET_LIBRARY_SORT,
    payload: {
      librarySort,
    },
  };
}

export function setFitContainToWidth(
  fitContainToWidth: boolean
): SettingsAction {
  return {
    type: SET_FIT_CONTAIN_TO_WIDTH,
    payload: {
      fitContainToWidth,
    },
  };
}

export function setFitContainToHeight(
  fitContainToHeight: boolean
): SettingsAction {
  return {
    type: SET_FIT_CONTAIN_TO_HEIGHT,
    payload: {
      fitContainToHeight,
    },
  };
}

export function setFitStretch(fitStretch: boolean): SettingsAction {
  return {
    type: SET_FIT_STRETCH,
    payload: {
      fitStretch,
    },
  };
}

export function setPageStyle(pageStyle: PageStyle): SettingsAction {
  return {
    type: SET_PAGE_STYLE,
    payload: {
      pageStyle,
    },
  };
}

export function togglePageStyle(): SettingsAction {
  return {
    type: TOGGLE_PAGE_STYLE,
  };
}

export function setReadingDirection(
  readingDirection: ReadingDirection
): SettingsAction {
  return {
    type: SET_READING_DIRECTION,
    payload: {
      readingDirection,
    },
  };
}

export function toggleReadingDirection(): SettingsAction {
  return {
    type: TOGGLE_READING_DIRECTION,
  };
}

export function setPreloadAmount(preloadAmount: number): SettingsAction {
  return {
    type: SET_PRELOAD_AMOUNT,
    payload: {
      preloadAmount,
    },
  };
}

export function setOverlayPageNumber(
  overlayPageNumber: boolean
): SettingsAction {
  return {
    type: SET_OVERLAY_PAGE_NUMBER,
    payload: {
      overlayPageNumber,
    },
  };
}

export function setHideScrollbar(hideScrollbar: boolean): SettingsAction {
  return {
    type: SET_HIDE_SCROLLBAR,
    payload: {
      hideScrollbar,
    },
  };
}

export function setTrackerAutoUpdate(
  trackerAutoUpdate: boolean
): SettingsAction {
  return {
    type: SET_TRACKER_AUTO_UPDATE,
    payload: {
      trackerAutoUpdate,
    },
  };
}

export function setDiscordPresenceEnabled(
  discordPresenceEnabled: boolean
): SettingsAction {
  return {
    type: SET_DISCORD_PRESENCE_ENABLED,
    payload: {
      discordPresenceEnabled,
    },
  };
}

export function setKeybinding(
  keySetting: ReaderSetting,
  value: string
): SettingsAction {
  return {
    type: SET_KEYBINDING,
    payload: {
      keySetting,
      value,
    },
  };
}
