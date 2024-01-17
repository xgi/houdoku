import { Chapter, Series } from '@tiyo/common';
import { atom } from 'recoil';

export const pageNumberState = atom({
  key: 'readerPageNumberState',
  default: 1,
});

export const lastPageNumberState = atom({
  key: 'readerLastPageNumberState',
  default: 0,
});

export const pageUrlsState = atom({
  key: 'readerPageUrlsState',
  default: [] as string[],
});

export const pageGroupListState = atom({
  key: 'readerPageGroupListState',
  default: [] as number[][],
});

export const seriesState = atom({
  key: 'readerSeriesState',
  default: undefined as Series | undefined,
});

export const chapterState = atom({
  key: 'readerChapterState',
  default: undefined as Chapter | undefined,
});

export const relevantChapterListState = atom({
  key: 'readerRelevantChapterListState',
  default: [] as Chapter[],
});

export const languageChapterListState = atom({
  key: 'languageChapterListState',
  default: [] as Chapter[],
});

export const showingSettingsModalState = atom({
  key: 'readerShowingSettingsModalState',
  default: false,
});

export const showingSidebarState = atom({
  key: 'readerShowingSidebarState',
  default: true,
});

export const showingHeaderState = atom({
  key: 'readerShowingHeaderState',
  default: true,
});

export const showingNoNextChapterState = atom({
  key: 'readerShowingNoNextChapterState',
  default: false,
});
