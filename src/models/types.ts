import { LanguageKey, SettingType } from 'houdoku-extension-lib';

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

export const SettingTypes = {
  [GeneralSetting.ChapterLanguages]: SettingType.STRING_ARRAY,
  [GeneralSetting.RefreshOnStart]: SettingType.BOOLEAN,
  [GeneralSetting.AutoCheckForUpdates]: SettingType.BOOLEAN,
  [GeneralSetting.AutoCheckForExtensionUpdates]: SettingType.BOOLEAN,
  [GeneralSetting.CustomDownloadsDir]: SettingType.STRING,
  [GeneralSetting.LibraryColumns]: SettingType.NUMBER,
  [GeneralSetting.LibraryViews]: SettingType.STRING,
  [GeneralSetting.LibrarySort]: SettingType.STRING,
  [GeneralSetting.LibraryFilterStatus]: SettingType.STRING,
  [GeneralSetting.LibraryFilterProgress]: SettingType.STRING,

  [ReaderSetting.FitContainToWidth]: SettingType.BOOLEAN,
  [ReaderSetting.FitContainToHeight]: SettingType.BOOLEAN,
  [ReaderSetting.FitStretch]: SettingType.BOOLEAN,
  [ReaderSetting.ReadingDirection]: SettingType.STRING,
  [ReaderSetting.PageStyle]: SettingType.STRING,
  [ReaderSetting.PreloadAmount]: SettingType.NUMBER,
  [ReaderSetting.OverlayPageNumber]: SettingType.BOOLEAN,
  [ReaderSetting.HideScrollbar]: SettingType.BOOLEAN,
  [ReaderSetting.KeyPreviousPage]: SettingType.STRING,
  [ReaderSetting.KeyFirstPage]: SettingType.STRING,
  [ReaderSetting.KeyNextPage]: SettingType.STRING,
  [ReaderSetting.KeyLastPage]: SettingType.STRING,
  [ReaderSetting.KeyPreviousChapter]: SettingType.STRING,
  [ReaderSetting.KeyNextChapter]: SettingType.STRING,
  [ReaderSetting.KeyToggleReadingDirection]: SettingType.STRING,
  [ReaderSetting.KeyTogglePageStyle]: SettingType.STRING,
  [ReaderSetting.KeyToggleShowingSettingsModal]: SettingType.STRING,
  [ReaderSetting.KeyToggleShowingSidebar]: SettingType.STRING,
  [ReaderSetting.KeyToggleShowingHeader]: SettingType.STRING,
  [ReaderSetting.KeyExit]: SettingType.STRING,
  [ReaderSetting.KeyCloseOrBack]: SettingType.STRING,

  [TrackerSetting.TrackerAutoUpdate]: SettingType.BOOLEAN,

  [IntegrationSetting.DiscordPresenceEnabled]: SettingType.BOOLEAN,
};

export const DefaultSettings = {
  [GeneralSetting.ChapterLanguages]: [],
  [GeneralSetting.RefreshOnStart]: true,
  [GeneralSetting.AutoCheckForUpdates]: true,
  [GeneralSetting.AutoCheckForExtensionUpdates]: true,
  [GeneralSetting.CustomDownloadsDir]: '',
  [GeneralSetting.LibraryColumns]: 4,
  [GeneralSetting.LibraryViews]: LibraryView.Grid,
  [GeneralSetting.LibrarySort]: LibrarySort.TitleAsc,
  [GeneralSetting.LibraryFilterStatus]: null,
  [GeneralSetting.LibraryFilterProgress]: ProgressFilter.All,

  [ReaderSetting.ReadingDirection]: ReadingDirection.LeftToRight,
  [ReaderSetting.PageStyle]: PageStyle.Single,
  [ReaderSetting.FitContainToWidth]: true,
  [ReaderSetting.FitContainToHeight]: true,
  [ReaderSetting.FitStretch]: false,
  [ReaderSetting.PreloadAmount]: 2,
  [ReaderSetting.OverlayPageNumber]: false,
  [ReaderSetting.HideScrollbar]: false,
  [ReaderSetting.KeyPreviousPage]: 'left',
  [ReaderSetting.KeyFirstPage]: 'ctrl+left',
  [ReaderSetting.KeyNextPage]: 'right',
  [ReaderSetting.KeyLastPage]: 'ctrl+right',
  [ReaderSetting.KeyPreviousChapter]: '[',
  [ReaderSetting.KeyNextChapter]: ']',
  [ReaderSetting.KeyToggleReadingDirection]: 'd',
  [ReaderSetting.KeyTogglePageStyle]: 'q',
  [ReaderSetting.KeyToggleShowingSettingsModal]: 'o',
  [ReaderSetting.KeyToggleShowingSidebar]: 's',
  [ReaderSetting.KeyToggleShowingHeader]: 'm',
  [ReaderSetting.KeyExit]: 'backspace',
  [ReaderSetting.KeyCloseOrBack]: 'escape',

  [TrackerSetting.TrackerAutoUpdate]: true,

  [IntegrationSetting.DiscordPresenceEnabled]: false,
};
