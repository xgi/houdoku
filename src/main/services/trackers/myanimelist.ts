import fetch from 'node-fetch';
import pkceChallenge from 'pkce-challenge';
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
import {
  TrackEntry,
  TrackerMetadata,
  TrackerSeries,
  TrackScoreFormat,
  TrackStatus,
} from '@/common/models/types';
import { formDataFromObject } from '@/main/util/net';
import { MALTrackerMetadata } from '@/common/temp_tracker_metadata';

const CLIENT_ID = '217d11dc032b71dd35c60c7204b07a65';
const BASE_URL = 'https://api.myanimelist.net/v2';
const OAUTH_BASE_URL = 'https://myanimelist.net/v1/oauth2';

const STATUS_MAP: { [key: string]: TrackStatus } = {
  reading: TrackStatus.Reading,
  plan_to_read: TrackStatus.Planning,
  completed: TrackStatus.Completed,
  dropped: TrackStatus.Dropped,
  on_hold: TrackStatus.Paused,
};

type TokenResponseData = {
  token_type: 'Bearer';
  expires_in: number;
  access_token: string;
  refresh_token: string;
};

type UserResponseData = {
  id: number;
  name: string;
  location: string;
  joined_at: string;
};

type MangaResponseData = {
  id: number;
  title: string;
  synopsis: string;
  main_picture: {
    medium: string;
    large: string;
  };
  num_chapters: number;
  my_list_status?: {
    status: string;
    is_rereading: boolean;
    num_volumes_read: number;
    num_chapters_read: number;
    score: number;
  };
};

type MangaListResponseData = {
  data: {
    node: {
      id: number;
      title: string;
      main_picture:
        | {
            large: string | null | undefined;
            medium: string | null | undefined;
          }
        | null
        | undefined;
      start_date: string | null | undefined;
      end_date: string | null | undefined;
      synopsis: string | null | undefined;
      mean: number | null | undefined;
      rank: number | null | undefined;
      media_type: string | undefined;
      popularity: number | null | undefined;
      num_list_users: number | null | undefined;
      num_scoring_users: number | null | undefined;
      my_list_status:
        | {
            status: string | null | undefined;
            score: number;
            num_volumes_read: number;
            num_chapters_read: number;
            start_date: string | null | undefined;
            finish_date: string | null | undefined;
            priority: number;
            tags: string[];
            comments: string;
          }
        | null
        | undefined;
    };
  }[];
  paging: {
    next: string;
  };
};

type UpdateMangaResponseData = {
  error?: string;
  message?: string;
  status: string;
  is_rereading: boolean;
  num_volumes_read: number;
  num_chapters_read: number;
  score: number;
  updated_at: string;
  priority: number;
  num_times_reread: number;
  reread_value: number;
  tags: string[];
  comments: string;
};

// eslint-disable-next-line import/prefer-default-export
export class MALTrackerClient extends TrackerClientAbstract {
  userId: string;

  latestPkceCode: { code_challenge: string; code_verifier: string } | undefined;

  constructor(accessToken = '') {
    super(accessToken);
    this.userId = '';
    this.latestPkceCode = undefined;
  }

  getMetadata: () => TrackerMetadata = () => {
    return MALTrackerMetadata;
  };

  getAuthUrl: GetAuthUrlFunc = () => {
    const pkceCode: { code_challenge: string; code_verifier: string } = pkceChallenge();
    this.latestPkceCode = pkceCode;
    return `${OAUTH_BASE_URL}/authorize?client_id=${CLIENT_ID}&code_challenge=${pkceCode.code_challenge}&response_type=code`;
  };

  getToken: GetTokenFunc = (code: string) => {
    if (!this.latestPkceCode) return new Promise((resolve) => resolve(null));

    const url = `${OAUTH_BASE_URL}/token`;
    const options = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
      body: formDataFromObject({
        client_id: CLIENT_ID,
        code,
        // We use the code_challenge as the verifier here because MAL only uses PKCE plain (WTF?)
        code_verifier: this.latestPkceCode.code_challenge,
        grant_type: 'authorization_code',
      }),
    };

