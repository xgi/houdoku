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
  TrackerSetting,
} from '../models/types';

const storedSettings = getAllStoredSettings();

function atomFromSetting<T>(
  setting: GeneralSetting | ReaderSetting | TrackerSetting | IntegrationSetting
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

/* eslint-disable */
export const chapterLanguagesState = atomFromSetting<LanguageKey[]>(GeneralSetting.ChapterLanguages);
export const autoCheckForUpdatesState = atomFromSetting<boolean>(GeneralSetting.AutoCheckForUpdates);
export const refreshOnStartState = atomFromSetting<boolean>(GeneralSetting.RefreshOnStart);
export const autoCheckForExtensionUpdatesState = atomFromSetting<boolean>(GeneralSetting.AutoCheckForExtensionUpdates);
export const autoBackupState = atomFromSetting<boolean>(GeneralSetting.autoBackup);
export const autoBackupCountState = atomFromSetting<number>(GeneralSetting.autoBackupCount);
export const confirmRemoveSeriesState = atomFromSetting<boolean>(GeneralSetting.ConfirmRemoveSeries);
export const customDownloadsDirState = atomFromSetting<string>(GeneralSetting.CustomDownloadsDir);
export const libraryColumnsState = atomFromSetting<number>(GeneralSetting.LibraryColumns);
export const libraryViewState = atomFromSetting<LibraryView>(GeneralSetting.LibraryView);
export const librarySortState = atomFromSetting<LibrarySort>(GeneralSetting.LibrarySort);
export const libraryFilterStatusState = atomFromSetting<SeriesStatus | null>(GeneralSetting.LibraryFilterStatus);
export const libraryFilterProgressState = atomFromSetting<ProgressFilter>(GeneralSetting.LibraryFilterProgress);
export const libraryFilterCategoryState = atomFromSetting<string>(GeneralSetting.LibraryFilterCategory);
export const libraryCropCoversState = atomFromSetting<boolean>(GeneralSetting.LibraryCropCovers);
export const chapterListVolOrderState = atomFromSetting<TableColumnSortOrder>(GeneralSetting.ChapterListVolOrder);
export const chapterListChOrderState = atomFromSetting<TableColumnSortOrder>(GeneralSetting.ChapterListChOrder);
export const chapterListPageSizeState = atomFromSetting<number>(GeneralSetting.ChapterListPageSize);

export const fitContainToWidthState = atomFromSetting<boolean>(ReaderSetting.FitContainToWidth);
export const fitContainToHeightState = atomFromSetting<boolean>(ReaderSetting.FitContainToHeight);
export const fitStretchState = atomFromSetting<boolean>(ReaderSetting.FitStretch);
export const pageStyleState = atomFromSetting<PageStyle>(ReaderSetting.PageStyle);
export const readingDirectionState = atomFromSetting<ReadingDirection>(ReaderSetting.ReadingDirection);
export const preloadAmountState = atomFromSetting<number>(ReaderSetting.PreloadAmount);
export const overlayPageNumberState = atomFromSetting<boolean>(ReaderSetting.OverlayPageNumber);
export const hideScrollbarState = atomFromSetting<boolean>(ReaderSetting.HideScrollbar);
export const keyPageLeftState = atomFromSetting<string>(ReaderSetting.KeyPageLeft);
export const keyFirstPageState = atomFromSetting<string>(ReaderSetting.KeyFirstPage);
export const keyPageRightState = atomFromSetting<string>(ReaderSetting.KeyPageRight);
export const keyLastPageState = atomFromSetting<string>(ReaderSetting.KeyLastPage);
export const keyChapterLeftState = atomFromSetting<string>(ReaderSetting.KeyChapterLeft);
export const keyChapterRightState = atomFromSetting<string>(ReaderSetting.KeyChapterRight);
export const keyToggleReadingDirectionState = atomFromSetting<string>(ReaderSetting.KeyToggleReadingDirection);
export const keyTogglePageStyleState = atomFromSetting<string>(ReaderSetting.KeyTogglePageStyle);
export const keyToggleShowingSettingsModalState = atomFromSetting<string>(ReaderSetting.KeyToggleShowingSettingsModal);
export const keyToggleShowingSidebarState = atomFromSetting<string>(ReaderSetting.KeyToggleShowingSidebar);
export const keyToggleShowingHeaderState = atomFromSetting<string>(ReaderSetting.KeyToggleShowingHeader);
export const keyToggleFullscreenState = atomFromSetting<string>(ReaderSetting.KeyToggleFullscreen);
export const keyToggleOffsetDoubleSpreadsState = atomFromSetting<string>(ReaderSetting.KeyToggleOffsetDoubleSpreads);
export const keyExitState = atomFromSetting<string>(ReaderSetting.KeyExit);
export const keyCloseOrBackState = atomFromSetting<string>(ReaderSetting.KeyCloseOrBack);
export const pageGapState = atomFromSetting<boolean>(ReaderSetting.PageGap);
export const maxPageWidthState = atomFromSetting<number>(ReaderSetting.MaxPageWidth);
export const pageWidthMetricState = atomFromSetting<string>(ReaderSetting.PageWidthMetric);
export const offsetPagesState = atomFromSetting<OffsetPages>(ReaderSetting.OffsetPages);
export const optimizeContrastState = atomFromSetting<boolean>(ReaderSetting.OptimizeContrast);

export const trackerAutoUpdateState = atomFromSetting<boolean>(TrackerSetting.TrackerAutoUpdate);

export const discordPresenceEnabledState = atomFromSetting<boolean>(IntegrationSetting.DiscordPresenceEnabled);
/* eslint-enable */
