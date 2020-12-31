import { Series } from '../../models/types';
import {
  FetchSeriesFunc,
  FetchChaptersFunc,
  ParseSeriesFunc,
} from './interface';

const fetchSeries: FetchSeriesFunc = (id: string) => {
  const promise = fetch(`https://mangadex.org/api/v2/manga/${id}`);
  return promise;
};

const parseSeries: ParseSeriesFunc = (json: any) => {
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

export default {
  fetchSeries,
  parseSeries,
  fetchChapters,
};
