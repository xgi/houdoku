import { Chapter, Series, SeriesSourceType } from '../../models/types';
import { PageRequesterData } from './types';

export interface FetchSeriesFunc {
  (sourceType: SeriesSourceType, id: string): Promise<Response>;
}

export interface ParseSeriesFunc {
  (sourceType: SeriesSourceType, json: any): Series;
}

export interface FetchChaptersFunc {
  (sourceType: SeriesSourceType, id: string): Promise<Response>;
}

export interface ParseChaptersFunc {
  (sourceType: SeriesSourceType, json: any): Chapter[];
}

export interface FetchPageRequesterDataFunc {
  (
    sourceType: SeriesSourceType,
    seriesSourceId: string,
    chapterSourceId: string
  ): Promise<Response>;
}

export interface ParsePageRequesterDataFunc {
  (json: any): PageRequesterData;
}

export interface GetPageUrlsFunction {
  (pageRequesterData: PageRequesterData): string[];
}

export interface GetPageDataFunction {
  (series: Series, url: string): Promise<string>;
}

export interface FetchSearchFunc {
  (text: string, params: { [key: string]: string }): Promise<Response>;
}

export interface ParseSearchFunc {
  (json: any): Series[];
}
