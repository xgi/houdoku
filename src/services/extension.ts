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
