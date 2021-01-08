import { Chapter, Series } from '../../models/types';
import { PageRequesterData } from './types';

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

export interface FetchPageRequesterDataFunc {
  (chapter_id: string): Promise<Response>;
}

export interface ParsePageRequesterDataFunc {
  (json: any): PageRequesterData;
}

export interface GetPageUrlsFunction {
  (pageRequesterData: PageRequesterData): string[];
}
