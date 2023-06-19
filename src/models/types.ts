import { LanguageKey, Series, SettingType } from 'houdoku-extension-lib';

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
  hasCustomLists: boolean;
};

export type TrackerSeries = {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
};

export type TrackerListEntry = {
  id: string;
  name: string;
  status: TrackStatus;
};

export enum TrackScoreFormat {
  POINT_100 = 'POINT_100',
  POINT_10_DECIMAL = 'POINT_10_DECIMAL',
  POINT_10_DECIMAL_ONE_DIGIT = 'POINT_10_SINGLE_DECIMAL',
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
  url?: string;
  description?: string;
  coverUrl?: string;
  score?: number;
  scoreFormat?: TrackScoreFormat;
  progress?: number;
  status?: TrackStatus;
  listId?: string;
  listName?: string;
};

export type SearchResult = {
  seriesList: Series[];
  hasMore: boolean;
};

export type ImportTask = {
  series: Series;
  getFirst: boolean;
};

export type Category = {
  id: string;
  label: string;
  refreshEnabled?: boolean;
};

export enum GeneralSetting {
  ChapterLanguages = 'ChapterLanguages',
  RefreshOnStart = 'RefreshOnStart',
  AutoCheckForUpdates = 'AutoCheckForUpdates',
  AutoCheckForExtensionUpdates = 'AutoCheckForExtensionUpdates',
  ConfirmRemoveSeries = 'ConfirmRemoveSeries',
  CustomDownloadsDir = 'CustomDownloadsDir',
  LibraryColumns = 'LibraryColumns',
  LibraryView = 'LibraryView',
  LibrarySort = 'LibrarySort',
  LibraryFilterStatus = 'LibraryFilterStatus',
  LibraryFilterProgress = 'LibraryFilterProgress',
  LibraryFilterCategory = 'LibraryFilterCategory',
  ChapterListVolOrder = 'ChapterListVolOrder',
  ChapterListChOrder = 'ChapterListChOrder',
  ChapterListPageSize = 'ChapterListPageSize',
}

export enum ProgressFilter {
  All = 'All',
  Unread = 'Unread',
  Finished = 'Finished',
}

export enum LibrarySort {
  TitleAsc = 'TitleAsc',
  TitleDesc = 'TitleDesc',
  UnreadAsc = 'UnreadAsc',
  UnreadDesc = 'UnreadDesc',
}

