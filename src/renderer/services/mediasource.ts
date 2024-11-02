import { Series } from '@tiyo/common';
import anilist from './mediasource/anilist';

/**
 * Get the banner image URL for a series.
 * @param series
 * @returns promise for the banner URL, if available, else null
 */
export function getBannerImageUrl(series: Series) {
  return anilist
    .fetchBannerImageUrl(series)
    .then((response) => response.json())
    .then((data) => anilist.parseBannerImageUrl(data));
}
