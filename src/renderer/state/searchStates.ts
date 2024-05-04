import { Series, FilterValues } from '@tiyo/common';
import { atom } from 'recoil';
import { SearchResult } from '../../common/models/types';
import { FS_METADATA } from '../../common/temp_fs_metadata';

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

export const searchTextState = atom({
  key: 'searchSearchTextState',
  default: '',
});

export const searchResultState = atom<SearchResult>({
  key: 'searchSearchResultState',
  default: { seriesList: [], hasMore: false },
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
