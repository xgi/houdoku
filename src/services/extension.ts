import { Chapter, Series, SeriesSourceType } from '../models/types';
import filesystem from './extensions/filesystem';
import mangadex from './extensions/mangadex';
import { ExtensionMetadata, PageRequesterData } from './extensions/types';

export const EXTENSIONS = {
  [filesystem.METADATA.id]: filesystem,
  [mangadex.METADATA.id]: mangadex,
};

/**
 * Get the metadata for an extension
 * @param extensionId
 * @returns the ExtensionMetadata defined for the extension
 */
export function getExtensionMetadata(extensionId: number): ExtensionMetadata {
  return EXTENSIONS[extensionId].METADATA;
}

/**
 * Get a series from an extension.
 *
 * The series is populated with fields provided by the content source, and is sufficient to be
 * imported into the user's library. Note that the id field will be undefined since that refers
 * to the id for the series after being imported.
 *
 * @param extensionId
 * @param sourceType the type of the series source
 * @param seriesId
 * @returns promise for the matching series
 */
export function getSeries(
  extensionId: number,
  sourceType: SeriesSourceType,
  seriesId: string
): Promise<Series> {
  const extension = EXTENSIONS[extensionId];
  return extension
    .fetchSeries(sourceType, seriesId)
    .then((response) => response.json())
    .then((data) => extension.parseSeries(sourceType, data));
}

/**
 * Get a list of chapters for a series on the content source.
 *
 * Chapters are populated with fields provided by the content source. Note that there may be
 * multiple instances of the "same" chapter which are actually separate releases (either by
 * different groups or in different languages).
 *
 * @param extensionId
 * @param sourceType the type of the series source
 * @param seriesId
 * @returns promise for a list of chapters
 */
export function getChapters(
  extensionId: number,
  sourceType: SeriesSourceType,
  seriesId: string
): Promise<Chapter[]> {
  const extension = EXTENSIONS[extensionId];
  return extension
    .fetchChapters(sourceType, seriesId)
    .then((response) => response.json())
    .then((data) => extension.parseChapters(sourceType, data));
}

/**
 * Get a PageRequesterData object with values for getting individual page URLs.
 *
 * The PageRequesterData is solely used to be provided to getPageUrls, and should be considered
 * unique for each chapter (it will only work for the chapter with id specified to this function).
 *
 * @param extensionId
 * @param sourceType the type of the series source
 * @param seriesSourceId
 * @param chapterSourceId
 * @returns promise for the PageRequesterData for this chapter
 */
export function getPageRequesterData(
  extensionId: number,
  sourceType: SeriesSourceType,
  seriesSourceId: string,
  chapterSourceId: string
): Promise<PageRequesterData> {
  const extension = EXTENSIONS[extensionId];
  return extension
    .fetchPageRequesterData(sourceType, seriesSourceId, chapterSourceId)
    .then((response) => response.json())
    .then((data) => extension.parsePageRequesterData(data));
}

/**
 * Get page URLs for a chapter.
 *
 * The values from this function CANNOT be safely used as an image source; they must be passed to
 * getPageData which is strictly for that purpose.
 *
 * @param extensionId
 * @param pageRequesterData the PageRequesterData from getPageRequesterData for this chapter
 * @returns a list of urls for this chapter which can be passed to getPageData
 */
export function getPageUrls(
  extensionId: number,
  pageRequesterData: PageRequesterData
): string[] {
  return EXTENSIONS[extensionId].getPageUrls(pageRequesterData);
}

/**
 * Get data for a page.
 *
 * The value from this function (within the promise) can be put inside the src tag of an HTML <img>.
 * In most cases it is simply a promise for the provided URL; however, that cannot be guaranteed
 * since we may also need to load data from an archive.
 *
 * @param extensionId
 * @param series
 * @param url the URL for the page from getPageUrls
 * @returns promise for page data that can be put inside an <img> src
 */
export async function getPageData(
  extensionId: number,
  series: Series,
  url: string
): Promise<string> {
  return EXTENSIONS[extensionId].getPageData(series, url);
}

/**
 * Search for a series.
 *
 * @param extensionId
 * @param text the user's search input; this can contain parameters in the form "key:value" which
 * are utilized at the extension's discretion
 * @returns promise for a list of series found from the content source
 */
export function search(extensionId: number, text: string): Promise<Series[]> {
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
