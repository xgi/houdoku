import { DownloadTask } from '../../services/downloader';
import {
  DOWNLOAD_CHAPTERS,
  DownloaderAction,
  PAUSE_DOWNLOADER,
  INTERNAL_COPY_CLIENT_STATE,
  START_DOWNLOADER,
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

export function internalCopyClientState(): DownloaderAction {
  return {
    type: INTERNAL_COPY_CLIENT_STATE,
  };
}
