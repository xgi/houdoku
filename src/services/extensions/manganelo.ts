/* eslint-disable no-continue */
import { ipcRenderer } from 'electron';
import {
  Chapter,
  ContentWarningKey,
  FormatKey,
  GenreKey,
  LanguageKey,
  Series,
  SeriesSourceType,
  SeriesStatus,
  ThemeKey,
} from '../../models/types';
import {
  FetchSeriesFunc,
  FetchChaptersFunc,
  ParseSeriesFunc,
  ParseChaptersFunc,
  ParsePageRequesterDataFunc,
  FetchPageRequesterDataFunc,
  GetPageUrlsFunc,
  FetchSearchFunc,
  ParseSearchFunc,
  GetPageDataFunc,
} from './interface';
import { ExtensionMetadata, PageRequesterData } from './types';

const METADATA: ExtensionMetadata = {
  id: 3,
  name: 'MangaNelo',
  url: 'https://mangadex.org',
  version: 1,
  notice: '',
  noticeUrl: '',
  pageLoadMessage: 'Bypassing a Cloudflare filter, so this may take a few seconds.',
};

const SERIES_STATUS_MAP: { [key: string]: SeriesStatus } = {
  Ongoing: SeriesStatus.ONGOING,
  Completed: SeriesStatus.COMPLETED,
};

const GENRE_MAP: { [key: number]: GenreKey } = {
  2: GenreKey.ACTION,
  3: GenreKey.ADVENTURE,
  6: GenreKey.COMEDY,
  10: GenreKey.DRAMA,
  12: GenreKey.FANTASY,
  15: GenreKey.HISTORICAL,
  16: GenreKey.HORROR,
  22: GenreKey.MEDICAL,
  24: GenreKey.MYSTERY,
  26: GenreKey.PSYCHOLOGICAL,
  27: GenreKey.ROMANCE,
  29: GenreKey.SCI_FI,
  31: GenreKey.SHOUJO_AI,
  32: GenreKey.SHOUJO_AI,
  33: GenreKey.SHOUNEN_AI,
  34: GenreKey.SHOUNEN_AI,
  35: GenreKey.SLICE_OF_LIFE,
  37: GenreKey.SPORTS,
  39: GenreKey.TRAGEDY,
  41: GenreKey.YAOI,
  42: GenreKey.YURI,
  45: GenreKey.ISEKAI,
};

const THEME_MAP: { [key: number]: ThemeKey } = {
  7: ThemeKey.COOKING,
  14: ThemeKey.HAREM,
  19: ThemeKey.MARTIAL_ARTS,
  28: ThemeKey.SCHOOL_LIFE,
  38: ThemeKey.SUPERNATURAL,
  13: ThemeKey.GENDERSWAP,
};

const FORMAT_MAP: { [key: number]: FormatKey } = {
  9: FormatKey.DOUJINSHI,
  25: FormatKey.ONESHOT,
  40: FormatKey.WEB_COMIC,
};

const CONTENT_WARNING_MAP: { [key: number]: ContentWarningKey } = {
  11: ContentWarningKey.ECCHI,
  36: ContentWarningKey.SMUT,
};

const fetchSeries: FetchSeriesFunc = (
  sourceType: SeriesSourceType,
  id: string
) => {
  const promise = fetch(`https://manganelo.com/manga/${id}`);
  return promise;
};

const parseSeries: ParseSeriesFunc = (
  sourceType: SeriesSourceType,
  data: any
): Series => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/html');

  const sourceId = doc
    .getElementsByTagName('link')[0]
    .getAttribute('href')
    ?.split('/manga/')
    .pop();

  const description = doc.getElementById('panel-story-info-description')
    ?.textContent;
  const infoPanel = doc.getElementsByClassName('panel-story-info')[0];
  const remoteCoverUrl = infoPanel
    .getElementsByClassName('img-loading')[0]
    .getAttribute('src');
  const title = infoPanel.getElementsByTagName('h1')[0].textContent;

  const table = infoPanel.getElementsByClassName('variations-tableInfo')[0];
  const tableRows = table.getElementsByTagName('tr');

  const altTitles = tableRows[0]
    .getElementsByTagName('h2')[0]
    .textContent?.split(' ; ');
  const authorLinks = tableRows[1].getElementsByTagName('a');
  const statusText = tableRows[2].getElementsByClassName('table-value')[0]
    .textContent;
  const tagLinks = tableRows[3].getElementsByTagName('a');

  const authors: string[] = [];
  Object.values(authorLinks).forEach((tagLink: HTMLAnchorElement) => {
    if (tagLink.textContent) authors.push(tagLink.textContent);
  });
  const status = statusText
    ? SERIES_STATUS_MAP[statusText]
    : SeriesStatus.ONGOING;

  const genres: GenreKey[] = [];
  const themes: ThemeKey[] = [];
  const formats: FormatKey[] = [];
  const contentWarnings: ContentWarningKey[] = [];
  let languageKey = LanguageKey.JAPANESE;

  Object.values(tagLinks).forEach((tagLink: HTMLAnchorElement) => {
    const tagNumStr = tagLink.getAttribute('href')?.split('-').pop();
    if (tagNumStr !== undefined) {
      const tag = parseInt(tagNumStr, 10);

      if (tag in GENRE_MAP) {
        genres.push(GENRE_MAP[tag]);
      }
      if (tag in THEME_MAP) {
        themes.push(THEME_MAP[tag]);
      }
      if (tag in FORMAT_MAP) {
        formats.push(FORMAT_MAP[tag]);
      }
      if (tag in CONTENT_WARNING_MAP) {
        contentWarnings.push(CONTENT_WARNING_MAP[tag]);
      }

      if (tag === 44) languageKey = LanguageKey.CHINESE_SIMP;
      if (tag === 43) languageKey = LanguageKey.KOREAN;
    }
  });

  const series: Series = {
    id: undefined,
    extensionId: METADATA.id,
    sourceId: sourceId || '',
    sourceType: SeriesSourceType.STANDARD,
    title: title || '',
    altTitles: altTitles || [],
    description: description || '',
    authors,
    artists: [],
    genres,
    themes,
    formats,
    contentWarnings,
    status,
    originalLanguageKey: languageKey,
    numberUnread: 0,
    remoteCoverUrl: remoteCoverUrl || '',
    userTags: [],
  };
  return series;
};

