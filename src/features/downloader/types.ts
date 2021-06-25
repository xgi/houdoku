import { DownloadError, DownloadTask } from '../../services/downloader';

export const DOWNLOAD_CHAPTERS = 'DOWNLOAD_CHAPTERS';
export const PAUSE_DOWNLOADER = 'PAUSE_DOWNLOADER';
export const START_DOWNLOADER = 'START_DOWNLOADER';
export const INTERNAL_COPY_CLIENT_STATE = 'INTERNAL_COPY_CLIENT_STATE';

export interface DownloaderState {
  running: boolean;
  queue: DownloadTask[];
  downloadErrors: DownloadError[];
}

interface DownloadChaptersAction {
  type: typeof DOWNLOAD_CHAPTERS;
  payload: {
    tasks: DownloadTask[];
  };
}

interface PauseDownloaderAction {
  type: typeof PAUSE_DOWNLOADER;
}

interface StartDownloaderAction {
  type: typeof START_DOWNLOADER;
}

interface InternalCopyClientStateAction {
  type: typeof INTERNAL_COPY_CLIENT_STATE;
}

export type DownloaderAction =
  | DownloadChaptersAction
  | PauseDownloaderAction
  | StartDownloaderAction
  | InternalCopyClientStateAction;
