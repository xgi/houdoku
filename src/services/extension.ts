import {
  PageRequesterData,
  Chapter,
  Series,
  SeriesSourceType,
  WebviewFunc,
  ExtensionClientInterface,
  SettingType,
} from 'houdoku-extension-lib';
import aki from 'aki-plugin-manager';
import { IpcMain } from 'electron';
import fetch from 'node-fetch';
import DOMParser from 'dom-parser';
import log from 'electron-log';
import { FSExtensionClient, FS_METADATA } from './extensions/filesystem';
import ipcChannels from '../constants/ipcChannels.json';

const domParser = new DOMParser();

const EXTENSION_CLIENTS: { [key: string]: ExtensionClientInterface } = {};

export async function loadExtensions(
  pluginsDir: string,
  webviewFn: WebviewFunc
) {
  log.info('Loading extensions...');

  Object.keys(EXTENSION_CLIENTS).forEach((extensionId: string) => {
    const extMetadata = EXTENSION_CLIENTS[extensionId].getMetadata();
    if (extMetadata.id !== FS_METADATA.id) {
      aki.unload(
        pluginsDir,
        `@houdoku/extension-${extMetadata.name
          .toLowerCase()
          .replaceAll(' ', '')}`,
        // eslint-disable-next-line no-eval
        eval('require') as NodeRequire
      );
    }
    delete EXTENSION_CLIENTS[extensionId];
    log.info(`Unloaded extension ${extMetadata.name} (ID ${extensionId})`);
  });

  const fsExtensionClient = new FSExtensionClient(fetch, webviewFn, domParser);
  EXTENSION_CLIENTS[fsExtensionClient.getMetadata().id] = fsExtensionClient;

  aki.list(pluginsDir).forEach((pluginDetails: [string, string]) => {
    const pluginName = pluginDetails[0];
    if (pluginName.startsWith('@houdoku/extension-')) {
      const mod = aki.load(
        pluginsDir,
        pluginName,
        // eslint-disable-next-line no-eval
        eval('require') as NodeRequire
      );
      const client = new mod.ExtensionClient(fetch, webviewFn, domParser);

      log.info(`Loaded extension "${pluginName}" version ${pluginDetails[1]}`);
      EXTENSION_CLIENTS[client.getMetadata().id] = client;
    }
  });
}

/**
 * Get a series from an extension.
 *
 * The series is populated with fields provided by the content source, and is sufficient to be
 * imported into the user's library. Note that the id field will be undefined since that refers
 * to the id for the series after being imported.
 *
 * @param extensionId
 * @param sourceType the type of the series source
 * @param seriesId
 * @returns promise for the matching series
 */
function getSeries(
  extensionId: string,
  sourceType: SeriesSourceType,
  seriesId: string
): Promise<Series | undefined> {
  const extension = EXTENSION_CLIENTS[extensionId];
  log.info(
    `Getting series ${seriesId} from extension ${extensionId} (v=${
      extension.getMetadata().version
    })`
  );

  return extension.getSeries(sourceType, seriesId).catch((err: Error) => {
    log.error(err);
    return undefined;
  });
}

/**
 * Get a list of chapters for a series on the content source.
 *
 * Chapters are populated with fields provided by the content source. Note that there may be
 * multiple instances of the "same" chapter which are actually separate releases (either by
 * different groups or in different languages).
 *
 * @param extensionId
 * @param sourceType the type of the series source
 * @param seriesId
 * @returns promise for a list of chapters
 */
function getChapters(
  extensionId: string,
  sourceType: SeriesSourceType,
  seriesId: string
): Promise<Chapter[]> {
  const extension = EXTENSION_CLIENTS[extensionId];
  log.info(
    `Getting chapters for series ${seriesId} from extension ${extensionId} (v=${
      extension.getMetadata().version
    })`
  );

  return extension.getChapters(sourceType, seriesId).catch((err: Error) => {
    log.error(err);
    return [];
  });
}

/**
 * Get a PageRequesterData object with values for getting individual page URLs.
 *
 * The PageRequesterData is solely used to be provided to getPageUrls, and should be considered
 * unique for each chapter (it will only work for the chapter with id specified to this function).
 *
 * @param extensionId
 * @param sourceType the type of the series source
 * @param seriesSourceId
 * @param chapterSourceId
 * @returns promise for the PageRequesterData for this chapter
 */
