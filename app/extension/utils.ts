/* eslint-disable promise/catch-or-return */
import { beforeGetSeries, afterGetSeries } from './actions';
import mangadex from './util/mangadex';

// eslint-disable-next-line import/prefer-default-export
export function getSeries(dispatch: any, id: string) {
  dispatch(beforeGetSeries(id));
  mangadex
    .fetchSeries(id)
    .then((response) => response.json())
    .then((data) => dispatch(afterGetSeries(mangadex.parseSeries(data))));
}
