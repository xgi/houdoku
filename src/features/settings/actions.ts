import { LanguageKey } from 'houdoku-extension-lib';
import { LayoutDirection, PageFit, PageView } from '../../models/types';
import {
  SET_PAGE_FIT,
  TOGGLE_PAGE_FIT,
  SettingsAction,
  TOGGLE_PAGE_VIEW,
  TOGGLE_LAYOUT_DIRECTION,
  SET_PRELOAD_AMOUNT,
  SET_PAGE_VIEW,
  SET_LAYOUT_DIRECTION,
  SET_CHAPTER_LANGUAGES,
  SET_REFRESH_ON_START,
  SET_OVERLAY_PAGE_NUMBER,
  SET_TRACKER_AUTO_UPDATE,
  SET_DISCORD_PRESENCE_ENABLED,
  SET_AUTO_CHECK_FOR_UPDATES,
  SET_LIBRARY_COLUMNS,
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

export function setLibraryColumns(libraryColumns: number): SettingsAction {
  return {
    type: SET_LIBRARY_COLUMNS,
    payload: {
      libraryColumns,
    },
  };
}

export function setPageFit(pageFit: PageFit): SettingsAction {
  return {
    type: SET_PAGE_FIT,
    payload: {
      pageFit,
    },
  };
}

export function togglePageFit(): SettingsAction {
  return {
    type: TOGGLE_PAGE_FIT,
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
