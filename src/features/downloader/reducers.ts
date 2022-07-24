import { EnhancedStore } from '@reduxjs/toolkit';
import DownloaderClient from '../../services/downloader';
import { internalCopyClientState } from './actions';
import {
  DOWNLOAD_CHAPTERS,
  DownloaderState,
  PAUSE_DOWNLOADER,
  INTERNAL_COPY_CLIENT_STATE,
  START_DOWNLOADER,
  CLEAR_DOWNLOADER_QUEUE,
} from './types';

const downloaderClient = new DownloaderClient();

const initialState: DownloaderState = {
  running: false,
  queue: [],
  currentTask: null,
  downloadErrors: [],
};

export default function downloader(
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state = initialState,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: any
): DownloaderState {
  switch (action.type) {
    case DOWNLOAD_CHAPTERS:
      downloaderClient.add(action.payload.tasks);
      downloaderClient.start();
      break;
    case PAUSE_DOWNLOADER:
      downloaderClient.pause();
      break;
    case START_DOWNLOADER:
      downloaderClient.start();
      break;
    case CLEAR_DOWNLOADER_QUEUE:
      downloaderClient.clear();
      break;
    case INTERNAL_COPY_CLIENT_STATE:
      break;
    default:
      break;
  }
  return {
    ...state,
    running: downloaderClient.running,
    queue: [...downloaderClient.queue],
    currentTask: downloaderClient.currentTask,
    downloadErrors: [...downloaderClient.downloadErrors],
  };
}

export const linkDownloaderClientFunctions = (
  store: EnhancedStore,
  setStatusText: (statusText: string) => void
) => {
  downloaderClient.setStatusTextFunc((text: string | undefined) => {
    if (text) setStatusText(text);
  });
  downloaderClient.setCopyClientStateFunc(() =>
    store.dispatch(internalCopyClientState())
  );
};
