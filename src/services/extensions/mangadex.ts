import {
  Chapter,
  ContentWarning,
  Format,
  Genre,
  LanguageKey,
  Series,
  SeriesStatus,
  Theme,
} from '../../models/types';
import {
  FetchSeriesFunc,
  FetchChaptersFunc,
  ParseSeriesFunc,
  ParseChaptersFunc,
  ParsePageRequesterDataFunc,
  FetchPageRequesterDataFunc,
  GetPageUrlsFunction,
} from './interface';
import { ExtensionMetadata, PageRequesterData } from './types';

const METADATA: ExtensionMetadata = {
  id: 2,
  name: 'MangaDex',
  url: 'https://mangadex.org',
  version: 1,
};

const SERIES_STATUS_MAP: { [key: number]: SeriesStatus } = {
  1: SeriesStatus.ONGOING,
  2: SeriesStatus.COMPLETED,
  3: SeriesStatus.CANCELLED,
};

const LANGUAGE_MAP: { [key: string]: LanguageKey } = {
  sa: LanguageKey.ARABIC,
  bd: LanguageKey.BENGALI,
  bg: LanguageKey.BULGARIAN,
  mm: LanguageKey.BURMESE,
  ct: LanguageKey.CATALAN,
  cn: LanguageKey.CHINESE_SIMP,
  hk: LanguageKey.CHINESE_TRAD,
  cz: LanguageKey.CZECH,
  dk: LanguageKey.DANISH,
  nl: LanguageKey.DUTCH,
  gb: LanguageKey.ENGLISH,
  ph: LanguageKey.FILIPINO,
  fi: LanguageKey.FINNISH,
  fr: LanguageKey.FRENCH,
  de: LanguageKey.GERMAN,
  gr: LanguageKey.GREEK,
  il: LanguageKey.HEBREW,
  in: LanguageKey.HINDI,
  hu: LanguageKey.HUNGARIAN,
  id: LanguageKey.INDONESIAN,
  it: LanguageKey.ITALIAN,
  jp: LanguageKey.JAPANESE,
  kr: LanguageKey.KOREAN,
  lt: LanguageKey.LITHUANIAN,
  my: LanguageKey.MALAY,
  mn: LanguageKey.MONGOLIAN,
  ir: LanguageKey.PERSIAN,
  pl: LanguageKey.POLISH,
  br: LanguageKey.PORTUGUESE_BR,
  pt: LanguageKey.PORTUGUESE_PT,
  ro: LanguageKey.ROMANIAN,
  ru: LanguageKey.RUSSIAN,
  rs: LanguageKey.SERBO_CROATIAN,
  es: LanguageKey.SPANISH_ES,
  mx: LanguageKey.SPANISH_LATAM,
  se: LanguageKey.SWEDISH,
  th: LanguageKey.THAI,
  tr: LanguageKey.TURKISH,
  ua: LanguageKey.UKRAINIAN,
  vn: LanguageKey.VIETNAMESE,
};

const GENRES_MAP: { [key: number]: Genre } = {
  2: Genre.ACTION,
  3: Genre.ADVENTURE,
  5: Genre.COMEDY,
  8: Genre.DRAMA,
  10: Genre.FANTASY,
  13: Genre.HISTORICAL,
  14: Genre.HORROR,
  17: Genre.MECHA,
  18: Genre.MEDICAL,
  20: Genre.MYSTERY,
  22: Genre.PSYCHOLOGICAL,
  23: Genre.ROMANCE,
  25: Genre.SCI_FI,
  28: Genre.SHOUJO_AI,
  30: Genre.SHOUNEN_AI,
  31: Genre.SLICE_OF_LIFE,
  33: Genre.SPORTS,
  35: Genre.TRAGEDY,
  37: Genre.YAOI,
  38: Genre.YURI,
  41: Genre.ISEKAI,
  51: Genre.CRIME,
  52: Genre.MAGICAL_GIRLS,
  53: Genre.PHILOSOPHICAL,
  54: Genre.SUPERHERO,
  55: Genre.THRILLER,
  56: Genre.WUXIA,
};

