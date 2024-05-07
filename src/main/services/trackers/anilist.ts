import fetch, { Response } from 'node-fetch';
import {
  GetUsernameFunc,
  GetAuthUrlFunc,
  TrackerClientAbstract,
  SearchFunc,
  GetLibraryEntryFunc,
  AddLibraryEntryFunc,
  UpdateLibraryEntryFunc,
  GetTokenFunc,
} from '@/common/models/interface';
import { TrackEntry, TrackerMetadata, TrackScoreFormat, TrackStatus } from '@/common/models/types';
import { AniListTrackerMetadata } from '@/common/temp_tracker_metadata';

const clientId = '5631';

const STATUS_MAP: { [key: string]: TrackStatus } = {
  CURRENT: TrackStatus.Reading,
  PLANNING: TrackStatus.Planning,
  COMPLETED: TrackStatus.Completed,
  DROPPED: TrackStatus.Dropped,
  PAUSED: TrackStatus.Paused,
  REREADING: TrackStatus.Reading,
};

const SCORE_FORMAT_MAP: { [key: string]: TrackScoreFormat } = {
  POINT_10: TrackScoreFormat.POINT_10,
  POINT_100: TrackScoreFormat.POINT_100,
  POINT_10_DECIMAL: TrackScoreFormat.POINT_10_DECIMAL,
  POINT_5: TrackScoreFormat.POINT_5,
  POINT_3: TrackScoreFormat.POINT_3,
};

// eslint-disable-next-line import/prefer-default-export
export class AniListTrackerClient extends TrackerClientAbstract {
  userId: string;

  userScoreFormat: TrackScoreFormat | undefined;

  constructor(accessToken = '') {
    super(accessToken);
    this.userId = '';
  }

  getMetadata: () => TrackerMetadata = () => {
    return AniListTrackerMetadata;
  };

  getAuthUrl: GetAuthUrlFunc = () => {
    return `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&response_type=token`;
  };

  getToken: GetTokenFunc = (code: string) => {
    return new Promise((resolve) => resolve(code));
  };

