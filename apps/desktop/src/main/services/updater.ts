import { IpcMain } from 'electron';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
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
            'Houdoku is up-to-date!',
            'You are using the latest version.',
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
    autoUpdater.removeAllListeners();

    autoUpdater.on('update-downloaded', () => {
      event.sender.send(
        ipcChannels.APP.SEND_NOTIFICATION,
        'Downloaded update',
        `Restart to finish installing update`,
      );
      event.sender.send(ipcChannels.APP.SHOW_RESTART_UPDATE_DIALOG);
    });

    autoUpdater.on('error', (err: Error) => {
      console.error(`Updater encountered error: ${err}`);
      event.sender.send(
        ipcChannels.APP.SEND_NOTIFICATION,
        'Failed to update',
        `${err.name}: ${err.message}`,
      );
    });

    autoUpdater
      .checkForUpdates()
      .then((result) => {
        if (result.updateInfo.version !== packageJson.version) {
          event.sender.send(
            ipcChannels.APP.SEND_NOTIFICATION,
            'Downloading update',
            `Downloading update for v${result.updateInfo.version}`,
          );
          autoUpdater.downloadUpdate();
        }
      })
      .catch((e) => console.error(e));
  });

  ipcMain.handle(ipcChannels.APP.UPDATE_AND_RESTART, () => {
    autoUpdater.quitAndInstall(true, true);
  });
};
