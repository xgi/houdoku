import { Series } from 'houdoku-extension-lib';
import anilist from './mediasource/anilist';

/**
 * Get the banner image URL for a series.
 * @param series
 * @returns promise for the banner URL, if available, else null
 */
// eslint-disable-next-line import/prefer-default-export
export function getBannerImageUrl(series: Series) {
  return anilist
    .fetchBannerImageUrl(series)
    .then((response) => response.json())
    .then((data) => anilist.parseBannerImageUrl(data));
}
