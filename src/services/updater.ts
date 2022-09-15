import { IpcMain } from 'electron';
import log from 'electron-log';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import { v4 as uuidv4 } from 'uuid';
import ipcChannels from '../constants/ipcChannels.json';
import packageJson from '../package.json';

// eslint-disable-next-line import/prefer-default-export
export const createUpdaterIpcHandlers = (ipcMain: IpcMain) => {
  log.debug('Creating updater IPC handlers in main...');

  ipcMain.handle(ipcChannels.APP.CHECK_FOR_UPDATES, (event) => {
    log.debug('Handling check for updates request...');
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      log.info('Skipping update check because we are in dev environment');
      return;
    }

    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;

    autoUpdater
      .checkForUpdates()
      .then((result: UpdateCheckResult) => {
        // eslint-disable-next-line promise/always-return
        if (result.updateInfo.version === packageJson.version) {
          log.info(`Already up-to-date at version ${packageJson.version}`);
          return;
        }

        log.info(
          `Found update to version ${result.updateInfo.version} (from ${packageJson.version})`
        );
        event.sender.send(ipcChannels.APP.SHOW_PERFORM_UPDATE_DIALOG, result.updateInfo);
      })
      .catch((e) => log.error(e));
  });

  ipcMain.handle(ipcChannels.APP.PERFORM_UPDATE, (event) => {
    const notificationId = `downloading-update-${uuidv4()}`;
    autoUpdater.removeAllListeners();

    autoUpdater.on('update-downloaded', () => {
      event.sender.send(
        ipcChannels.APP.SEND_NOTIFICATION,
        {
          title: 'Downloaded update',
          message: `Restart to finish installing update`,
          color: 'teal',
          id: notificationId,
        },
        true,
        'check'
      );
      event.sender.send(ipcChannels.APP.SHOW_RESTART_UPDATE_DIALOG);
    });

    autoUpdater.on('error', (err: Error) => {
      log.error(`Updater encountered error: ${err}`);
      event.sender.send(
        ipcChannels.APP.SEND_NOTIFICATION,
        {
          title: 'Failed to update',
          message: `${err.name}: ${err.message}`,
          color: 'red',
          id: notificationId,
        },
        true,
        'x'
      );
    });

    autoUpdater
      .checkForUpdates()
      .then((result) => {
        // eslint-disable-next-line promise/always-return
        if (result.updateInfo.version !== packageJson.version) {
          event.sender.send(ipcChannels.APP.SEND_NOTIFICATION, {
            title: 'Downloading update',
            message: `Downloading update for v${result.updateInfo.version}`,
            id: notificationId,
            loading: true,
            disallowClose: true,
            autoClose: false,
          });
          autoUpdater.downloadUpdate();
        }
      })
      .catch((e) => log.error(e));
  });

  ipcMain.handle(ipcChannels.APP.UPDATE_AND_RESTART, () => {
    autoUpdater.quitAndInstall(true, true);
  });
};
