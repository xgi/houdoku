import { Chapter, Series } from 'houdoku-extension-lib';
import { v4 as uuidv4 } from 'uuid';
import persistantStore from '../util/persistantStore';
import storeKeys from '../constants/storeKeys.json';

const fetchSeriesList = (): Series[] => {
  const val = persistantStore.read(`${storeKeys.LIBRARY.SERIES_LIST}`);
  return val === null ? [] : JSON.parse(val);
};

const fetchSeries = (seriesId: string): Series | null => {
  const val = persistantStore.read(
    `${storeKeys.LIBRARY.SERIES_PREFIX}${seriesId}`
  );
  return val === null ? null : JSON.parse(val);
};

const fetchChapters = (seriesId: string): Chapter[] => {
  const val = persistantStore.read(
    `${storeKeys.LIBRARY.CHAPTER_LIST_PREFIX}${seriesId}`
  );
  return val === null ? [] : JSON.parse(val);
};

const fetchChapter = (seriesId: string, chapterId: string): Chapter | null => {
  const chapter: Chapter | undefined = fetchChapters(seriesId).find(
    (c) => c.id === chapterId
  );
  return chapter || null;
};

const upsertSeries = (series: Series): Series => {
  const seriesId = series.id ? series.id : uuidv4();
  const newSeries: Series = { ...series, id: seriesId };

  persistantStore.write(
    `${storeKeys.LIBRARY.SERIES_PREFIX}${seriesId}`,
    JSON.stringify(newSeries)
  );
  return newSeries;
};

const upsertChapters = (chapters: Chapter[], series: Series): void => {
  if (series.id === undefined) return;

  // retrieve existing chapters as a map of id:Chapter
  const chapterMap: { [key: string]: Chapter } = fetchChapters(
    series.id
  ).reduce((map: { [key: string]: Chapter }, c) => {
    if (c.id === undefined) return map;
    map[c.id] = c;
    return map;
  }, {});

  // add/replace chapters in this map from param
  chapters.forEach((chapter) => {
    const chapterId: string = chapter.id ? chapter.id : uuidv4();
    chapterMap[chapterId] = { ...chapter, id: chapterId };
  });

  persistantStore.write(
    `${storeKeys.LIBRARY.CHAPTER_LIST_PREFIX}${series.id}`,
    JSON.stringify(Object.values(chapterMap))
  );
};

const removeSeries = (series: Series, preserveChapters = false): void => {
  if (series.id === undefined) return;

  persistantStore.remove(`${storeKeys.LIBRARY.SERIES_PREFIX}${series.id}`);
  if (!preserveChapters) {
    persistantStore.remove(
      `${storeKeys.LIBRARY.CHAPTER_LIST_PREFIX}${series.id}`
    );
  }
};
