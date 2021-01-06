export type Series = {
  id?: number;
  source_id: string;
  title: string;
  altTitles: string[];
  description: string;
  authors: string[];
  artists: string[];
  genres: Genre[];
  themes: Theme[];
  contentWarnings: ContentWarning[];
  formats: Format[];
  status: SeriesStatus;
  originalLanguage: Language;
  remoteCoverUrl: string;
};

export type Chapter = {
  id?: number;
  series_id?: number;
  source_id: string;
  title: string;
  chapterNumber: string;
  volumeNumber: string;
  language: Language;
  time: number;
};

export enum PageFit {
  Auto,
  Width,
  Height,
}

export enum LayoutDirection {
  LeftToRight,
  RightToLeft,
}

export enum SeriesStatus {
  ONGOING,
  COMPLETED,
  CANCELLED,
}

export enum Language {
  ENGLISH,
  JAPANESE,
}

export enum Genre {
  ACTION,
  ADVENTURE,
  COMEDY,
  DRAMA,
  FANTASY,
  HISTORICAL,
  HORROR,
  MECHA,
  MEDICAL,
  MYSTERY,
  PSYCHOLOGICAL,
  ROMANCE,
  SCI_FI,
  SHOUJO_AI,
  SHOUNEN_AI,
  SLICE_OF_LIFE,
  SPORTS,
  TRAGEDY,
  YAOI,
  YURI,
  ISEKAI,
  CRIME,
  MAGICAL_GIRLS,
  PHILOSOPHICAL,
  SUPERHERO,
  THRILLER,
  WUXIA,
}

export enum Theme {
  COOKING,
  GYARU,
  HAREM,
  MARTIAL_ARTS,
  MUSIC,
  SCHOOL_LIFE,
  SUPERNATURAL,
  VIDEO_GAMES,
  ALIENS,
  ANIMALS,
  CROSSDRESSING,
  DEMONS,
  DELINQUENTS,
  GENDERSWAP,
  GHOSTS,
  MONSTER_GIRLS,
  LOLI,
  MAGIC,
  MILITARY,
  MONSTERS,
  NINJA,
  OFFICE_WORKERS,
  POLICE,
  POST_APOCALYPTIC,
  REINCARNATION,
  REVERSE_HAREM,
  SAMURAI,
  SHOTA,
  SURVIVAL,
  TIME_TRAVEL,
  VAMPIRES,
  TRADITIONAL_GAMES,
  VIRTUAL_REALITY,
  ZOMBIES,
  INCEST,
  MAFIA,
  VILLAINESS,
}

export enum Format {
  YONKOMA,
  AWARD_WINNING,
  DOUJINSHI,
  ONESHOT,
  LONG_STRIP,
  ADAPTATION,
  ANTHOLOGY,
  WEB_COMIC,
  FULL_COLOR,
  USER_CREATED,
  OFFICIAL_COLORED,
  FAN_COLORED,
}

export enum ContentWarning {
  ECCHI,
  SMUT,
  GORE,
  SEXUAL_VIOLENCE,
}
