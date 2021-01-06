export type Series = {
  id?: number;
  source_id: string;
  title: string;
  author: string;
  artist: string;
  remoteCoverUrl: string;
};

export type Chapter = {
  id?: number;
  source_id: string;
  title: string;
  chapterNumber: string;
  volumeNumber: string;
  series_id?: number;
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
