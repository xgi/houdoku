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

export enum TrackScoreFormat {
  POINT_100 = 'POINT_100',
  POINT_10_DECIMAL = 'POINT_10_DECIMAL',
  POINT_10 = 'POINT_10',
  POINT_5 = 'POINT_5',
  POINT_3 = 'POINT_3',
}

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
  scoreFormat?: TrackScoreFormat;
  progress?: number;
  status?: TrackStatus;
};

export enum GeneralSetting {
  ChapterLanguages = 'ChapterLanguages',
  RefreshOnStart = 'RefreshOnStart',
  AutoCheckForUpdates = 'AutoCheckForUpdates',
  AutoCheckForExtensionUpdates = 'AutoCheckForExtensionUpdates',
  CustomDownloadsDir = 'CustomDownloadsDir',
  LibraryColumns = 'LibraryColumns',
  LibraryViews = 'LibraryViews',
  LibrarySort = 'LibrarySort',
  LibraryFilterStatus = 'LibraryFilterStatus',
  LibraryFilterProgress = 'LibraryFilterProgress',
}

export enum ProgressFilter {
  All = 'All',
  Unread = 'Unread',
  Finished = 'Finished',
}

export enum LibrarySort {
  UnreadAsc = 'UnreadAsc',
  UnreadDesc = 'UnreadDesc',
  TitleAsc = 'TitleAsc',
  TitleDesc = 'TitleDesc',
}

export enum LibraryView {
  Grid = 'GRID',
  List = 'LIST',
}

export enum ReaderSetting {
  FitContainToWidth = 'FitContainToWidth',
  FitContainToHeight = 'FitContainToHeight',
  FitStretch = 'FitStretch',
  ReadingDirection = 'ReadingDirection',
  PageStyle = 'PageStyle',
  PreloadAmount = 'PreloadAmount',
  OverlayPageNumber = 'OverlayPageNumber',
  HideScrollbar = 'HideScrollbar',
  KeyPreviousPage = 'KeyPreviousPage',
  KeyFirstPage = 'KeyFirstPage',
  KeyNextPage = 'KeyNextPage',
  KeyLastPage = 'KeyLastPage',
  KeyPreviousChapter = 'KeyPreviousChapter',
  KeyNextChapter = 'KeyNextChapter',
  KeyToggleReadingDirection = 'KeyToggleReadingDirection',
  KeyTogglePageStyle = 'KeyTogglePageStyle',
  KeyToggleShowingSettingsModal = 'KeyToggleShowingSettingsModal',
  KeyToggleShowingSidebar = 'KeyToggleShowingSidebar',
  KeyToggleShowingHeader = 'KeyToggleShowingHeader',
  KeyExit = 'KeyExit',
  KeyCloseOrBack = 'KeyCloseOrBack',
}

export enum TrackerSetting {
  TrackerAutoUpdate = 'TrackerAutoUpdate',
}

export enum IntegrationSetting {
  DiscordPresenceEnabled = 'DiscordPresenceEnabled',
}

export enum ReadingDirection {
  LeftToRight = 'LeftToRight',
  RightToLeft = 'RightToLeft',
}

export enum PageStyle {
  Single = 'Single',
  Double = 'Double',
  LongStrip = 'LongStrip',
}

export enum AppLoadStep {
  DatabaseMigrate = 'DatabaseMigrate',
}
