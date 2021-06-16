import { TrackerMetadata } from './types';

export interface GetAuthUrlFunc {
  (): string;
}

export interface GetUsernameFunc {
  (): Promise<string | null>;
}

export interface SetAccessTokenFunc {
  (accessToken: string): void;
}

export interface TrackerClientInterface {
  accessToken: string;

  getMetadata: () => TrackerMetadata;
  getAuthUrl: GetAuthUrlFunc;
  getUsername: GetUsernameFunc;
  setAccessToken: SetAccessTokenFunc;
}

export abstract class TrackerClientAbstract implements TrackerClientInterface {
  accessToken: string;

  constructor(accessToken = '') {
    this.accessToken = accessToken;
  }

  getMetadata!: () => TrackerMetadata;

  getAuthUrl!: GetAuthUrlFunc;

  getUsername!: GetUsernameFunc;

  setAccessToken: SetAccessTokenFunc = (accessToken: string) => {
    this.accessToken = accessToken;
  };
}
