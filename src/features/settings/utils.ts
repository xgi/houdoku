import log from 'electron-log';
import { LanguageKey } from 'houdoku-extension-lib';
import {
  GeneralSetting,
  IntegrationSetting,
  LayoutDirection,
  PageFit,
  PageView,
  ReaderSetting,
  TrackerSetting,
} from '../../models/types';
import persistantStore from '../../util/persistantStore';
import storeKeys from '../../constants/storeKeys.json';

export const DEFAULT_GENERAL_SETTINGS = {
  [GeneralSetting.ChapterLanguages]: [LanguageKey.ENGLISH],
  [GeneralSetting.RefreshOnStart]: true,
  [GeneralSetting.AutoCheckForUpdates]: true,
  [GeneralSetting.LibraryColumns]: 6,
};

export const DEFAULT_READER_SETTINGS = {
  [ReaderSetting.LayoutDirection]: LayoutDirection.LeftToRight,
  [ReaderSetting.PageView]: PageView.Single,
  [ReaderSetting.PageFit]: PageFit.Auto,
  [ReaderSetting.PreloadAmount]: 2,
  [ReaderSetting.OverlayPageNumber]: false,
};

export const DEFAULT_TRACKER_SETTINGS = {
  [TrackerSetting.TrackerAutoUpdate]: true,
};

export const DEFAULT_INTEGRATION_SETTINGS = {
  [IntegrationSetting.DiscordPresenceEnabled]: false,
};

export function getStoredGeneralSettings(): { [key in GeneralSetting]?: any } {
  const settings: { [key in GeneralSetting]?: any } = {};

  const chapterListLanguages: string | null = persistantStore.read(
    `${storeKeys.SETTINGS.GENERAL_PREFIX}${GeneralSetting.ChapterLanguages}`
  );
  const refreshOnStart: string | null = persistantStore.read(
    `${storeKeys.SETTINGS.GENERAL_PREFIX}${GeneralSetting.RefreshOnStart}`
  );
  const autoCheckForUpdates: string | null = persistantStore.read(
    `${storeKeys.SETTINGS.GENERAL_PREFIX}${GeneralSetting.AutoCheckForUpdates}`
  );
  const libraryColumns: string | null = persistantStore.read(
    `${storeKeys.SETTINGS.GENERAL_PREFIX}${GeneralSetting.LibraryColumns}`
  );

  if (chapterListLanguages !== null) {
    settings[GeneralSetting.ChapterLanguages] = chapterListLanguages.split(
      ','
    ) as LanguageKey[];
  }
  if (refreshOnStart !== null) {
    settings[GeneralSetting.RefreshOnStart] = refreshOnStart === 'true';
  }
  if (autoCheckForUpdates !== null) {
    settings[GeneralSetting.AutoCheckForUpdates] =
      autoCheckForUpdates === 'true';
  }
  if (libraryColumns !== null) {
    settings[GeneralSetting.LibraryColumns] = parseInt(libraryColumns, 10);
  }

  log.debug(`Using general settings: ${settings}`);
  return settings;
}

export function getStoredReaderSettings(): { [key in ReaderSetting]?: any } {
  const settings: { [key in ReaderSetting]?: any } = {};

  const layoutDirection: string | null = persistantStore.read(
    `${storeKeys.SETTINGS.READER_PREFIX}${ReaderSetting.LayoutDirection}`
  );
  const pageFit: string | null = persistantStore.read(
    `${storeKeys.SETTINGS.READER_PREFIX}${ReaderSetting.PageFit}`
  );
  const pageView: string | null = persistantStore.read(
    `${storeKeys.SETTINGS.READER_PREFIX}${ReaderSetting.PageView}`
  );
  const preloadAmount: string | null = persistantStore.read(
    `${storeKeys.SETTINGS.READER_PREFIX}${ReaderSetting.PreloadAmount}`
  );
  const overlayPageNumber: string | null = persistantStore.read(
    `${storeKeys.SETTINGS.READER_PREFIX}${ReaderSetting.OverlayPageNumber}`
  );

  if (layoutDirection !== null) {
    settings[ReaderSetting.LayoutDirection] = parseInt(layoutDirection, 10);
  }
  if (pageFit !== null) {
    settings[ReaderSetting.PageFit] = parseInt(pageFit, 10);
  }
  if (pageView !== null) {
    settings[ReaderSetting.PageView] = parseInt(pageView, 10);
  }
  if (preloadAmount !== null) {
    settings[ReaderSetting.PreloadAmount] = parseInt(preloadAmount, 10);
  }
  if (overlayPageNumber !== null) {
    settings[ReaderSetting.OverlayPageNumber] = overlayPageNumber === 'true';
  }

  log.debug(`Using reader settings: ${settings}`);
  return settings;
}

export function getStoredTrackerSettings(): { [key in TrackerSetting]?: any } {
  const settings: { [key in TrackerSetting]?: any } = {};

  const trackerAutoUpdate: string | null = persistantStore.read(
    `${storeKeys.SETTINGS.TRACKER_PREFIX}${TrackerSetting.TrackerAutoUpdate}`
  );

  if (trackerAutoUpdate !== null) {
    settings[TrackerSetting.TrackerAutoUpdate] = trackerAutoUpdate === 'true';
  }

  log.debug(`Using tracker settings: ${settings}`);
  return settings;
}

export function getStoredIntegrationSettings(): {
  [key in IntegrationSetting]?: any;
} {
  const settings: { [key in IntegrationSetting]?: any } = {};

  const discordPresenceEnabled: string | null = persistantStore.read(
    `${storeKeys.SETTINGS.INTEGRATION_PREFIX}${IntegrationSetting.DiscordPresenceEnabled}`
  );

  if (discordPresenceEnabled !== null) {
    settings[IntegrationSetting.DiscordPresenceEnabled] =
      discordPresenceEnabled === 'true';
  }

  log.debug(`Using integration settings: ${settings}`);
  return settings;
}

export function saveGeneralSetting(key: GeneralSetting, value: any) {
  persistantStore.write(`${storeKeys.SETTINGS.GENERAL_PREFIX}${key}`, value);
  log.info(`Set GeneralSetting ${key} to ${value}`);
}

export function saveReaderSetting(key: ReaderSetting, value: any) {
  persistantStore.write(`${storeKeys.SETTINGS.READER_PREFIX}${key}`, value);
  log.info(`Set ReaderSetting ${key} to ${value}`);
}

export function saveTrackerSetting(key: TrackerSetting, value: any) {
  persistantStore.write(`${storeKeys.SETTINGS.TRACKER_PREFIX}${key}`, value);
  log.info(`Set TrackerSetting ${key} to ${value}`);
}

export function saveIntegrationSetting(key: IntegrationSetting, value: any) {
  persistantStore.write(
    `${storeKeys.SETTINGS.INTEGRATION_PREFIX}${key}`,
    value
  );
  log.info(`Set IntegrationSetting ${key} to ${value}`);
}
