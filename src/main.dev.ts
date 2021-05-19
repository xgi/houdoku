/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  MessageBoxReturnValue,
} from 'electron';
import { autoUpdater, UpdateCheckResult } from 'electron-updater';
import log from 'electron-log';
import { walk } from './util/filesystem';
import {
  createExtensionIpcHandlers,
  loadExtensions,
} from './services/extension';
import { loadInWebView } from './util/webview';
import ipcChannels from './constants/ipcChannels.json';

const thumbnailsDir = path.join(app.getPath('userData'), 'thumbnails');
const pluginsDir = path.join(app.getPath('userData'), 'plugins');

// export default class AppUpdater {
//   constructor() {
//     log.transports.file.level = 'info';
//     autoUpdater.logger = log;
//     autoUpdater.checkForUpdatesAndNotify();
//   }
// }

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(log.error);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'resources')
    : path.join(__dirname, '../resources');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    frame: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(log.error);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

ipcMain.handle(ipcChannels.WINDOW.MINIMIZE, (event) => {
  mainWindow?.minimize();
});

ipcMain.handle(ipcChannels.WINDOW.MAX_RESTORE, (event) => {
  if (mainWindow?.isMaximized()) {
    mainWindow?.restore();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle(ipcChannels.WINDOW.CLOSE, (event) => {
  mainWindow?.close();
});

ipcMain.handle(ipcChannels.GET_PATH.THUMBNAILS_DIR, (event) => {
  return thumbnailsDir;
});

ipcMain.handle(ipcChannels.GET_PATH.PLUGINS_DIR, (event) => {
  return pluginsDir;
});

ipcMain.handle(ipcChannels.GET_ALL_FILES, (event, rootPath: string) => {
  return walk(rootPath);
});

ipcMain.handle('check-for-updates', (event) => {
  log.debug('Handling check for updates request...');
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    log.info('Skipping update check because we are in dev environment');
    return;
  }

  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;

  const MB = 10 ** -6;
  const round = (x: number) => Math.ceil(x * 100) / 100;

  autoUpdater.on('download-progress', (progress) => {
    log.debug(`Downloading update: ${progress.transferred}/${progress.total}`);
    event.sender.send(
      'set-status',
      `Downloading update: ${round(progress.percent)}% (${round(
        progress.transferred * MB
      )}/${round(progress.total * MB)} MB) - ${round(
        progress.bytesPerSecond * MB
      )} MB/sec`
    );
  });

  autoUpdater.on('update-downloaded', () => {
    log.debug(`Finished update download`);
    event.sender.send(
      'set-status',
      `Downloaded update successfully. Please restart Houdoku.`
    );
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Restart to Update',
        message: `Houdoku needs to be restarted in order to install the update. Restart now?`,
        buttons: ['Restart Houdoku', 'No'],
      })
      .then((value: MessageBoxReturnValue) => {
        // eslint-disable-next-line promise/always-return
        if (value.response === 0) {
          autoUpdater.quitAndInstall();
        }
      })
      .catch((err) => log.error(err));
  });

  autoUpdater
    .checkForUpdates()
    // eslint-disable-next-line promise/always-return
    .then((result: UpdateCheckResult) => {
      log.info(`Found update to version ${result.updateInfo.version}`);

      const releaseDate = new Date(result.updateInfo.releaseDate);
      const dateStr = `${releaseDate.getFullYear()}-${releaseDate.getMonth()}-${releaseDate.getDate()}`;

      return dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: `An update for Houdoku is available. Download it now?\n\nVersion: ${result.updateInfo.version}\nDate: ${dateStr}`,
        buttons: ['Download Update', 'No'],
      });
    })
    .then((value: MessageBoxReturnValue) => {
      if (value.response === 0) {
        return autoUpdater.downloadUpdate();
      }
      return null;
    })
    .catch((e) => log.error(e));
});

// create ipc handlers for specific extension functionality
createExtensionIpcHandlers(ipcMain, pluginsDir, (url: string) =>
  loadInWebView(mainWindow, url)
);
loadExtensions(pluginsDir);