export enum LibraryView {
  GridCompact = 'GRID_COMPACT',
  GridCoversOnly = 'GRID_COVERS_ONLY',
  GridComfortable = 'GRID_COMFORTABLE',
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
  KeyPageLeft = 'KeyPageLeft',
  KeyFirstPage = 'KeyFirstPage',
  KeyPageRight = 'KeyPageRight',
  KeyLastPage = 'KeyLastPage',
  KeyChapterLeft = 'KeyChapterLeft',
  KeyChapterRight = 'KeyChapterRight',
  KeyToggleReadingDirection = 'KeyToggleReadingDirection',
  KeyTogglePageStyle = 'KeyTogglePageStyle',
  KeyToggleShowingSettingsModal = 'KeyToggleShowingSettingsModal',
  KeyToggleShowingSidebar = 'KeyToggleShowingSidebar',
  KeyToggleShowingHeader = 'KeyToggleShowingHeader',
  KeyToggleFullscreen = 'KeyToggleFullscreen',
  KeyExit = 'KeyExit',
  KeyCloseOrBack = 'KeyCloseOrBack',
  PageGap = 'PageGap',
  MaxPageWidth = 'MaxPageWidth',
  OffsetPages = 'OffsetPages',
  OptimizeContrast = 'OptimizeContrast',
  KeyToggleOffsetDoubleSpreads = 'KeyToggleOffsetDoubleSpreads',
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

export enum OffsetPages {
  All = 'All',
  First = 'First',
  None = 'None',
}

export enum TableColumnSortOrder {
  Ascending = 'Ascending',
  Descending = 'Descending',
  None = 'None',
}

export enum AppLoadStep {
  DatabaseMigrate = 'DatabaseMigrate',
}

export const SettingTypes = {
  [GeneralSetting.ChapterLanguages]: SettingType.STRING_ARRAY,
  [GeneralSetting.RefreshOnStart]: SettingType.BOOLEAN,
  [GeneralSetting.AutoCheckForUpdates]: SettingType.BOOLEAN,
  [GeneralSetting.AutoCheckForExtensionUpdates]: SettingType.BOOLEAN,
  [GeneralSetting.ConfirmRemoveSeries]: SettingType.BOOLEAN,
  [GeneralSetting.CustomDownloadsDir]: SettingType.STRING,
  [GeneralSetting.LibraryColumns]: SettingType.NUMBER,
  [GeneralSetting.LibraryView]: SettingType.STRING,
  [GeneralSetting.LibrarySort]: SettingType.STRING,
  [GeneralSetting.LibraryFilterStatus]: SettingType.STRING,
  [GeneralSetting.LibraryFilterProgress]: SettingType.STRING,
  [GeneralSetting.LibraryFilterCategory]: SettingType.STRING,
  [GeneralSetting.ChapterListVolOrder]: SettingType.STRING,
  [GeneralSetting.ChapterListChOrder]: SettingType.STRING,
  [GeneralSetting.ChapterListPageSize]: SettingType.NUMBER,

  [ReaderSetting.FitContainToWidth]: SettingType.BOOLEAN,
  [ReaderSetting.FitContainToHeight]: SettingType.BOOLEAN,
  [ReaderSetting.FitStretch]: SettingType.BOOLEAN,
  [ReaderSetting.ReadingDirection]: SettingType.STRING,
  [ReaderSetting.PageStyle]: SettingType.STRING,
  [ReaderSetting.PreloadAmount]: SettingType.NUMBER,
  [ReaderSetting.OverlayPageNumber]: SettingType.BOOLEAN,
  [ReaderSetting.HideScrollbar]: SettingType.BOOLEAN,
  [ReaderSetting.PageGap]: SettingType.BOOLEAN,
  [ReaderSetting.MaxPageWidth]: SettingType.NUMBER,
  [ReaderSetting.OffsetPages]: SettingType.STRING,
  [ReaderSetting.OptimizeContrast]: SettingType.BOOLEAN,
  [ReaderSetting.KeyPageLeft]: SettingType.STRING,
  [ReaderSetting.KeyFirstPage]: SettingType.STRING,
  [ReaderSetting.KeyPageRight]: SettingType.STRING,
  [ReaderSetting.KeyLastPage]: SettingType.STRING,
  [ReaderSetting.KeyChapterLeft]: SettingType.STRING,
  [ReaderSetting.KeyChapterRight]: SettingType.STRING,
  [ReaderSetting.KeyToggleReadingDirection]: SettingType.STRING,
  [ReaderSetting.KeyTogglePageStyle]: SettingType.STRING,
  [ReaderSetting.KeyToggleShowingSettingsModal]: SettingType.STRING,
  [ReaderSetting.KeyToggleShowingSidebar]: SettingType.STRING,
  [ReaderSetting.KeyToggleShowingHeader]: SettingType.STRING,
  [ReaderSetting.KeyToggleFullscreen]: SettingType.STRING,
  [ReaderSetting.KeyExit]: SettingType.STRING,
  [ReaderSetting.KeyCloseOrBack]: SettingType.STRING,
  [ReaderSetting.KeyToggleOffsetDoubleSpreads]: SettingType.STRING,

  [TrackerSetting.TrackerAutoUpdate]: SettingType.BOOLEAN,

  [IntegrationSetting.DiscordPresenceEnabled]: SettingType.BOOLEAN,
};

export const DefaultSettings = {
  [GeneralSetting.ChapterLanguages]: [],
  [GeneralSetting.RefreshOnStart]: true,
  [GeneralSetting.AutoCheckForUpdates]: true,
  [GeneralSetting.AutoCheckForExtensionUpdates]: true,
  [GeneralSetting.ConfirmRemoveSeries]: true,
  [GeneralSetting.CustomDownloadsDir]: '',
  [GeneralSetting.LibraryColumns]: 4,
  [GeneralSetting.LibraryView]: LibraryView.GridCompact,
  [GeneralSetting.LibrarySort]: LibrarySort.TitleAsc,
  [GeneralSetting.LibraryFilterStatus]: null,
  [GeneralSetting.LibraryFilterProgress]: ProgressFilter.All,
  [GeneralSetting.LibraryFilterCategory]: '',
  [GeneralSetting.ChapterListVolOrder]: TableColumnSortOrder.None,
  [GeneralSetting.ChapterListChOrder]: TableColumnSortOrder.Descending,
  [GeneralSetting.ChapterListPageSize]: 10,

  [ReaderSetting.ReadingDirection]: ReadingDirection.LeftToRight,
  [ReaderSetting.PageStyle]: PageStyle.Single,
  [ReaderSetting.FitContainToWidth]: true,
  [ReaderSetting.FitContainToHeight]: true,
  [ReaderSetting.FitStretch]: false,
  [ReaderSetting.PreloadAmount]: 2,
  [ReaderSetting.OverlayPageNumber]: false,
  [ReaderSetting.HideScrollbar]: false,
  [ReaderSetting.PageGap]: false,
  [ReaderSetting.MaxPageWidth]: 100,
  [ReaderSetting.OffsetPages]: OffsetPages.None,
  [ReaderSetting.OptimizeContrast]: false,
  [ReaderSetting.KeyPageLeft]: 'left',
  [ReaderSetting.KeyFirstPage]: 'ctrl+left',
  [ReaderSetting.KeyPageRight]: 'right',
  [ReaderSetting.KeyLastPage]: 'ctrl+right',
  [ReaderSetting.KeyChapterLeft]: '[',
  [ReaderSetting.KeyChapterRight]: ']',
  [ReaderSetting.KeyToggleReadingDirection]: 'd',
  [ReaderSetting.KeyTogglePageStyle]: 'q',
  [ReaderSetting.KeyToggleShowingSettingsModal]: 'o',
  [ReaderSetting.KeyToggleShowingSidebar]: 's',
  [ReaderSetting.KeyToggleShowingHeader]: 'm',
  [ReaderSetting.KeyToggleFullscreen]: 'f',
  [ReaderSetting.KeyExit]: 'backspace',
  [ReaderSetting.KeyCloseOrBack]: 'escape',
  [ReaderSetting.KeyToggleOffsetDoubleSpreads]: 'u',

  [TrackerSetting.TrackerAutoUpdate]: true,

  [IntegrationSetting.DiscordPresenceEnabled]: false,
};