const fetchChapters: FetchChaptersFunc = (
  sourceType: SeriesSourceType,
  id: string
) => {
  const promise = fetch(`https://manganelo.com/manga/${id}`);
  return promise;
};

const parseChapters: ParseChaptersFunc = (
  sourceType: SeriesSourceType,
  data: any
): Chapter[] => {
  const chapters: Chapter[] = [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/html');

  const chapterContainer = doc.getElementsByClassName('row-content-chapter')[0];
  const chapterRows = chapterContainer.getElementsByTagName('li');

  Object.values(chapterRows).forEach((chapterRow: HTMLLIElement) => {
    const timeStr = chapterRow
      .getElementsByClassName('chapter-time')[0]
      .getAttribute('title');
    const time =
      timeStr === null ? new Date().getTime() : new Date(timeStr).getTime();

    const chapterLink = chapterRow.getElementsByTagName('a')[0];
    const sourceId = chapterLink.getAttribute('href')?.split('/').pop();
    const title = chapterLink.textContent;
    if (title === null) return;

    const matchChapterNum: RegExpMatchArray | null = title.match(
      new RegExp(/Chapter (\d)+/g)
    );
    const matchVolumeNum: RegExpMatchArray | null = title.match(
      new RegExp(/Vol\.(\d)+/g)
    );

    if (matchChapterNum === null) return;
    const chapterNumber = matchChapterNum[0].split(' ').pop();
    const volumeNumber =
      matchVolumeNum === null ? '' : matchVolumeNum[0].split('.').pop();

    chapters.push({
      id: undefined,
      seriesId: undefined,
      sourceId: sourceId || '',
      title: title || '',
      chapterNumber: chapterNumber || '',
      volumeNumber: volumeNumber || '',
      languageKey: LanguageKey.ENGLISH,
      groupName: '',
      time,
      read: false,
    });
  });
  return chapters;
};

const fetchPageRequesterData: FetchPageRequesterDataFunc = (
  sourceType: SeriesSourceType,
  seriesSourceId: string,
  chapterSourceId: string
) => {
  return ipcRenderer.invoke(
    'load-url-spoof',
    `https://manganelo.com/chapter/${seriesSourceId}/${chapterSourceId}`
  );
};

const parsePageRequesterData: ParsePageRequesterDataFunc = (
  data: any
): PageRequesterData => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/html');

  const readerContainer = doc.getElementsByClassName(
    'container-chapter-reader'
  )[0];
  const imageElements = readerContainer.getElementsByTagName('img');

  const pageFilenames: string[] = [];
  Object.values(imageElements).forEach((imageElement: HTMLImageElement) => {
    const src = imageElement.getAttribute('src');
    if (src !== null) pageFilenames.push(src);
  });

  return {
    server: 'json.data.server',
    hash: '',
    numPages: pageFilenames.length,
    pageFilenames,
  };
};

const getPageUrls: GetPageUrlsFunc = (pageRequesterData: PageRequesterData) => {
  return pageRequesterData.pageFilenames;
};

const getPageData: GetPageDataFunc = (series: Series, url: string) => {
  return new Promise((resolve, reject) => {
    resolve(url);
  });
};

const fetchSearch: FetchSearchFunc = (
  text: string,
  params: { [key: string]: string }
) => {
  const promise = fetch(`https://manganelo.com/search/story/${text}`);
  return promise;
};

const parseSearch: ParseSearchFunc = (data: any) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(data, 'text/html');

  const searchContainers = doc.getElementsByClassName('search-story-item');

  const seriesList: Series[] = [];
  for (let i = 0; i < searchContainers.length; i += 1) {
    const item = searchContainers.item(i);
    if (item === null) break;

    const imgs = item.getElementsByClassName('img-loading');
    const coverUrl = imgs.length > 0 ? imgs.item(0)?.getAttribute('src') : '';

    const linkElements = item.getElementsByClassName('item-img');
    const link = linkElements.item(0);
    if (link === null) continue;

    const title = link.getAttribute('title');
    const sourceId = link.getAttribute('href')?.split('/').pop();
    if (title === null || sourceId === undefined) continue;

    const authorElements = item.getElementsByClassName('item-author');
    const author =
      authorElements.length > 0
        ? authorElements.item(0)?.getAttribute('title')
        : '';

    seriesList.push({
      id: undefined,
      extensionId: METADATA.id,
      sourceId,
      sourceType: SeriesSourceType.STANDARD,
      title,
      altTitles: [],
      description: '',
      authors: author ? [author] : [],
      artists: [],
      genres: [],
      themes: [],
      contentWarnings: [],
      formats: [],
      status: SeriesStatus.ONGOING,
      originalLanguageKey: LanguageKey.JAPANESE,
      numberUnread: 0,
      remoteCoverUrl: coverUrl || '',
      userTags: [],
    });
  }
  return seriesList;
};

export default {
  METADATA,
  fetchSeries,
  parseSeries,
  fetchChapters,
  parseChapters,
  fetchPageRequesterData,
  parsePageRequesterData,
  getPageUrls,
  getPageData,
  fetchSearch,
  parseSearch,
};
