// eslint-disable-next-line import/no-cycle
import * as db from '../db';
import { Chapter, Series } from '../models/types';

export default {
  fetchSerieses() {
    return db.database.select().from(db.seriesTable).exec();
  },
  fetchChapters(seriesId: number) {
    return db.database
      .select()
      .from(db.chapterTable)
      .where(db.chapterTable.series_id.eq(seriesId))
      .exec();
  },
  fetchSeries(id: number) {
    return db.database
      .select()
      .from(db.seriesTable)
      .where(db.seriesTable.id.eq(id))
      .exec();
  },
  fetchChapter(id: number) {
    return db.database
      .select()
      .from(db.chapterTable)
      .where(db.chapterTable.id.eq(id))
      .exec();
  },
  addSeries(series: Series) {
    const seriesCopy: Series = { ...series };

    return db.database
      .insertOrReplace()
      .into(db.seriesTable)
      .values([db.seriesTable.createRow(seriesCopy)])
      .exec();
  },
  addChapters(chapters: Chapter[], series: Series) {
    const chaptersCopy: Chapter[] = chapters.map((chapter: Chapter) => {
      return { ...chapter, series_id: series.id };
    });

    const values = chaptersCopy.map((chapter) =>
      db.chapterTable.createRow(chapter)
    );

    return db.database
      .insertOrReplace()
      .into(db.chapterTable)
      .values(values)
      .exec();
  },
  deleteAllSeries() {
    db.database.delete().from(db.seriesTable).exec();
  },
};