function getPageRequesterData(
  extensionId: string,
  sourceType: SeriesSourceType,
  seriesSourceId: string,
  chapterSourceId: string
): Promise<PageRequesterData> {
  const extension = EXTENSION_CLIENTS[extensionId];
  log.info(
    `Getting page requester data for series ${seriesSourceId} chapter ${chapterSourceId} from extension ${extensionId} (v=${
      extension.getMetadata().version
    })`
  );

  return extension
    .getPageRequesterData(sourceType, seriesSourceId, chapterSourceId)
    .catch((err: Error) => {
      log.error(err);
      return { server: '', hash: '', numPages: 0, pageFilenames: [] };
    });
}

/**
 * Get page URLs for a chapter.
 *
 * The values from this function CANNOT be safely used as an image source; they must be passed to
 * getPageData which is strictly for that purpose.
 *
 * @param extensionId
 * @param pageRequesterData the PageRequesterData from getPageRequesterData for this chapter
 * @returns a list of urls for this chapter which can be passed to getPageData
 */
function getPageUrls(
  extensionId: string,
  pageRequesterData: PageRequesterData
): string[] {
  try {
    const pageUrls =
      EXTENSION_CLIENTS[extensionId].getPageUrls(pageRequesterData);
    return pageUrls;
  } catch (err) {
    return [];
  }
}

/**
 * Get data for a page.
 *
 * The value from this function (within the promise) can be put inside the src tag of an HTML <img>.
 * In most cases it is simply a promise for the provided URL; however, that cannot be guaranteed
 * since we may also need to load data from an archive.
 *
 * @param extensionId
 * @param series
 * @param url the URL for the page from getPageUrls
 * @returns promise for page data that can be put inside an <img> src
 */
async function getPageData(
  extensionId: string,
  series: Series,
  url: string
): Promise<string> {
  return EXTENSION_CLIENTS[extensionId]
    .getPageData(series, url)
    .catch((err: Error) => {
      log.error(err);
      return '';
    });
}

/**
 * Search for a series.
 *
 * @param extensionId
 * @param text the user's search input; this can contain parameters in the form "key:value" which
 * are utilized at the extension's discretion
 * @returns promise for a list of series found from the content source
 */
function search(extensionId: string, text: string): Promise<Series[]> {
  const extension = EXTENSION_CLIENTS[extensionId];
  log.info(
    `Searching for "${text}" from extension ${extensionId} (v=${
      extension.getMetadata().version
    })`
  );

  let adjustedText: string = text;

  const paramsRegExp = new RegExp(/\S*:\S*/g);
  const matchParams: RegExpMatchArray | null = text.match(paramsRegExp);

  let params: { [key: string]: string } = {};
  if (matchParams !== null) {
    matchParams.forEach((match: string) => {
      const parts: string[] = match.split(':');
      params = { [parts[0]]: parts[1], ...params };
    });

    adjustedText = text.replace(paramsRegExp, '');
  }

  return extension.getSearch(adjustedText, params).catch((err: Error) => {
    log.error(err);
    return [];
  });
}

/**
 * Get the directory for a content source (often the same as an empty search).
 *
 * @param extensionId
 * @returns promise for a list of series found from the content source
 */
function directory(extensionId: string): Promise<Series[]> {
  const extension = EXTENSION_CLIENTS[extensionId];
  log.info(
    `Getting directory from extension ${extensionId} (v=${
      extension.getMetadata().version
    })`
  );

  return extension.getDirectory().catch((err: Error) => {
    log.error(err);
    return [];
  });
}

/**
 * Get types for an extension's settings.
 *
 * @param extensionId
 * @returns map of settings from the extension to their SettingType
 */
function getSettingTypes(extensionId: string): { [key: string]: SettingType } {
  const extension = EXTENSION_CLIENTS[extensionId];
  log.info(
    `Getting setting types from extension ${extensionId} (v=${
      extension.getMetadata().version
    })`
  );

  try {
    return extension.getSettingTypes();
  } catch (err) {
    log.error(err);
    return {};
  }
}

