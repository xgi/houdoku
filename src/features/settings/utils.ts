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

const PREFIXES = {
  general: 'general-',
  reader: 'reader-',
};

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
    `${PREFIXES.general}${GeneralSetting.ChapterLanguages}`
  );
  const refreshOnStart: string | null = persistantStore.read(
    `${PREFIXES.general}${GeneralSetting.RefreshOnStart}`
  );

  if (chapterListLanguages !== null) {
    settings[GeneralSetting.ChapterLanguages] = chapterListLanguages
      .split(',')
      .map((value: string) => parseInt(value, 10)) as LanguageKey[];
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
    `${PREFIXES.reader}${ReaderSetting.LayoutDirection}`
  );
  const pageFit: string | null = persistantStore.read(
    `${PREFIXES.reader}${ReaderSetting.PageFit}`
  );
  const pageView: string | null = persistantStore.read(
    `${PREFIXES.reader}${ReaderSetting.PageView}`
  );
  const preloadAmount: string | null = persistantStore.read(
    `${PREFIXES.reader}${ReaderSetting.PreloadAmount}`
  );
  const overlayPageNumber: string | null = persistantStore.read(
    `${PREFIXES.reader}${ReaderSetting.OverlayPageNumber}`
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
  persistantStore.write(`${PREFIXES.general}${key}`, value);
  log.info(`Set GeneralSetting ${key} to ${value}`);
}

export function saveReaderSetting(key: ReaderSetting, value: any) {
  persistantStore.write(`${PREFIXES.reader}${key}`, value);
  log.info(`Set ReaderSetting ${key} to ${value}`);
}
