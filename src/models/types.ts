export type Series = {
  id?: number;
  source_id: string;
  title: string;
  altTitles: string[];
  description: string;
  authors: string[];
  artists: string[];
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
