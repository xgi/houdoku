import { EnhancedStore } from '@reduxjs/toolkit';
import DownloaderClient, { DownloadTask } from '../../services/downloader';
import { setStatusText } from '../statusbar/actions';
import { internalCopyClientState } from './actions';
import {
  DOWNLOAD_CHAPTERS,
  DownloaderState,
  PAUSE_DOWNLOADER,
  INTERNAL_COPY_CLIENT_STATE,
  START_DOWNLOADER,
} from './types';

const downloaderClient = new DownloaderClient();

const initialState: DownloaderState = {
  running: false,
  queue: [],
};

export default function downloader(
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
    case INTERNAL_COPY_CLIENT_STATE:
      break;
    default:
      break;
  }
  return {
    ...state,
    running: downloaderClient.running,
    queue: [...downloaderClient.queue],
  };
}

export const linkDownloaderClientFunctions = (store: EnhancedStore) => {
  downloaderClient.setStatusTextFunc((text: string | undefined) =>
    store.dispatch(setStatusText(text))
  );
  downloaderClient.setCopyClientStateFunc(() =>
    store.dispatch(internalCopyClientState())
  );
};
