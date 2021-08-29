import { LanguageKey } from 'houdoku-extension-lib';

export type ExtensionTableRow = {
  pkgName: string;
  friendlyName: string;
  id: string;
  url: string;
  languageKey: LanguageKey;
  availableVersion: string;
  installedVersion: string | undefined;
  canUpdate: boolean;
  hasSettings: boolean;
};

export type TrackerMetadata = {
  id: string;
  name: string;
  url: string;
};

export type TrackerSeries = {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
};

export enum TrackStatus {
  Reading = 'Reading',
  Planning = 'Planning',
  Completed = 'Completed',
  Dropped = 'Dropped',
  Paused = 'Paused',
}

export type TrackEntry = {
  id?: string;
  seriesId: string;
  title?: string;
  description?: string;
  coverUrl?: string;
  score?: number;
  progress?: number;
  status?: TrackStatus;
};

export enum ProgressFilter {
  All = 'All',
  Unread = 'Unread',
  Finished = 'Finished',
}

export enum GeneralSetting {
  ChapterLanguages = 'ChapterLanguages',
  RefreshOnStart = 'RefreshOnStart',
  AutoCheckForUpdates = 'AutoCheckForUpdates',
  AutoCheckForExtensionUpdates = 'AutoCheckForExtensionUpdates',
  LibraryColumns = 'LibraryColumns',
  LibraryFilterStatus = 'LibraryFilterStatus',
  LibraryFilterProgress = 'LibraryFilterProgress',
  LibraryFilterUserTags = 'LibraryFilterUserTags',
}

export enum ReaderSetting {
  PageFit = 'PageFit',
  LayoutDirection = 'LayoutDirection',
  PageView = 'PageView',
  PreloadAmount = 'PreloadAmount',
  OverlayPageNumber = 'OverlayPageNumber',
  KeyPreviousPage = 'KeyPreviousPage',
  KeyFirstPage = 'KeyFirstPage',
  KeyNextPage = 'KeyNextPage',
  KeyLastPage = 'KeyLastPage',
  KeyPreviousChapter = 'KeyPreviousChapter',
  KeyNextChapter = 'KeyNextChapter',
  KeyToggleLayoutDirection = 'KeyToggleLayoutDirection',
  KeyTogglePageView = 'KeyTogglePageView',
  KeyTogglePageFit = 'KeyTogglePageFit',
  KeyToggleShowingSettingsModal = 'KeyToggleShowingSettingsModal',
  KeyToggleShowingSidebar = 'KeyToggleShowingSidebar',
  KeyExit = 'KeyExit',
  KeyCloseOrBack = 'KeyCloseOrBack',
}

export enum TrackerSetting {
  TrackerAutoUpdate = 'TrackerAutoUpdate',
}

export enum IntegrationSetting {
  DiscordPresenceEnabled = 'DiscordPresenceEnabled',
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

export enum AppLoadStep {
  DatabaseMigrate = 'DatabaseMigrate',
}
