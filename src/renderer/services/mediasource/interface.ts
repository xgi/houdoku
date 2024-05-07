import { Series } from '@tiyo/common';

/**
 * Request a banner image URL from the media source.
 * The banner is for display at the top of the series details page.
 *
 * @param series the series to get the banner image for
 * @returns Promise<Response> to be handled by ParseBannerImageUrlFunc
 */
export interface FetchBannerImageUrlFunc {
  (series: Series): Promise<Response>;
}

/**
 * Parse the response from FetchBannerImageUrlFunc
 *
 * @param json the json content of the response
 * @returns the banner image URL, if found, else null
 */
export interface ParseBannerImageUrlFunc {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (json: any): string | null;
}
