import {
  GeneralSetting,
  LayoutDirection,
  PageFit,
  PageView,
  ReaderSetting,
} from '../models/types';
import persistantStore from './persistantStore';

const PREFIXES = {
  general: 'general-',
  reader: 'reader-',
};

export const DEFAULT_READER_SETTINGS = {
  [ReaderSetting.LayoutDirection]: LayoutDirection.LeftToRight,
  [ReaderSetting.PageView]: PageView.Single,
  [ReaderSetting.PageFit]: PageFit.Auto,
  [ReaderSetting.PreloadAmount]: 2,
};

export function getStoredGeneralSettings(): { [key in GeneralSetting]?: any } {
  const settings: { [key in GeneralSetting]?: any } = {};

  const languages: string | null = persistantStore.read(
    `${PREFIXES.general}${GeneralSetting.Languages}`
  );

  if (languages !== null) {
    settings[GeneralSetting.Languages] = languages.split(';');
  }

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
  return settings;
}

export function saveGeneralSetting(key: GeneralSetting, value: any) {
  persistantStore.write(`${PREFIXES.general}${key}`, value);
}

export function saveReaderSetting(key: ReaderSetting, value: any) {
  persistantStore.write(`${PREFIXES.reader}${key}`, value);
}
