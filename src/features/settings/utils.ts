import log from 'electron-log';
import { LanguageKey } from 'houdoku-extension-lib';
import {
  GeneralSetting,
  LayoutDirection,
  PageFit,
  PageView,
  ReaderSetting,
} from '../../models/types';
import persistantStore from '../../util/persistantStore';
import storeKeys from '../../constants/storeKeys.json';

export const DEFAULT_GENERAL_SETTINGS = {
  [GeneralSetting.ChapterLanguages]: [LanguageKey.ENGLISH],
  [GeneralSetting.RefreshOnStart]: true,
};

export const DEFAULT_READER_SETTINGS = {
  [ReaderSetting.LayoutDirection]: LayoutDirection.LeftToRight,
  [ReaderSetting.PageView]: PageView.Single,
  [ReaderSetting.PageFit]: PageFit.Auto,
  [ReaderSetting.PreloadAmount]: 2,
  [ReaderSetting.OverlayPageNumber]: false,
};

export function getStoredGeneralSettings(): { [key in GeneralSetting]?: any } {
  const settings: { [key in GeneralSetting]?: any } = {};

  const chapterListLanguages: string | null = persistantStore.read(
    `${storeKeys.SETTINGS.GENERAL_PREFIX}${GeneralSetting.ChapterLanguages}`
  );
  const refreshOnStart: string | null = persistantStore.read(
    `${storeKeys.SETTINGS.GENERAL_PREFIX}${GeneralSetting.RefreshOnStart}`
  );

  if (chapterListLanguages !== null) {
    settings[GeneralSetting.ChapterLanguages] = chapterListLanguages.split(
      ','
    ) as LanguageKey[];
  }
  if (refreshOnStart !== null) {
    settings[GeneralSetting.RefreshOnStart] = refreshOnStart === 'true';
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

export function saveGeneralSetting(key: GeneralSetting, value: any) {
  persistantStore.write(`${storeKeys.SETTINGS.GENERAL_PREFIX}${key}`, value);
  log.info(`Set GeneralSetting ${key} to ${value}`);
}

export function saveReaderSetting(key: ReaderSetting, value: any) {
  persistantStore.write(`${storeKeys.SETTINGS.READER_PREFIX}${key}`, value);
  log.info(`Set ReaderSetting ${key} to ${value}`);
}
