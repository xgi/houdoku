// eslint-disable-next-line import/no-cycle
import { Chapter, Series } from 'houdoku-extension-lib';
import * as db from '../util/db';
import { getNumberUnreadChapters } from '../util/comparison';

const fetchSerieses = (): Promise<Series[]> => {
  return db.database.select().from(db.seriesTable).exec() as Promise<Series[]>;
};

const fetchChapters = (seriesId: number): Promise<Chapter[]> => {
  return db.database
    .select()
    .from(db.chapterTable)
    .where(db.chapterTable.seriesId.eq(seriesId))
    .exec() as Promise<Chapter[]>;
};

const fetchSeries = (id: number) => {
  return db.database
    .select()
    .from(db.seriesTable)
    .where(db.seriesTable.id.eq(id))
    .exec();
};

const fetchChapter = (id: number) => {
  return db.database
    .select()
    .from(db.chapterTable)
    .where(db.chapterTable.id.eq(id))
    .exec();
};

const addSeries = (series: Series) => {
  const seriesCopy: Series = { ...series };

  return db.database
    .insertOrReplace()
    .into(db.seriesTable)
    .values([db.seriesTable.createRow(seriesCopy)])
    .exec();
};

const addChapters = (chapters: Chapter[], series: Series) => {
  const chaptersCopy: Chapter[] = chapters.map((chapter: Chapter) => {
    return { ...chapter, seriesId: series.id };
  });

  const values = chaptersCopy.map((chapter) =>
    db.chapterTable.createRow(chapter)
  );

  return db.database
    .insertOrReplace()
    .into(db.chapterTable)
    .values(values)
    .exec();
};

const deleteAllSeries = () => {
  db.database.delete().from(db.seriesTable).exec();
};

const deleteChaptersBySeries = (seriesId: number) => {
  return db.database
    .delete()
    .from(db.chapterTable)
    .where(db.chapterTable.seriesId.eq(seriesId))
    .exec();
};

const deleteChaptersById = (chapterIds: number[]): Promise<void> => {
  if (chapterIds.length === 0) return new Promise((resolve) => resolve());

  // eslint-disable-next-line consistent-return
  return db.database
    .delete()
    .from(db.chapterTable)
    .where(db.chapterTable.id.eq(chapterIds[0]))
    .exec()
    .then(() => deleteChaptersById(chapterIds.slice(1)));
};

const deleteSeries = (id: number) => {
  return db.database
    .delete()
    .from(db.seriesTable)
    .where(db.seriesTable.id.eq(id))
    .exec()
    .then(() => deleteChaptersBySeries(id));
};

const updateSeriesNumberUnread = (series: Series) => {
  if (series.id !== undefined) {
    return fetchChapters(series.id).then((chapterList: Chapter[]) => {
      const newSeries: Series = {
        ...series,
        numberUnread: getNumberUnreadChapters(chapterList),
      };
      return addSeries(newSeries);
    });
  }
  return null;
};

export default {
  fetchSerieses,
  fetchChapters,
  fetchSeries,
  fetchChapter,
  addSeries,
  addChapters,
  deleteSeries,
  deleteAllSeries,
  deleteChaptersBySeries,
  deleteChaptersById,
  updateSeriesNumberUnread,
};
