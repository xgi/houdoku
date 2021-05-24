export type ExtensionTableRow = {
  pkgName: string;
  friendlyName: string;
  id: string;
  url: string;
  availableVersion: string;
  installedVersion: string | undefined;
  canUpdate: boolean;
};

export enum ProgressFilter {
  All,
  Unread,
  Finished,
}

export enum GeneralSetting {
  ChapterLanguages = 'ChapterLanguages',
  RefreshOnStart = 'RefreshOnStart',
}

export enum ReaderSetting {
  PageFit = 'PageFit',
  LayoutDirection = 'LayoutDirection',
  PageView = 'PageView',
  PreloadAmount = 'PreloadAmount',
}

export enum PageFit {
  Auto,
  Width,
  Height,
}

export enum LayoutDirection {
  LeftToRight,
  RightToLeft,
  Vertical,
}

export enum PageView {
  Single,
  Double,
  Double_OddStart,
}
