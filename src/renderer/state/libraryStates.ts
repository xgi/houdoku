import { Chapter, ExtensionMetadata, Series } from '@tiyo/common';
import { atom, selector } from 'recoil';
import { Category, ImportTask, TableColumnSortOrder } from '../../common/models/types';
import {
  chapterLanguagesState,
  chapterListChOrderState,
  chapterListVolOrderState,
} from './settingStates';

export const seriesListState = atom<Series[]>({
  key: 'librarySeriesList',
  default: [] as Series[],
});

export const seriesState = atom({
  key: 'seriesState',
  default: undefined as Series | undefined,
});

export const chapterListState = atom({
  key: 'chapterListState',
  default: [] as Chapter[],
});

export const currentExtensionMetadataState = atom<ExtensionMetadata | undefined>({
  key: `currentExtensionMetadataState`,
  default: undefined,
});

export const reloadingSeriesListState = atom({
  key: 'reloadingSeriesListState',
  default: false,
});

export const importingState = atom({
  key: 'libraryImportingState',
  default: false,
});

export const importQueueState = atom<ImportTask[]>({
  key: 'libraryImportQueue',
  default: [],
});

export const filterState = atom({
  key: 'filterState',
  default: '',
});

export const seriesBannerUrlState = atom({
  key: 'seriesBannerUrlState',
  default: null as string | null,
});

export const completedStartReloadState = atom({
  key: 'completedStartReloadState',
  default: false,
});

export const chapterDownloadStatusesState = atom<{ [key: string]: boolean }>({
  key: `chapterDownloadStatusesState`,
  default: {},
});

export const chapterFilterTitleState = atom({
  key: 'chapterFilterTitleState',
  default: '',
});

export const chapterFilterGroupState = atom({
  key: 'chapterFilterGroupState',
  default: '',
});

export const categoryListState = atom<Category[]>({
  key: 'libraryCategoryListState',
  default: [],
});

export const showingLibraryCtxMenuState = atom({
  key: 'libraryShowingCtxMenuState',
  default: false,
});

export const activeSeriesListState = selector({
  key: 'activeLibrarySeriesList',
  get: ({ get }) => {
    const seriesList = get(seriesListState);
    return seriesList.filter((series) => !series.preview);
  },
});

export const sortedFilteredChapterListState = selector<Chapter[]>({
  key: 'sortedFilteredChapterListState',
  get: ({ get }) => {
    const chapterList = get(chapterListState);
    const chapterLanguages = get(chapterLanguagesState);
    const chapterFilterTitle = get(chapterFilterTitleState);
    const chapterFilterGroup = get(chapterFilterGroupState);
    const chapterListVolOrder = get(chapterListVolOrderState);
    const chapterListChOrder = get(chapterListChOrderState);

    const uniqueChapters = new Map();

    if (chapterLanguages.length > 0) {
      chapterLanguages.forEach((lang) => {
        chapterList.filter(
          (chapter: Chapter) =>
            chapter.languageKey === lang &&
            !uniqueChapters.has(chapter.chapterNumber) &&
            uniqueChapters.set(chapter.chapterNumber, chapter)
        );
      });
    }

    return chapterList
      .filter(
        (chapter: Chapter) =>
          (chapterLanguages.includes(chapter.languageKey) || chapterLanguages.length === 0) &&
          chapter.title !== null &&
          chapter.title.toLowerCase().includes(chapterFilterTitle.toLowerCase()) &&
          chapter.groupName !== null &&
          chapter.groupName.toLowerCase().includes(chapterFilterGroup.toLowerCase()) &&
          ((uniqueChapters.has(chapter.chapterNumber) &&
            uniqueChapters.get(chapter.chapterNumber) === chapter) ||
            chapterLanguages.length === 0)
      )
      .sort((a, b) => {
        const volumeComp = {
          [TableColumnSortOrder.Ascending]: parseFloat(a.volumeNumber) - parseFloat(b.volumeNumber),
          [TableColumnSortOrder.Descending]:
            parseFloat(b.volumeNumber) - parseFloat(a.volumeNumber),
          [TableColumnSortOrder.None]: 0,
        }[chapterListVolOrder];
        const chapterComp = {
          [TableColumnSortOrder.Ascending]:
            parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber),
          [TableColumnSortOrder.Descending]:
            parseFloat(b.chapterNumber) - parseFloat(a.chapterNumber),
          [TableColumnSortOrder.None]: 0,
        }[chapterListChOrder];

        return volumeComp || chapterComp;
      });
  },
});
