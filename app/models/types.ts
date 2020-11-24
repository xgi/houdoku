export type Series = {
  id?: number;
  source_id: string;
  title: string;
  author: string;
  artist: string;
  remoteCoverUrl: string;
};

export type Chapter = {
  id: number;
  title: string;
  chapterNumber: number;
  volumeNumber: number;
  series_id: number;
};
