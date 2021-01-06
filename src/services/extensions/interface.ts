import { Chapter, Series } from '../../models/types';

export interface FetchSeriesFunc {
  (id: string): Promise<Response>;
}

export interface ParseSeriesFunc {
  (json: any): Series;
}

export interface FetchChaptersFunc {
  (id: string): Promise<Response>;
}

export interface ParseChaptersFunc {
  (json: any): Chapter[];
}