const THEMES_MAP: { [key: number]: Theme } = {
  6: Theme.COOKING,
  11: Theme.GYARU,
  12: Theme.HAREM,
  16: Theme.MARTIAL_ARTS,
  19: Theme.MUSIC,
  24: Theme.SCHOOL_LIFE,
  34: Theme.SUPERNATURAL,
  40: Theme.VIDEO_GAMES,
  57: Theme.ALIENS,
  58: Theme.ANIMALS,
  59: Theme.CROSSDRESSING,
  60: Theme.DEMONS,
  61: Theme.DELINQUENTS,
  62: Theme.GENDERSWAP,
  63: Theme.GHOSTS,
  64: Theme.MONSTER_GIRLS,
  65: Theme.LOLI,
  66: Theme.MAGIC,
  67: Theme.MILITARY,
  68: Theme.MONSTERS,
  69: Theme.NINJA,
  70: Theme.OFFICE_WORKERS,
  71: Theme.POLICE,
  72: Theme.POST_APOCALYPTIC,
  73: Theme.REINCARNATION,
  74: Theme.REVERSE_HAREM,
  75: Theme.SAMURAI,
  76: Theme.SHOTA,
  77: Theme.SURVIVAL,
  78: Theme.TIME_TRAVEL,
  79: Theme.VAMPIRES,
  80: Theme.TRADITIONAL_GAMES,
  81: Theme.VIRTUAL_REALITY,
  82: Theme.ZOMBIES,
  83: Theme.INCEST,
  84: Theme.MAFIA,
  85: Theme.VILLAINESS,
};

const FORMAT_MAP: { [key: number]: Format } = {
  1: Format.YONKOMA,
  4: Format.AWARD_WINNING,
  7: Format.DOUJINSHI,
  21: Format.ONESHOT,
  36: Format.LONG_STRIP,
  42: Format.ADAPTATION,
  43: Format.ANTHOLOGY,
  44: Format.WEB_COMIC,
  45: Format.FULL_COLOR,
  46: Format.USER_CREATED,
  47: Format.OFFICIAL_COLORED,
  48: Format.FAN_COLORED,
};

const CONTENT_WARNINGS_MAP: { [key: number]: ContentWarning } = {
  9: ContentWarning.ECCHI,
  32: ContentWarning.SMUT,
  49: ContentWarning.GORE,
  50: ContentWarning.SEXUAL_VIOLENCE,
};

const fetchSeries: FetchSeriesFunc = (id: string) => {
  const promise = fetch(`https://mangadex.org/api/v2/manga/${id}`);
  return promise;
};

const parseSeries: ParseSeriesFunc = (json: any): Series => {
  const genres: Genre[] = [];
  const themes: Theme[] = [];
  const formats: Format[] = [];
  const contentWarnings: ContentWarning[] = [];

  json.data.tags.forEach((tag: number) => {
    if (tag in GENRES_MAP) {
      genres.push(GENRES_MAP[tag]);
    }
    if (tag in THEMES_MAP) {
      themes.push(THEMES_MAP[tag]);
    }
    if (tag in FORMAT_MAP) {
      formats.push(FORMAT_MAP[tag]);
    }
    if (tag in CONTENT_WARNINGS_MAP) {
      contentWarnings.push(CONTENT_WARNINGS_MAP[tag]);
    }
  });

  const series: Series = {
    id: undefined,
    extensionId: METADATA.id,
    sourceId: json.data.id,
    title: json.data.title,
    altTitles: json.data.altTitles,
    description: json.data.description,
    authors: json.data.author,
    artists: json.data.artist,
    genres,
    themes,
    formats,
    contentWarnings,
    status: SERIES_STATUS_MAP[json.data.publication.status],
    originalLanguageKey: LANGUAGE_MAP[json.data.publication.language],
    remoteCoverUrl: json.data.mainCover.split('?')[0],
  };
  return series;
};

const fetchChapters: FetchChaptersFunc = (id: string) => {
  const promise = fetch(`https://mangadex.org/api/v2/manga/${id}/chapters`);
  return promise;
};

const parseChapters: ParseChaptersFunc = (json: any): Chapter[] => {
  const chapters: Chapter[] = [];

  json.data.chapters.forEach((element: any) => {
    chapters.push({
      id: undefined,
      seriesId: undefined,
      sourceId: element.id,
      title: element.title,
      chapterNumber: element.chapter,
      volumeNumber: element.volume,
      languageKey: LANGUAGE_MAP[element.language],
      time: element.timestamp,
    });
  });
  return chapters;
};

const fetchPageRequesterData: FetchPageRequesterDataFunc = (
  chapter_id: string
) => {
  const promise = fetch(`https://mangadex.org/api/v2/chapter/${chapter_id}`);
  return promise;
};

const parsePageRequesterData: ParsePageRequesterDataFunc = (
  json: any
): PageRequesterData => {
  const pageFilenames: string[] = [];
  json.data.pages.forEach((filename: string) => pageFilenames.push(filename));

  return {
    server: json.data.server,
    hash: json.data.hash,
    numPages: pageFilenames.length,
    pageFilenames,
  };
};

const getPageUrls: GetPageUrlsFunction = (
  pageRequesterData: PageRequesterData
) => {
  const pageUrls: string[] = [];
  for (let i = 0; i < pageRequesterData.numPages; i += 1) {
    pageUrls.push(
      `${pageRequesterData.server}${pageRequesterData.hash}/${pageRequesterData.pageFilenames[i]}`
    );
  }
  return pageUrls;
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
};