    return fetch(url, options)
      .then((response) => response.json())
      .then((data: TokenResponseData) => {
        return data.access_token;
      })
      .catch((e: Error) => {
        console.error(e);
        return null;
      });
  };

  getUsername: GetUsernameFunc = () => {
    if (this.accessToken === '') return new Promise((resolve) => resolve(null));

    const url = `${BASE_URL}/users/@me`;
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
    };

    return fetch(url, options)
      .then((response) => response.json())
      .then((data: UserResponseData) => {
        this.userId = `${data.id}`;
        return data.name;
      })
      .catch((e: Error) => {
        console.error(e);
        return null;
      });
  };

  search: SearchFunc = async (text: string) => {
    if (this.accessToken === '') return new Promise((resolve) => resolve([]));

    const url = `${BASE_URL}/manga?q=${text}&nsfw=true&fields=id,title,synopsis,main_picture,media_type`;
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
    };

    return fetch(url, options)
      .then((response) => response.json())
      .then((data: MangaListResponseData) => {
        return data.data
          .filter((item) => item.node.media_type !== 'light_novel')
          .map((item) => {
            const { node } = item;
            return {
              id: node.id.toString(),
              title: node.title,
              description: node.synopsis,
              coverUrl: node.main_picture?.large,
            } as TrackerSeries;
          });
      })
      .catch((e: Error) => {
        console.error(e);
        return [];
      });
  };

  getLibraryEntry: GetLibraryEntryFunc = async (seriesId: string) => {
    if (this.accessToken === '') return new Promise((resolve) => resolve(null));

    if (this.userId === '') await this.getUsername();
    if (this.userId === '') return null;

    const url = `${BASE_URL}/manga/${seriesId}?fields=synopsis,num_chapters,my_list_status{start_date,finish_date}`;
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
    };

    return fetch(url, options)
      .then((response) => response.json())
      .then((data: MangaResponseData) => {
        if (data.my_list_status === undefined) {
          return null;
        }

        return {
          seriesId: `${data.id}`,
          title: data.title,
          description: data.synopsis,
          coverUrl: data.main_picture?.large,
          score: data.my_list_status.score,
          scoreFormat: TrackScoreFormat.POINT_10,
          progress: data.my_list_status.num_chapters_read,
          status: STATUS_MAP[data.my_list_status.status],
        } as TrackEntry;
      })
      .catch((e: Error) => {
        console.error(e);
        return null;
      });
  };

  addLibraryEntry: AddLibraryEntryFunc = async (trackEntry: TrackEntry) => {
    return this.updateLibraryEntry(trackEntry);
  };

  updateLibraryEntry: UpdateLibraryEntryFunc = async (trackEntry: TrackEntry) => {
    if (this.accessToken === '') return new Promise((resolve) => resolve(null));

    if (this.userId === '') await this.getUsername();
    if (this.userId === '') return null;

    const formContents = {
      num_chapters_read: trackEntry.progress,
      status: Object.keys(STATUS_MAP).find((key: string) => STATUS_MAP[key] === trackEntry.status),
      score: trackEntry.score,
    };

    const bodyFields: string[] = [];
    Object.entries(formContents).forEach(([key, value]) => {
      if (value !== undefined) {
        bodyFields.push(`${key}=${value}`);
      }
    });

    const url = `${BASE_URL}/manga/${trackEntry.seriesId}/my_list_status`;
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
      body: bodyFields.join('&'),
    };

    return fetch(url, options)
      .then((response) => response.json())
      .then((data: UpdateMangaResponseData) => {
        if ('error' in data) {
          console.error(
            `Error updating library entry for series ${trackEntry.seriesId} from tracker ${MALTrackerMetadata.id}: ${data.error}`,
          );
          return null;
        }

        return this.getLibraryEntry(trackEntry.seriesId);
      })
      .catch((e: Error) => {
        console.error(e);
        return null;
      });
  };
}
