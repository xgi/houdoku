import { Series, SeriesSourceType } from '../models/types';
import filesystem from './extensions/filesystem';
import mangadex from './extensions/mangadex';
import { ExtensionMetadata, PageRequesterData } from './extensions/types';

export const EXTENSIONS = {
  [filesystem.METADATA.id]: filesystem,
  [mangadex.METADATA.id]: mangadex,
};

export function getExtensionMetadata(extensionId: number): ExtensionMetadata {
  return EXTENSIONS[extensionId].METADATA;
}

export function getSeries(
  extensionId: number,
  sourceType: SeriesSourceType,
  seriesId: string
) {
  const extension = EXTENSIONS[extensionId];
  return extension
    .fetchSeries(sourceType, seriesId)
    .then((response) => response.json())
    .then((data) => extension.parseSeries(sourceType, data));
}

export function getChapters(
  extensionId: number,
  sourceType: SeriesSourceType,
  seriesId: string
) {
  const extension = EXTENSIONS[extensionId];
  return extension
    .fetchChapters(sourceType, seriesId)
    .then((response) => response.json())
    .then((data) => extension.parseChapters(sourceType, data));
}

export function getPageRequesterData(
  extensionId: number,
  sourceType: SeriesSourceType,
  seriesSourceId: string,
  chapterSourceId: string
) {
  const extension = EXTENSIONS[extensionId];
  return extension
    .fetchPageRequesterData(sourceType, seriesSourceId, chapterSourceId)
    .then((response) => response.json())
    .then((data) => extension.parsePageRequesterData(data));
}

export function getPageUrls(
  extensionId: number,
  pageRequesterData: PageRequesterData
) {
  return EXTENSIONS[extensionId].getPageUrls(pageRequesterData);
}

export async function getPageData(
  extensionId: number,
  series: Series,
  url: string
) {
  return EXTENSIONS[extensionId].getPageData(series, url);
}

export function search(extensionId: number, text: string) {
  let adjustedText: string = text;

  const paramsRegExp = new RegExp(/\S*:\S*/g);
  const matchParams: RegExpMatchArray | null = text.match(paramsRegExp);

  let params: { [key: string]: string } = {};
  if (matchParams !== null) {
    matchParams.forEach((match: string) => {
      const parts: string[] = match.split(':');
      params = { [parts[0]]: parts[1], ...params };
    });

    adjustedText = text.replace(paramsRegExp, '');
  }

  const extension = EXTENSIONS[extensionId];
  return extension
    .fetchSearch(adjustedText, params)
    .then((response) => response.json())
    .then((data) => extension.parseSearch(data));
}
