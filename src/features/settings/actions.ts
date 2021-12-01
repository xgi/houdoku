import { LanguageKey, SeriesStatus } from 'houdoku-extension-lib';
import {
  LayoutDirection,
  PageView,
  ProgressFilter,
  ReaderSetting,
} from '../../models/types';
import {
  SettingsAction,
  TOGGLE_PAGE_VIEW,
  TOGGLE_LAYOUT_DIRECTION,
  SET_PRELOAD_AMOUNT,
  SET_PAGE_VIEW,
  SET_LAYOUT_DIRECTION,
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
  SET_LIBRARY_FILTER_USER_TAGS,
  SET_KEYBINDING,
  SET_CUSTOM_DOWNLOADS_DIR,
  SET_FIT_CONTAIN_TO_WIDTH,
  SET_FIT_CONTAIN_TO_HEIGHT,
  SET_FIT_STRETCH,
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

export function setLibraryFilterUserTags(userTags: string[]): SettingsAction {
  return {
    type: SET_LIBRARY_FILTER_USER_TAGS,
    payload: {
      userTags,
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

export function setPageView(pageView: PageView): SettingsAction {
  return {
    type: SET_PAGE_VIEW,
    payload: {
      pageView,
    },
  };
}

export function togglePageView(): SettingsAction {
  return {
    type: TOGGLE_PAGE_VIEW,
  };
}

export function setLayoutDirection(
  layoutDirection: LayoutDirection
): SettingsAction {
  return {
    type: SET_LAYOUT_DIRECTION,
    payload: {
      layoutDirection,
    },
  };
}

export function toggleLayoutDirection(): SettingsAction {
  return {
    type: TOGGLE_LAYOUT_DIRECTION,
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
