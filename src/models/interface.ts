import { TrackEntry, TrackerMetadata, TrackerSeries } from './types';

export interface GetAuthUrlFunc {
  (): string;
}

export interface GetUsernameFunc {
  (): Promise<string | null>;
}

export interface SearchFunc {
  (query: string): Promise<TrackerSeries[]>;
}

export interface GetLibraryEntryFunc {
  (seriesId: string): Promise<TrackEntry | null>;
}

export interface AddLibraryEntryFunc {
  (trackEntry: TrackEntry): Promise<TrackEntry | null>;
}

export interface UpdateLibraryEntryFunc {
  (trackEntry: TrackEntry): Promise<TrackEntry | null>;
}

export interface SetAccessTokenFunc {
  (accessToken: string): void;
}

export interface TrackerClientInterface {
  accessToken: string;

  getMetadata: () => TrackerMetadata;
  getAuthUrl: GetAuthUrlFunc;
  getUsername: GetUsernameFunc;
  search: SearchFunc;
  getLibraryEntry: GetLibraryEntryFunc;
  addLibraryEntry: AddLibraryEntryFunc;
  updateLibraryEntry: UpdateLibraryEntryFunc;
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

  search!: SearchFunc;

  getLibraryEntry!: GetLibraryEntryFunc;

  addLibraryEntry!: AddLibraryEntryFunc;

  updateLibraryEntry!: UpdateLibraryEntryFunc;

  setAccessToken: SetAccessTokenFunc = (accessToken: string) => {
    this.accessToken = accessToken;
  };
}
