export type Series = {
  id: number;
  title: string;
  author: string;
  artist: string;
};

export type Chapter = {
  id: number;
  title: string;
  chapterNumber: number;
  volumeNumber: number;
  series_id: number;
};
