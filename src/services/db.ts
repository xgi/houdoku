// eslint-disable-next-line import/no-cycle
import * as db from '../db';
import { Chapter, Series } from '../models/types';
import { getNumberUnreadChapters } from '../util/comparison';

const fetchSerieses = () => {
  return db.database.select().from(db.seriesTable).exec();
};

const fetchChapters = (seriesId: number) => {
  return db.database
    .select()
    .from(db.chapterTable)
    .where(db.chapterTable.seriesId.eq(seriesId))
    .exec();
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

const deleteSeries = (id: number) => {
  return db.database
    .delete()
    .from(db.seriesTable)
    .where(db.seriesTable.id.eq(id))
    .exec();
};

const deleteAllSeries = () => {
  db.database.delete().from(db.seriesTable).exec();
};

const deleteChapters = (series: Series) => {
  return db.database
    .delete()
    .from(db.chapterTable)
    .where(db.chapterTable.seriesId.eq(series.id))
    .exec();
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
  deleteChapters,
  updateSeriesNumberUnread,
};
