/* eslint-disable promise/catch-or-return */
import { setSeriesList, setSeries, setChapterList } from './actions';
import db from '../../services/db';
import { Chapter, Series } from '../../models/types';

export function loadSeriesList(dispatch: any) {
  db.fetchSerieses().then((response: any) => dispatch(setSeriesList(response)));
}

export function loadSeries(dispatch: any, id: number) {
  db.fetchSeries(id).then((response: any) => dispatch(setSeries(response[0])));
}

export function loadChapterList(dispatch: any, seriesId: number) {
  db.fetchChapters(seriesId).then((response: any) =>
    dispatch(setChapterList(response))
  );
}

export function toggleChapterRead(
  dispatch: any,
  chapter: Chapter,
  series: Series
) {
  const newChapter: Chapter = { ...chapter, read: !chapter.read };

  if (series.id !== undefined) {
    db.addChapters([newChapter], series)
      .then(() => db.updateSeriesNumberUnread(series))
      .then(() => {
        if (series.id !== undefined) {
          loadChapterList(dispatch, series.id);
          loadSeries(dispatch, series.id);
        }
        return true;
      });
  }
}
