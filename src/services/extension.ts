import filesystem from './extensions/filesystem';
import mangadex from './extensions/mangadex';
import { PageRequesterData } from './extensions/types';

export const EXTENSIONS = {
  [filesystem.METADATA.id]: filesystem,
  [mangadex.METADATA.id]: mangadex,
};

export function getSeries(extensionId: number, seriesId: string) {
  const extension = EXTENSIONS[extensionId];
  return extension
    .fetchSeries(seriesId)
    .then((response) => response.json())
    .then((data) => extension.parseSeries(data));
}

export function getChapters(extensionId: number, seriesId: string) {
  const extension = EXTENSIONS[extensionId];
  return extension
    .fetchChapters(seriesId)
    .then((response) => response.json())
    .then((data) => extension.parseChapters(data));
}

export function getPageRequesterData(extensionId: number, chapterId: string) {
  const extension = EXTENSIONS[extensionId];
  return extension
    .fetchPageRequesterData(chapterId)
    .then((response) => response.json())
    .then((data) => extension.parsePageRequesterData(data));
}

export function getPageUrls(
  extensionId: number,
  pageRequesterData: PageRequesterData
) {
  return EXTENSIONS[extensionId].getPageUrls(pageRequesterData);
}