/**
 * Get settings for the extension.
 *
 * @param extensionId
 * @returns map of settings from the extension, with default/initial values set
 */
function getSettings(extensionId: string): { [key: string]: unknown } {
  const extension = EXTENSION_CLIENTS[extensionId];
  log.info(
    `Getting settings from extension ${extensionId} (v=${
      extension.getMetadata().version
    })`
  );

  try {
    return extension.getSettings();
  } catch (err) {
    log.error(err);
    return {};
  }
}

/**
 * Set the settings for an extension.
 *
 * @param extensionId
 * @param settings a map of settings for the extension
 */
function setSettings(
  extensionId: string,
  settings: { [key: string]: unknown }
): void {
  const extension = EXTENSION_CLIENTS[extensionId];
  log.info(
    `Setting settings from extension ${extensionId} (v=${
      extension.getMetadata().version
    })`
  );

  try {
    extension.setSettings(settings);
  } catch (err) {
    log.error(err);
  }
}

export const createExtensionIpcHandlers = (
  ipcMain: IpcMain,
  pluginsDir: string,
  webviewFn: (url: string) => Promise<string>
) => {
  log.debug('Creating extension IPC handlers in main...');

  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.RELOAD, async (event) => {
    await loadExtensions(pluginsDir, webviewFn);
    return event.sender.send(ipcChannels.APP.LOAD_STORED_EXTENSION_SETTINGS);
  });
  ipcMain.handle(
    ipcChannels.EXTENSION_MANAGER.INSTALL,
    (_event, name: string, version: string) => {
      return new Promise<void>((resolve) => {
        aki.install(name, version, pluginsDir, () => {
          resolve();
        });
      });
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION_MANAGER.UNINSTALL,
    (_event, name: string) => {
      return new Promise<void>((resolve) => {
        aki.uninstall(name, pluginsDir, () => {
          resolve();
        });
      });
    }
  );
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.LIST, async () => {
    return aki.list(pluginsDir);
  });
  ipcMain.handle(
    ipcChannels.EXTENSION_MANAGER.GET,
    async (_event, extensionId: string) => {
      return extensionId in EXTENSION_CLIENTS
        ? EXTENSION_CLIENTS[extensionId].getMetadata()
        : undefined;
    }
  );
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.GET_ALL, () => {
    return Object.values(EXTENSION_CLIENTS).map(
      (client: ExtensionClientInterface) => client.getMetadata()
    );
  });

  ipcMain.handle(
    ipcChannels.EXTENSION.GET_SERIES,
    (
      _event,
      extensionId: string,
      sourceType: SeriesSourceType,
      seriesId: string
    ) => {
      return getSeries(extensionId, sourceType, seriesId);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_CHAPTERS,
    (
      _event,
      extensionId: string,
      sourceType: SeriesSourceType,
      seriesId: string
    ) => {
      return getChapters(extensionId, sourceType, seriesId);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_PAGE_REQUESTER_DATA,
    (
      _event,
      extensionId: string,
      sourceType: SeriesSourceType,
      seriesSourceId: string,
      chapterSourceId: string
    ) => {
      return getPageRequesterData(
        extensionId,
        sourceType,
        seriesSourceId,
        chapterSourceId
      );
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_PAGE_URLS,
    (_event, extensionId: string, pageRequesterData: PageRequesterData) => {
      return getPageUrls(extensionId, pageRequesterData);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_PAGE_DATA,
    (_event, extensionId: string, series: Series, url: string) => {
      return getPageData(extensionId, series, url);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.SEARCH,
    (_event, extensionId: string, text: string) => {
      return search(extensionId, text);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.DIRECTORY,
    (_event, extensionId: string) => {
      return directory(extensionId);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_SETTING_TYPES,
    (_event, extensionId: string) => {
      return getSettingTypes(extensionId);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_SETTINGS,
    (_event, extensionId: string) => {
      return getSettings(extensionId);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.SET_SETTINGS,
    (_event, extensionId: string, settings: { [key: string]: unknown }) => {
      return setSettings(extensionId, settings);
    }
  );
};
