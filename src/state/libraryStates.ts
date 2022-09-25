import { Chapter, Series, TriState } from 'houdoku-extension-lib';
import { atom } from 'recoil';
import { Category, ImportTask } from '../models/types';

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

export const filterCategoryState = atom({
  key: 'libraryFilterCategoryState',
  default: '',
});
