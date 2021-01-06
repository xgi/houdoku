import { Chapter, Series } from '../../models/types';
import {
  FetchSeriesFunc,
  FetchChaptersFunc,
  ParseSeriesFunc,
  ParseChaptersFunc,
} from './interface';

const fetchSeries: FetchSeriesFunc = (id: string) => {
  const promise = fetch(`https://mangadex.org/api/v2/manga/${id}`);
  return promise;
};

const parseSeries: ParseSeriesFunc = (json: any): Series => {
  const series: Series = {
    id: undefined,
    source_id: json.data.id,
    title: json.data.title,
    author: json.data.author[0],
    artist: json.data.artist[0],
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
      source_id: element.id,
      title: element.title,
      chapterNumber: element.chapter,
      volumeNumber: element.volume,
      series_id: 13,
    });
  });
  return chapters;
};

export default {
  fetchSeries,
  parseSeries,
  fetchChapters,
  parseChapters,
};
