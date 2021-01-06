/* eslint-disable promise/catch-or-return */
import {
  beforeLoadSeries,
  beforeLoadSeriesList,
  afterLoadSeries,
  afterLoadSeriesList,
  beforeLoadChapterList,
  afterLoadChapterList,
  afterLoadChapter,
  beforeLoadChapter,
} from './actions';
import db from '../services/db';

export function loadSeriesList(dispatch: any) {
  dispatch(beforeLoadSeriesList());
  db.fetchSerieses().then((response: any) =>
    dispatch(afterLoadSeriesList(response))
  );
}

export function loadSeries(dispatch: any, id: number) {
  dispatch(beforeLoadSeries());
  db.fetchSeries(id).then((response: any) =>
    dispatch(afterLoadSeries(response[0]))
  );
}

export function loadChapter(dispatch: any, id: number) {
  dispatch(beforeLoadChapter());
  db.fetchChapter(id).then((response: any) =>
    dispatch(afterLoadChapter(response[0]))
  );
}

export function loadChapterList(dispatch: any, seriesId: number) {
  dispatch(beforeLoadChapterList());
  db.fetchChapters(seriesId).then((response: any) =>
    dispatch(afterLoadChapterList(response))
  );
}
