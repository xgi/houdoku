import { Series } from '../../models/types';

export interface FetchBannerImageUrlFunc {
  (series: Series): Promise<Response>;
}

export interface ParseBannerImageUrlFunc {
  (json: any): string | null;
}
