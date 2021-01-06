/* eslint-disable promise/catch-or-return */
import mangadex from './extensions/mangadex';

export function getSeries(id: string) {
  return mangadex
    .fetchSeries(id)
    .then((response) => response.json())
    .then((data) => mangadex.parseSeries(data));
}

export function getChapters(id: string) {
  return mangadex
    .fetchChapters(id)
    .then((response) => response.json())
    .then((data) => mangadex.parseChapters(data));
}
