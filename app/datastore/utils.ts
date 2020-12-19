/* eslint-disable promise/catch-or-return */
import {
  beforeLoadSeries,
  beforeLoadSeriesList,
  afterLoadSeries,
  afterLoadSeriesList,
  beforeLoadChapterList,
  afterLoadChapterList,
  beforeAddSeries,
  afterAddSeries,
} from './actions';
import db from '../services/db';

export function loadSeriesList(dispatch: any) {
  dispatch(beforeLoadSeriesList());
  db.fetchSerieses().then((response) =>
    dispatch(afterLoadSeriesList(response))
  );
}

export function loadSeries(dispatch: any, id: number) {
  dispatch(beforeLoadSeries());
  db.fetchSeries(id).then((response) => dispatch(afterLoadSeries(response[0])));
}

export function loadChapterList(dispatch: any, seriesId: number) {
  dispatch(beforeLoadChapterList());
  db.fetchChapters(seriesId).then((response) =>
    dispatch(afterLoadChapterList(response))
  );
}

export function addSeries(dispatch: any, series: Series) {
  const seriesCopy = { ...series };
  dispatch(beforeAddSeries());
  db.addSeries(seriesCopy).then((response) =>
    dispatch(afterAddSeries(response[0]))
  );
}
