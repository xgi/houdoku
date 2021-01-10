import mangadex from './extensions/mangadex';
import { PageRequesterData } from './extensions/types';

export const EXTENSIONS = {
  [mangadex.METADATA.id]: mangadex,
};

export function getSeries(extensionId: number, seriesId: string) {
  return EXTENSIONS[extensionId]
    .fetchSeries(seriesId)
    .then((response) => response.json())
    .then((data) => mangadex.parseSeries(data));
}

export function getChapters(extensionId: number, seriesId: string) {
  return EXTENSIONS[extensionId]
    .fetchChapters(seriesId)
    .then((response) => response.json())
    .then((data) => mangadex.parseChapters(data));
}

export function getPageRequesterData(extensionId: number, chapterId: string) {
  return EXTENSIONS[extensionId]
    .fetchPageRequesterData(chapterId)
    .then((response) => response.json())
    .then((data) => mangadex.parsePageRequesterData(data));
}

export function getPageUrls(
  extensionId: number,
  pageRequesterData: PageRequesterData
) {
  return EXTENSIONS[extensionId].getPageUrls(pageRequesterData);
}
