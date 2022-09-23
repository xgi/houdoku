import { Series, FilterValues } from 'houdoku-extension-lib';
import { atom } from 'recoil';
import { SearchParams, SearchResult } from '../models/types';
import { FS_METADATA } from '../services/extensions/filesystem';

export const searchExtensionState = atom({
  key: 'searchSearchExtensionState',
  default: FS_METADATA.id,
});

export const addModalSeriesState = atom({
  key: 'searchAddModalSeriesState',
  default: undefined as Series | undefined,
});

export const addModalEditableState = atom({
  key: 'searchAddModalEditableState',
  default: false,
});

export const showingAddModalState = atom({
  key: 'searchShowingAddModalState',
  default: false,
});

export const searchParamsState = atom<SearchParams>({
  key: 'searchSearchParamsState',
  default: {},
});

export const searchResultState = atom<SearchResult>({
  key: 'searchSearchResultState',
  default: { seriesList: [], hasMore: false },
});

export const curViewingPageState = atom({
  key: 'searchCurViewingPageState',
  default: 1,
});

export const nextSourcePageState = atom({
  key: 'searchNextSourcePageState',
  default: 1,
});

export const showingFilterDrawerState = atom({
  key: 'searchShowingFilterDrawerState',
  default: false,
});

export const filterValuesMapState = atom<{ [extensionId: string]: FilterValues }>({
  key: 'searchFilterValuesMapState',
  default: {},
});
