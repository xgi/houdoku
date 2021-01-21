import { ReaderSetting } from '../models/types';
import persistantStore from '../util/persistantStore';

const prefix = 'reader-';

export function getStoredReaderSettings(): { [key in ReaderSetting]?: any } {
  const settings: { [key in ReaderSetting]?: any } = {};

  settings[ReaderSetting.PageFit] = '';

  const layoutDirection: string | null = persistantStore.read(
    `${prefix}${ReaderSetting.LayoutDirection}`
  );
  const pageFit: string | null = persistantStore.read(
    `${prefix}${ReaderSetting.PageFit}`
  );
  const pageView: string | null = persistantStore.read(
    `${prefix}${ReaderSetting.PageView}`
  );
  const preloadAmount: string | null = persistantStore.read(
    `${prefix}${ReaderSetting.PreloadAmount}`
  );

  if (layoutDirection != null) {
    settings[ReaderSetting.LayoutDirection] = parseInt(layoutDirection, 10);
  }
  if (pageFit != null) {
    settings[ReaderSetting.PageFit] = parseInt(pageFit, 10);
  }
  if (pageView != null) {
    settings[ReaderSetting.PageView] = parseInt(pageView, 10);
  }
  if (preloadAmount != null) {
    settings[ReaderSetting.PreloadAmount] = parseInt(preloadAmount, 10);
  }
  return settings;
}

export function saveReaderSetting(key: ReaderSetting, value: any) {
  persistantStore.write(`${prefix}${key}`, value);
}
