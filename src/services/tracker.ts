import { IpcMain } from 'electron';
import log from 'electron-log';
import ipcChannels from '../constants/ipcChannels.json';
import { TrackerClientInterface } from '../models/interface';
import {
  AniListTrackerClient,
  AniListTrackerMetadata,
} from './trackers/anilist';

const TRACKER_CLIENTS: { [key: string]: TrackerClientInterface } = {
  [AniListTrackerMetadata.id]: new AniListTrackerClient(),
};

function getAuthUrl(trackerId: string): string {
  const tracker = TRACKER_CLIENTS[trackerId];
  log.info(`Getting auth url from tracker ${trackerId}`);
  return tracker.getAuthUrl();
}

function getUsername(trackerId: string): Promise<string | null> {
  const tracker = TRACKER_CLIENTS[trackerId];
  log.info(`Getting username from tracker ${trackerId}`);
  return tracker.getUsername();
}

function setAccessToken(trackerId: string, accessToken: string): void {
  const tracker = TRACKER_CLIENTS[trackerId];
  log.info(`Setting access token for tracker ${trackerId}`);
  return tracker.setAccessToken(accessToken);
}

// eslint-disable-next-line import/prefer-default-export
export const createTrackerIpcHandlers = (ipcMain: IpcMain) => {
  log.debug('Creating tracker IPC handlers in main...');

  ipcMain.handle(ipcChannels.TRACKER_MANAGER.GET_ALL, async () => {
    return Object.values(TRACKER_CLIENTS).map(
      (client: TrackerClientInterface) => client.getMetadata()
    );
  });

  ipcMain.handle(
    ipcChannels.TRACKER.GET_AUTH_URL,
    (_event, trackerId: string) => {
      return getAuthUrl(trackerId);
    }
  );
  ipcMain.handle(
    ipcChannels.TRACKER.GET_USERNAME,
    (_event, trackerId: string) => {
      return getUsername(trackerId);
    }
  );
  ipcMain.handle(
    ipcChannels.TRACKER.SET_ACCESS_TOKEN,
    (_event, trackerId: string, accessToken: string) => {
      return setAccessToken(trackerId, accessToken);
    }
  );
};
