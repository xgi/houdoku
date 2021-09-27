import log from 'electron-log';
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
} from '../../models/interface';
import { TrackEntry, TrackerMetadata } from '../../models/types';
import { formDataFromObject } from '../../util/net';

const CLIENT_ID = '217d11dc032b71dd35c60c7204b07a65';
const BASE_URL = 'https://api.myanimelist.net/v2';
const OAUTH_BASE_URL = 'https://myanimelist.net/v1/oauth2';

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

export const MALTrackerMetadata: TrackerMetadata = {
  id: '051ced8a-97e1-496a-841b-3214ed1884bb',
  name: 'MyAnimeList',
  url: 'https://myanimelist.net',
};

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
    const pkceCode: { code_challenge: string; code_verifier: string } =
      pkceChallenge();
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
        log.error(e);
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
        return data.name;
      })
      .catch((e: Error) => {
        log.error(e);
        return null;
      });
  };

  search: SearchFunc = (text: string) => {
    return new Promise((resolve) => resolve([]));
  };

  getLibraryEntry: GetLibraryEntryFunc = async (seriesId: string) => {
    return new Promise((resolve) => resolve(null));
  };

  addLibraryEntry: AddLibraryEntryFunc = async (trackEntry: TrackEntry) => {
    return new Promise((resolve) => resolve(null));
  };

  updateLibraryEntry: UpdateLibraryEntryFunc = async (
    trackEntry: TrackEntry
  ) => {
    return new Promise((resolve) => resolve(null));
  };
}
