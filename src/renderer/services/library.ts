import { Chapter, Series } from '@tiyo/common';
import { v4 as uuidv4 } from 'uuid';
import persistantStore from '../util/persistantStore';
import storeKeys from '@/common/constants/storeKeys.json';
import { Category } from '@/common/models/types';

const fetchSeriesList = (): Series[] => {
  const val = persistantStore.read(`${storeKeys.LIBRARY.SERIES_LIST}`);
  return val === null ? [] : JSON.parse(val);
};

const fetchSeries = (seriesId: string): Series | null => {
  const series: Series | undefined = fetchSeriesList().find((s) => s.id === seriesId);
  return series || null;
};

const fetchChapters = (seriesId: string): Chapter[] => {
  const val = persistantStore.read(`${storeKeys.LIBRARY.CHAPTER_LIST_PREFIX}${seriesId}`);
  return val === null ? [] : JSON.parse(val);
};

const fetchChapter = (seriesId: string, chapterId: string): Chapter | null => {
  const chapter: Chapter | undefined = fetchChapters(seriesId).find((c) => c.id === chapterId);
  return chapter || null;
};

const upsertSeries = (series: Series): Series => {
  const seriesId = series.id ? series.id : uuidv4();
  const newSeries: Series = { ...series, id: seriesId };

  const existingList = fetchSeriesList().filter((s: Series) => s.id !== newSeries.id);

  persistantStore.write(
    `${storeKeys.LIBRARY.SERIES_LIST}`,
    JSON.stringify([...existingList, newSeries]),
  );
  return newSeries;
};

const upsertChapters = (chapters: Chapter[], series: Series): void => {
  if (series.id === undefined) return;

  // retrieve existing chapters as a map of id:Chapter
  const chapterMap: { [key: string]: Chapter } = fetchChapters(series.id).reduce(
    (map: { [key: string]: Chapter }, c) => {
      if (c.id === undefined) return map;
      map[c.id] = c;
      return map;
    },
    {},
  );

  // add/replace chapters in this map from param
  chapters.forEach((chapter) => {
    const chapterId: string = chapter.id ? chapter.id : uuidv4();
    chapterMap[chapterId] = { ...chapter, id: chapterId };
  });

  persistantStore.write(
    `${storeKeys.LIBRARY.CHAPTER_LIST_PREFIX}${series.id}`,
    JSON.stringify(Object.values(chapterMap)),
  );
};

const removeSeries = (seriesId: string, preserveChapters = false): void => {
  persistantStore.write(
    `${storeKeys.LIBRARY.SERIES_LIST}`,
    JSON.stringify(fetchSeriesList().filter((s: Series) => s.id !== seriesId)),
  );

  if (!preserveChapters) {
    persistantStore.remove(`${storeKeys.LIBRARY.CHAPTER_LIST_PREFIX}${seriesId}`);
  }
};

const removeChapters = (chapterIds: string[], seriesId: string): void => {
  const chapters = fetchChapters(seriesId);
  const filteredChapters: Chapter[] = chapters.filter(
    (chapter: Chapter) => chapter.id !== undefined && !chapterIds.includes(chapter.id),
  );

  persistantStore.write(
    `${storeKeys.LIBRARY.CHAPTER_LIST_PREFIX}${seriesId}`,
    JSON.stringify(Object.values(filteredChapters)),
  );
};

const fetchCategoryList = (): Category[] => {
  const val = persistantStore.read(`${storeKeys.LIBRARY.CATEGORY_LIST}`);
  return val === null ? [] : JSON.parse(val);
};

const upsertCategory = (category: Category) => {
  const existingList = fetchCategoryList().filter((cat: Category) => cat.id !== category.id);
  persistantStore.write(
    `${storeKeys.LIBRARY.CATEGORY_LIST}`,
    JSON.stringify([...existingList, category]),
  );
};

const removeCategory = (categoryId: string): void => {
  persistantStore.write(
    `${storeKeys.LIBRARY.CATEGORY_LIST}`,
    JSON.stringify(fetchCategoryList().filter((cat: Category) => cat.id !== categoryId)),
  );
};

export default {
  fetchSeriesList,
  fetchSeries,
  fetchChapters,
  fetchChapter,
  upsertSeries,
  upsertChapters,
  removeSeries,
  removeChapters,
  fetchCategoryList,
  upsertCategory,
  removeCategory,
};
