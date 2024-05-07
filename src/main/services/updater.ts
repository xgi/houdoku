import { IpcMain } from 'electron';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import { v4 as uuidv4 } from 'uuid';
import ipcChannels from '@/common/constants/ipcChannels.json';
import packageJson from '../../../package.json';

export const createUpdaterIpcHandlers = (ipcMain: IpcMain) => {
  console.debug('Creating updater IPC handlers in main...');

  ipcMain.handle(ipcChannels.APP.CHECK_FOR_UPDATES, (event) => {
    console.debug('Handling check for updates request...');
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      console.info('Skipping update check because we are in dev environment');
      return;
    }

    autoUpdater.logger = console;
    autoUpdater.autoDownload = false;

    return autoUpdater
      .checkForUpdates()
      .then((result: UpdateCheckResult) => {
        if (result.updateInfo.version === packageJson.version) {
          console.info(`Already up-to-date at version ${packageJson.version}`);
          event.sender.send(
            ipcChannels.APP.SEND_NOTIFICATION,
            {
              title: 'Houdoku is up-to-date!',
              color: 'teal',
            },
            false,
            'check',
          );
          return;
        }

        console.info(
          `Found update to version ${result.updateInfo.version} (from ${packageJson.version})`,
        );
        event.sender.send(ipcChannels.APP.SHOW_PERFORM_UPDATE_DIALOG, result.updateInfo);
        return 4;
      })
      .catch((e) => console.error(e));
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
          loading: false,
          autoClose: true,
          disallowClose: false,
        },
        true,
        'check',
      );
      event.sender.send(ipcChannels.APP.SHOW_RESTART_UPDATE_DIALOG);
    });

    autoUpdater.on('error', (err: Error) => {
      console.error(`Updater encountered error: ${err}`);
      event.sender.send(
        ipcChannels.APP.SEND_NOTIFICATION,
        {
          title: 'Failed to update',
          message: `${err.name}: ${err.message}`,
          color: 'red',
          id: notificationId,
          loading: false,
          autoClose: true,
          disallowClose: false,
        },
        true,
        'x',
      );
    });

    autoUpdater
      .checkForUpdates()
      .then((result) => {
        if (result.updateInfo.version !== packageJson.version) {
          event.sender.send(ipcChannels.APP.SEND_NOTIFICATION, {
            title: 'Downloading update',
            message: `Downloading update for v${result.updateInfo.version}`,
            id: notificationId,
            loading: true,
            autoClose: false,
            disallowClose: true,
          });
          autoUpdater.downloadUpdate();
        }
      })
      .catch((e) => console.error(e));
  });

  ipcMain.handle(ipcChannels.APP.UPDATE_AND_RESTART, () => {
    autoUpdater.quitAndInstall(true, true);
  });
};
