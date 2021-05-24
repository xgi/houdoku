import { Series } from 'houdoku-extension-lib';
import { FetchBannerImageUrlFunc, ParseBannerImageUrlFunc } from './interface';

const fetchBannerImageUrl: FetchBannerImageUrlFunc = (series: Series) => {
  const query =
    'query ($q: String) {\n' +
    '  Media (search: $q, type: MANGA, format_not_in: [NOVEL]) {\n' +
    '    id\n' +
    '    bannerImage\n' +
    '  }\n' +
    '}';

  const data = {
    query,
    variables: { q: series.title },
  };

  return fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

const parseBannerImageUrl: ParseBannerImageUrlFunc = (json: any) => {
  const { data } = json;

  if ('Media' in data && data.Media !== null) {
    return data.Media.bannerImage;
  }
  return null;
};

export default {
  fetchBannerImageUrl,
  parseBannerImageUrl,
};
