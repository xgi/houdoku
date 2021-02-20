import { Series } from '../models/types';
import anilist from './mediasource/anilist';

// eslint-disable-next-line import/prefer-default-export
export function getBannerImageUrl(series: Series) {
  return anilist
    .fetchBannerImageUrl(series)
    .then((response) => response.json())
    .then((data) => anilist.parseBannerImageUrl(data));
}
