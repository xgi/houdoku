/* eslint-disable promise/catch-or-return */
import mangadex from './extensions/mangadex';
import { PageRequesterData } from './extensions/types';

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

export function getPageRequesterData(chapter_id: string) {
  return mangadex
    .fetchPageRequesterData(chapter_id)
    .then((response) => response.json())
    .then((data) => mangadex.parsePageRequesterData(data));
}

export function getPageUrls(pageRequesterData: PageRequesterData) {
  return mangadex.getPageUrls(pageRequesterData);
}
