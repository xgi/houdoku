// eslint-disable-next-line import/no-cycle
import * as db from '../db';

export default {
  fetchSerieses() {
    return db.database.select().from(db.seriesTable).exec();
  },
  fetchChaptersBySeries(seriesId: number) {
    return db.database
      .select()
      .from(db.chapterTable)
      .where(db.chapterTable.series_id.eq(seriesId));
  },
  fetchSeries(id: number) {
    return db.database
      .select()
      .from(db.seriesTable)
      .where(db.seriesTable.id.eq(id))
      .exec();
  },
  addSeries() {
    const data = {
      title: 'seriestitle1',
      author: 'author1',
      artist: 'artist1',
    };

    return db.database
      .insertOrReplace()
      .into(db.seriesTable)
      .values([db.seriesTable.createRow(data)])
      .exec();
  },
};
