import { LanguageKey, SeriesStatus } from '@tiyo/common';
import { atom, AtomEffect, RecoilState } from 'recoil';
import {
  getAllStoredSettings,
  saveGeneralSetting,
  saveIntegrationSetting,
  saveReaderSetting,
  saveTrackerSetting,
} from '../features/settings/utils';
import {
  DefaultSettings,
  GeneralSetting,
  IntegrationSetting,
  LibrarySort,
  LibraryView,
  OffsetPages,
  PageStyle,
  ProgressFilter,
  ReaderSetting,
  ReadingDirection,
  TableColumnSortOrder,
  Theme,
  TrackerSetting,
} from '@/common/models/types';

const storedSettings = getAllStoredSettings();

function atm<T>(
  setting: GeneralSetting | ReaderSetting | TrackerSetting | IntegrationSetting,
): RecoilState<T> {
  const atomKey = `setting${setting}`;
  const defaultValue: T =
    storedSettings[setting] === undefined ? DefaultSettings[setting] : storedSettings[setting];
  const effects: AtomEffect<T>[] = [
    ({ onSet }) => {
      onSet((value) => {
        if (setting in GeneralSetting) {
          saveGeneralSetting(setting as GeneralSetting, value);
        } else if (setting in ReaderSetting) {
          saveReaderSetting(setting as ReaderSetting, value);
        } else if (setting in TrackerSetting) {
          saveTrackerSetting(setting as TrackerSetting, value);
        } else if (setting in IntegrationSetting) {
          saveIntegrationSetting(setting as IntegrationSetting, value);
        }
      });
    },
  ];

  return atom({
    key: atomKey,
    default: defaultValue,
    effects,
  });
}

export const chapterLanguagesState = atm<LanguageKey[]>(GeneralSetting.ChapterLanguages);
export const autoCheckForUpdatesState = atm<boolean>(GeneralSetting.AutoCheckForUpdates);
export const refreshOnStartState = atm<boolean>(GeneralSetting.RefreshOnStart);
export const autoBackupState = atm<boolean>(GeneralSetting.autoBackup);
export const autoBackupCountState = atm<number>(GeneralSetting.autoBackupCount);
export const confirmRemoveSeriesState = atm<boolean>(GeneralSetting.ConfirmRemoveSeries);
export const customDownloadsDirState = atm<string>(GeneralSetting.CustomDownloadsDir);
export const libraryColumnsState = atm<number>(GeneralSetting.LibraryColumns);
export const libraryViewState = atm<LibraryView>(GeneralSetting.LibraryView);
export const librarySortState = atm<LibrarySort>(GeneralSetting.LibrarySort);
// biome-ignore format: TODO ignore block
export const libraryFilterStatusState = atm<SeriesStatus | null>(GeneralSetting.LibraryFilterStatus);
export const libraryFilterProgressState = atm<ProgressFilter>(GeneralSetting.LibraryFilterProgress);
export const libraryFilterCategoryState = atm<string>(GeneralSetting.LibraryFilterCategory);
export const libraryCropCoversState = atm<boolean>(GeneralSetting.LibraryCropCovers);
// biome-ignore format: TODO ignore block
export const chapterListVolOrderState = atm<TableColumnSortOrder>(GeneralSetting.ChapterListVolOrder);
export const chapterListChOrderState = atm<TableColumnSortOrder>(GeneralSetting.ChapterListChOrder);
export const chapterListPageSizeState = atm<number>(GeneralSetting.ChapterListPageSize);
export const themeState = atm<Theme>(GeneralSetting.Theme);

export const fitContainToWidthState = atm<boolean>(ReaderSetting.FitContainToWidth);
export const fitContainToHeightState = atm<boolean>(ReaderSetting.FitContainToHeight);
export const fitStretchState = atm<boolean>(ReaderSetting.FitStretch);
export const pageStyleState = atm<PageStyle>(ReaderSetting.PageStyle);
export const readingDirectionState = atm<ReadingDirection>(ReaderSetting.ReadingDirection);
export const preloadAmountState = atm<number>(ReaderSetting.PreloadAmount);
export const overlayPageNumberState = atm<boolean>(ReaderSetting.OverlayPageNumber);
export const hideScrollbarState = atm<boolean>(ReaderSetting.HideScrollbar);
export const keyPageLeftState = atm<string>(ReaderSetting.KeyPageLeft);
export const keyFirstPageState = atm<string>(ReaderSetting.KeyFirstPage);
export const keyPageRightState = atm<string>(ReaderSetting.KeyPageRight);
export const keyLastPageState = atm<string>(ReaderSetting.KeyLastPage);
export const keyChapterLeftState = atm<string>(ReaderSetting.KeyChapterLeft);
export const keyChapterRightState = atm<string>(ReaderSetting.KeyChapterRight);
export const keyToggleReadingDirectionState = atm<string>(ReaderSetting.KeyToggleReadingDirection);
export const keyTogglePageStyleState = atm<string>(ReaderSetting.KeyTogglePageStyle);
// biome-ignore format: TODO ignore block
export const keyToggleShowingSettingsModalState = atm<string>(ReaderSetting.KeyToggleShowingSettingsModal);
export const keyToggleShowingSidebarState = atm<string>(ReaderSetting.KeyToggleShowingSidebar);
export const keyToggleShowingHeaderState = atm<string>(ReaderSetting.KeyToggleShowingHeader);
export const keyToggleShowingScrollbarState = atm<string>(ReaderSetting.KeyToggleShowingScrollbar);
export const keyToggleFullscreenState = atm<string>(ReaderSetting.KeyToggleFullscreen);
// biome-ignore format: TODO ignore block
export const keyToggleOffsetDoubleSpreadsState = atm<string>(ReaderSetting.KeyToggleOffsetDoubleSpreads);
export const keyExitState = atm<string>(ReaderSetting.KeyExit);
export const keyCloseOrBackState = atm<string>(ReaderSetting.KeyCloseOrBack);
export const pageGapState = atm<boolean>(ReaderSetting.PageGap);
export const maxPageWidthState = atm<number>(ReaderSetting.MaxPageWidth);
export const pageWidthMetricState = atm<string>(ReaderSetting.PageWidthMetric);
export const offsetPagesState = atm<OffsetPages>(ReaderSetting.OffsetPages);
export const optimizeContrastState = atm<boolean>(ReaderSetting.OptimizeContrast);

export const trackerAutoUpdateState = atm<boolean>(TrackerSetting.TrackerAutoUpdate);

export const discordPresenceEnabledState = atm<boolean>(IntegrationSetting.DiscordPresenceEnabled);
