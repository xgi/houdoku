import { atom } from 'recoil';
import { DownloadError, DownloadTask } from '../services/downloader';

export const runningState = atom({
  key: 'downloaderRunningState',
  default: false,
});

export const queueState = atom({
  key: 'downloaderQueueState',
  default: [] as DownloadTask[],
});

export const currentTaskState = atom({
  key: 'downloaderCurrentTaskState',
  default: null as DownloadTask | null,
});

export const downloadErrorsState = atom({
  key: 'downloaderDownloadErrorsState',
  default: [] as DownloadError[],
});
