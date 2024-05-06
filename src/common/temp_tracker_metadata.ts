import { TrackerMetadata } from './models/types';

export const AniListTrackerMetadata: TrackerMetadata = {
  id: 'AniList',
  name: 'AniList',
  url: 'https://anilist.co',
  hasCustomLists: false,
};

export const MUTrackerMetadata: TrackerMetadata = {
  id: 'MangaUpdates',
  name: 'MangaUpdates',
  url: 'https://mangaupdates.com',
  hasCustomLists: true,
};

export const MALTrackerMetadata: TrackerMetadata = {
  id: 'MyAnimeList',
  name: 'MyAnimeList',
  url: 'https://myanimelist.net',
  hasCustomLists: false,
};
