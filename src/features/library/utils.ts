/* eslint-disable promise/catch-or-return */
import { setSeriesList, setSeries, setChapterList } from './actions';
import db from '../../services/db';

export function loadSeriesList(dispatch: any) {
  db.fetchSerieses().then((response: any) => {
    dispatch(setSeriesList(response));
    console.log(response);
    return true;
  });
}

export function loadSeries(dispatch: any, id: number) {
  db.fetchSeries(id).then((response: any) => dispatch(setSeries(response[0])));
}

export function loadChapterList(dispatch: any, seriesId: number) {
  db.fetchChapters(seriesId).then((response: any) =>
    dispatch(setChapterList(response))
  );
}
