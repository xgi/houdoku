import {
  Chapter,
  ContentWarningKey,
  FormatKey,
  GenreKey,
  LanguageKey,
  Series,
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
  GetPageUrlsFunction,
  FetchSearchFunc,
  ParseSearchFunc,
} from './interface';
import { ExtensionMetadata, PageRequesterData } from './types';

const METADATA: ExtensionMetadata = {
  id: 2,
  name: 'MangaDex',
  url: 'https://mangadex.org',
  version: 1,
  notice:
    'This extension currently has limited search functionality. To add a series,' +
    ' either copy-paste the URL into the search field, or enter id:<series_id>',
  noticeUrl: '',
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

const GENRE_MAP: { [key: number]: GenreKey } = {
  2: GenreKey.ACTION,
  3: GenreKey.ADVENTURE,
  5: GenreKey.COMEDY,
  8: GenreKey.DRAMA,
  10: GenreKey.FANTASY,
  13: GenreKey.HISTORICAL,
  14: GenreKey.HORROR,
  17: GenreKey.MECHA,
  18: GenreKey.MEDICAL,
  20: GenreKey.MYSTERY,
  22: GenreKey.PSYCHOLOGICAL,
  23: GenreKey.ROMANCE,
  25: GenreKey.SCI_FI,
  28: GenreKey.SHOUJO_AI,
  30: GenreKey.SHOUNEN_AI,
  31: GenreKey.SLICE_OF_LIFE,
  33: GenreKey.SPORTS,
  35: GenreKey.TRAGEDY,
  37: GenreKey.YAOI,
  38: GenreKey.YURI,
  41: GenreKey.ISEKAI,
  51: GenreKey.CRIME,
  52: GenreKey.MAGICAL_GIRLS,
  53: GenreKey.PHILOSOPHICAL,
  54: GenreKey.SUPERHERO,
  55: GenreKey.THRILLER,
  56: GenreKey.WUXIA,
};

const THEME_MAP: { [key: number]: ThemeKey } = {
  6: ThemeKey.COOKING,
  11: ThemeKey.GYARU,
  12: ThemeKey.HAREM,
  16: ThemeKey.MARTIAL_ARTS,
  19: ThemeKey.MUSIC,
  24: ThemeKey.SCHOOL_LIFE,
  34: ThemeKey.SUPERNATURAL,
  40: ThemeKey.VIDEO_GAMES,
  57: ThemeKey.ALIENS,
  58: ThemeKey.ANIMALS,
  59: ThemeKey.CROSSDRESSING,
  60: ThemeKey.DEMONS,
  61: ThemeKey.DELINQUENTS,
  62: ThemeKey.GENDERSWAP,
  63: ThemeKey.GHOSTS,
  64: ThemeKey.MONSTER_GIRLS,
  65: ThemeKey.LOLI,
  66: ThemeKey.MAGIC,
  67: ThemeKey.MILITARY,
  68: ThemeKey.MONSTERS,
  69: ThemeKey.NINJA,
  70: ThemeKey.OFFICE_WORKERS,
  71: ThemeKey.POLICE,
  72: ThemeKey.POST_APOCALYPTIC,
  73: ThemeKey.REINCARNATION,
  74: ThemeKey.REVERSE_HAREM,
  75: ThemeKey.SAMURAI,
  76: ThemeKey.SHOTA,
  77: ThemeKey.SURVIVAL,
  78: ThemeKey.TIME_TRAVEL,
  79: ThemeKey.VAMPIRES,
  80: ThemeKey.TRADITIONAL_GAMES,
  81: ThemeKey.VIRTUAL_REALITY,
  82: ThemeKey.ZOMBIES,
  83: ThemeKey.INCEST,
  84: ThemeKey.MAFIA,
  85: ThemeKey.VILLAINESS,
};

const FORMAT_MAP: { [key: number]: FormatKey } = {
  1: FormatKey.YONKOMA,
  4: FormatKey.AWARD_WINNING,
  7: FormatKey.DOUJINSHI,
  21: FormatKey.ONESHOT,
  36: FormatKey.LONG_STRIP,
  42: FormatKey.ADAPTATION,
  43: FormatKey.ANTHOLOGY,
  44: FormatKey.WEB_COMIC,
  45: FormatKey.FULL_COLOR,
  46: FormatKey.USER_CREATED,
  47: FormatKey.OFFICIAL_COLORED,
  48: FormatKey.FAN_COLORED,
};

const CONTENT_WARNING_MAP: { [key: number]: ContentWarningKey } = {
  9: ContentWarningKey.ECCHI,
  32: ContentWarningKey.SMUT,
  49: ContentWarningKey.GORE,
  50: ContentWarningKey.SEXUAL_VIOLENCE,
};

const fetchSeries: FetchSeriesFunc = (id: string) => {
  const promise = fetch(`https://mangadex.org/api/v2/manga/${id}`);
  return promise;
};

const parseSeries: ParseSeriesFunc = (json: any): Series => {
  const genres: GenreKey[] = [];
  const themes: ThemeKey[] = [];
  const formats: FormatKey[] = [];
  const contentWarnings: ContentWarningKey[] = [];

  json.data.tags.forEach((tag: number) => {
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
    numberUnread: 0,
    remoteCoverUrl: json.data.mainCover.split('?')[0],
    userTags: [],
  };
  return series;
};

const fetchChapters: FetchChaptersFunc = (id: string) => {
  const promise = fetch(`https://mangadex.org/api/v2/manga/${id}/chapters`);
  return promise;
};

const parseChapters: ParseChaptersFunc = (json: any): Chapter[] => {
  const chapters: Chapter[] = [];
  const { groups } = json.data;

  json.data.chapters.forEach((element: any) => {
    const groupId: number = element.groups[0];
    const groupName: string = groups.find((group: any) => group.id === groupId)
      ?.name;

    chapters.push({
      id: undefined,
      seriesId: undefined,
      sourceId: element.id,
      title: element.title,
      chapterNumber: element.chapter,
      volumeNumber: element.volume,
      languageKey: LANGUAGE_MAP[element.language],
      groupName,
      time: element.timestamp,
      read: false,
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

const fetchSearch: FetchSearchFunc = (
  text: string,
  params: { [key: string]: string }
) => {
  if ('id' in params) {
    if (!Number.isNaN(parseInt(params.id, 10))) {
      return fetch(`https://mangadex.org/api/v2/manga/${params.id}`);
    }
  }

  if ('https' in params) {
    const matchUrl: RegExpMatchArray | null = params.https.match(
      new RegExp(/\/\/mangadex\.org\/title\/\d*/g)
    );
    if (matchUrl !== null) {
      const id: string = matchUrl[0].replace('//mangadex.org/title/', '');
      return fetch(`https://mangadex.org/api/v2/manga/${id}`);
    }
  }

  return new Promise((resolve, reject) => {
    const data = {
      error: 'Did not receive an expected ID parameter or series page URL',
      receivedText: text,
      receivedParams: params,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const init = { status: 400 };
    resolve(new Response(blob, init));
  });
};

const parseSearch: ParseSearchFunc = (json: any) => {
  if (!('error' in json) && json.code === 200) {
    return [parseSeries(json)];
  }
  return [];
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
  fetchSearch,
  parseSearch,
};
