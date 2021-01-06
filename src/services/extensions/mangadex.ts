import { Chapter, Language, Series, SeriesStatus } from '../../models/types';
import {
  FetchSeriesFunc,
  FetchChaptersFunc,
  ParseSeriesFunc,
  ParseChaptersFunc,
} from './interface';

const SERIES_STATUS_MAP: { [key: number]: SeriesStatus } = {
  1: SeriesStatus.ONGOING,
  2: SeriesStatus.COMPLETED,
  3: SeriesStatus.CANCELLED,
};

const LANGUAGE_MAP: { [key: string]: Language } = {
  gb: Language.ENGLISH,
  jp: Language.JAPANESE,
};

const fetchSeries: FetchSeriesFunc = (id: string) => {
  const promise = fetch(`https://mangadex.org/api/v2/manga/${id}`);
  return promise;
};

const parseSeries: ParseSeriesFunc = (json: any): Series => {
  const series: Series = {
    id: undefined,
    source_id: json.data.id,
    title: json.data.title,
    altTitles: json.data.altTitles,
    description: json.data.description,
    authors: json.data.author,
    artists: json.data.artist,
    status: SERIES_STATUS_MAP[json.data.publication.status],
    originalLanguage: LANGUAGE_MAP[json.data.publication.language],
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
      series_id: undefined,
      source_id: element.id,
      title: element.title,
      chapterNumber: element.chapter,
      volumeNumber: element.volume,
      language: LANGUAGE_MAP[element.language],
      time: element.timestamp,
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