  getUsername: GetUsernameFunc = () => {
    if (this.accessToken === '') return new Promise((resolve) => resolve(null));

    const query = `
      query User {
        Viewer {
          id
          name
          mediaListOptions {
            scoreFormat
          }
        }
      }`.trim();

    const url = 'https://graphql.anilist.co';
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query }),
    };

    return (
      fetch(url, options)
        .then((response: Response) => response.json())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((data: any) => {
          if ('errors' in data) {
            console.error(
              `Error getting username from tracker ${AniListTrackerMetadata.id}: ${data.errors
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((error: any) => error.message)
                .join('; ')}`,
            );
            return null;
          }
          this.userId = data.data.Viewer.id;
          this.userScoreFormat = SCORE_FORMAT_MAP[data.data.Viewer.mediaListOptions.scoreFormat];
          return data.data.Viewer.name;
        })
        .catch((e: Error) => console.error(e))
    );
  };

  search: SearchFunc = (text: string) => {
    if (this.accessToken === '') return new Promise((resolve) => resolve([]));

    const query = `
      query Search(${'$'}query: String) {
        Page (perPage: 10) {
          media (search: ${'$'}query, type: MANGA, format_not_in: [NOVEL]) {
            id
            title {
              romaji
            }
            coverImage {
              large
            }
            description
          }
        }
      }`.trim();

    const url = 'https://graphql.anilist.co';
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables: { query: text } }),
    };

    return (
      fetch(url, options)
        .then((response: Response) => response.json())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((data: any) => {
          if ('errors' in data) {
            console.error(
              `Error searching from tracker ${AniListTrackerMetadata.id}: ${data.errors
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((error: any) => error.message)
                .join('; ')}`,
            );
            return null;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return data.data.Page.media.map((media: any) => ({
            id: media.id,
            title: media.title.romaji,
            description: media.description === null ? '' : media.description,
            coverUrl: media.coverImage.large,
          }));
        })
        .catch((e: Error) => {
          console.error(e);
          return [];
        })
    );
  };

  getLibraryEntry: GetLibraryEntryFunc = async (seriesId: string) => {
    if (this.accessToken === '') return new Promise((resolve) => resolve(null));

    if (this.userId === '' || this.userScoreFormat === undefined) await this.getUsername();
    if (this.userId === '') return null;

    const query = `
      query (${'$'}id: Int!, ${'$'}manga_id: Int!) {
        MediaList (userId: ${'$'}id, type: MANGA, mediaId: ${'$'}manga_id) {
          id
          status
          score
          progress
          media {
            id
            title {
              romaji
            }
            coverImage {
              large
            }
            description
          }
        }
      }`.trim();

    const url = 'https://graphql.anilist.co';
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { id: this.userId, manga_id: seriesId },
      }),
    };

    return (
      fetch(url, options)
        .then((response: Response) => response.json())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((data: any) => {
          if ('errors' in data) {
            console.warn(
              `Error getting library entry for series ${seriesId} from tracker from tracker ${
                AniListTrackerMetadata.id
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              }: ${data.errors.map((error: any) => error.message).join('; ')}`,
            );
            return null;
          }
          return {
            id: data.data.MediaList.id,
            seriesId: data.data.MediaList.media.id,
            title: data.data.MediaList.media.title.romaji,
            description: data.data.MediaList.media.description,
            coverUrl: data.data.MediaList.media.coverImage.large,
            score: data.data.MediaList.score,
            scoreFormat: this.userScoreFormat,
            progress: data.data.MediaList.progress,
            status: STATUS_MAP[data.data.MediaList.status],
          } as TrackEntry;
        })
        .catch((e: Error) => {
          console.error(e);
          return null;
        })
    );
  };

  addLibraryEntry: AddLibraryEntryFunc = async (trackEntry: TrackEntry) => {
    if (this.accessToken === '') return new Promise((resolve) => resolve(null));

    if (this.userId === '') await this.getUsername();
    if (this.userId === '') return null;

    const query = `
      mutation AddManga(${'$'}mangaId: Int, ${'$'}progress: Int, ${'$'}status: MediaListStatus) {
        SaveMediaListEntry (mediaId: ${'$'}mangaId, progress: ${'$'}progress, status: ${'$'}status) { 
          id 
          status 
        } 
      }`.trim();

    const url = 'https://graphql.anilist.co';
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          mangaId: trackEntry.seriesId,
          progress: trackEntry.progress,
          status: Object.keys(STATUS_MAP).find(
            (key: string) => STATUS_MAP[key] === trackEntry.status,
          ),
        },
      }),
    };

    return (
      fetch(url, options)
        .then((response: Response) => response.json())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((data: any) => {
          if ('errors' in data) {
            console.error(
              `Error adding library entry for series ${trackEntry.seriesId} from tracker ${
                AniListTrackerMetadata.id
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              }: ${data.errors.map((error: any) => error.message).join('; ')}`,
            );
            return null;
          }
          return this.getLibraryEntry(trackEntry.seriesId);
        })
        .catch((e: Error) => {
          console.error(e);
          return null;
        })
    );
  };

  updateLibraryEntry: UpdateLibraryEntryFunc = async (trackEntry: TrackEntry) => {
    if (this.accessToken === '') return new Promise((resolve) => resolve(null));

    if (this.userId === '' || this.userScoreFormat === undefined) await this.getUsername();
    if (this.userId === '') return null;

    const prevEntry = await this.getLibraryEntry(trackEntry.seriesId);
    if (prevEntry === null)
      return this.addLibraryEntry(trackEntry).then(() => this.updateLibraryEntry(trackEntry));

    trackEntry.id = prevEntry.id;
    if (trackEntry.progress === undefined) {
      trackEntry.progress = prevEntry.progress;
    }
    if (trackEntry.status === undefined) {
      trackEntry.status = prevEntry.status;
    }
    if (trackEntry.score === undefined) {
      trackEntry.score = prevEntry.score;
    }

    const query = `
      mutation UpdateManga (
        ${'$'}listId: Int, ${'$'}progress: Int, ${'$'}status: MediaListStatus, ${'$'}score: Float
      ) {
        SaveMediaListEntry (
          id: ${'$'}listId, progress: ${'$'}progress, status: ${'$'}status, score: ${'$'}score
        ) {
          id
          progress
          status
        }
      }`.trim();

    const url = 'https://graphql.anilist.co';
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          listId: trackEntry.id,
          progress: trackEntry.progress,
          status: Object.keys(STATUS_MAP).find(
            (key: string) => STATUS_MAP[key] === trackEntry.status,
          ),
          score: trackEntry.score === undefined ? 0 : trackEntry.score,
        },
      }),
    };

    return (
      fetch(url, options)
        .then((response: Response) => response.json())
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((data: any) => {
          if ('errors' in data) {
            console.error(
              `Error updating library entry for series ${trackEntry.seriesId} from tracker ${
                AniListTrackerMetadata.id
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              }: ${data.errors.map((error: any) => error.message).join('; ')}`,
            );
            return null;
          }
          return this.getLibraryEntry(trackEntry.seriesId);
        })
        .catch((e: Error) => {
          console.error(e);
          return null;
        })
    );
  };
}
