import { Series } from 'houdoku-extension-lib';
import { atom } from 'recoil';
import { FS_METADATA } from '../services/extensions/filesystem';

export const searchExtensionState = atom({
  key: 'searchSearchExtensionState',
  default: FS_METADATA.id,
});

export const searchResultsState = atom({
  key: 'searchSearchResultsState',
  default: [] as Series[],
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
