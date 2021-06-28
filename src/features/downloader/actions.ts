import { DownloadTask } from '../../services/downloader';
import {
  DOWNLOAD_CHAPTERS,
  DownloaderAction,
  PAUSE_DOWNLOADER,
  INTERNAL_COPY_CLIENT_STATE,
  START_DOWNLOADER,
  CLEAR_DOWNLOADER_QUEUE,
} from './types';

export function downloadChapters(tasks: DownloadTask[]): DownloaderAction {
  return {
    type: DOWNLOAD_CHAPTERS,
    payload: {
      tasks,
    },
  };
}

export function pauseDownloader(): DownloaderAction {
  return {
    type: PAUSE_DOWNLOADER,
  };
}

export function startDownloader(): DownloaderAction {
  return {
    type: START_DOWNLOADER,
  };
}

export function clearDownloaderQueue(): DownloaderAction {
  return {
    type: CLEAR_DOWNLOADER_QUEUE,
  };
}

// This function is used within the DownloaderClient to force the reducer to update
// its state based on the client's current fields. If the downloader client tries to
// use this action while the reducer is processing another action, it will trip a
// Redux exception.
export function internalCopyClientState(): DownloaderAction {
  return {
    type: INTERNAL_COPY_CLIENT_STATE,
  };
}
