import {
  PageRequesterData,
  Chapter,
  Series,
  WebviewFunc,
  ExtensionClientInterface,
  SettingType,
  ExtensionMetadata,
  SeriesListResponse,
  FilterValues,
  FilterOption,
} from 'houdoku-extension-lib';
import aki, { RegistrySearchPackage, RegistrySearchResults } from 'aki-plugin-manager';
import { IpcMain } from 'electron';
import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';
import log from 'electron-log';
import { gt } from 'semver';
import { JSDOM } from 'jsdom';
import { UtilFunctions } from 'houdoku-extension-lib/dist/interface';
import { FSExtensionClient, FS_METADATA } from './extensions/filesystem';
import ipcChannels from '../constants/ipcChannels.json';

const EXTENSION_CLIENTS: { [key: string]: ExtensionClientInterface } = {};

export async function loadExtensions(
  pluginsDir: string,
  extractDir: string,
  webviewFn: WebviewFunc
) {
  log.info('Loading extensions...');

  Object.keys(EXTENSION_CLIENTS).forEach((extensionId: string) => {
    const extMetadata = EXTENSION_CLIENTS[extensionId].getMetadata();
    if (extMetadata.id !== FS_METADATA.id) {
      aki.unload(
        pluginsDir,
        `@houdoku/extension-${extMetadata.name.toLowerCase().replaceAll(' ', '')}`,
        // eslint-disable-next-line no-eval
        eval('require') as NodeRequire
      );
    }
    delete EXTENSION_CLIENTS[extensionId];
    log.info(`Unloaded extension ${extMetadata.name} (ID ${extensionId})`);
  });

  const docFn = (html?: string | Buffer) => new JSDOM(html).window.document;
  const fsExtensionClient = new FSExtensionClient(new UtilFunctions(fetch, webviewFn, docFn));
  fsExtensionClient.setExtractPath(extractDir);
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

      const fetchWrappedFn = (
        url: RequestInfo,
        init?: RequestInit | undefined
      ): Promise<Response> => {
        try {
          return fetch(url, init);
        } catch (e) {
          log.error(`Non-promise error when calling fetch`, e, url, init);
          return new Promise(() => {
            throw Error('fetch threw a non-promise error');
          });
        }
      };

      const client = new mod.ExtensionClient(new UtilFunctions(fetchWrappedFn, webviewFn, docFn));

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
 * @param seriesId
 * @returns promise for the matching series
 */
function getSeries(extensionId: string, seriesId: string): Promise<Series | undefined> {
  const extension = EXTENSION_CLIENTS[extensionId];
  log.info(
    `Getting series ${seriesId} from extension ${extensionId} (v=${
      extension.getMetadata().version
    })`
  );

  return extension.getSeries(seriesId).catch((err: Error) => {
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
 * @param seriesId
 * @returns promise for a list of chapters
 */
function getChapters(extensionId: string, seriesId: string): Promise<Chapter[]> {
  const extension = EXTENSION_CLIENTS[extensionId];
  log.info(
    `Getting chapters for series ${seriesId} from extension ${extensionId} (v=${
      extension.getMetadata().version
    })`
  );

  return extension.getChapters(seriesId).catch((err: Error) => {
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
 * @param seriesSourceId
 * @param chapterSourceId
 * @returns promise for the PageRequesterData for this chapter
 */
function getPageRequesterData(
  extensionId: string,
  seriesSourceId: string,
  chapterSourceId: string
): Promise<PageRequesterData> {
  const extension = EXTENSION_CLIENTS[extensionId];
  log.info(
    `Getting page requester data for series ${seriesSourceId} chapter ${chapterSourceId} from extension ${extensionId} (v=${
      extension.getMetadata().version
    })`
  );

  return extension.getPageRequesterData(seriesSourceId, chapterSourceId).catch((err: Error) => {
    log.error(err);
    return { server: '', hash: '', numPages: 0, pageFilenames: [] };
  });
}

/**
 * Get page URLs for a chapter.
 *
 * The values from this function CANNOT be safely used as an image source; they must be passed to
 * getImage which is strictly for that purpose.
 *
 * @param extensionId
 * @param pageRequesterData the PageRequesterData from getPageRequesterData for this chapter
 * @returns a list of urls for this chapter which can be passed to getImage
 */
function getPageUrls(extensionId: string, pageRequesterData: PageRequesterData): string[] {
  try {
    const pageUrls = EXTENSION_CLIENTS[extensionId].getPageUrls(pageRequesterData);
    return pageUrls;
  } catch (err) {
    return [];
  }
}

/**
 * Get resolved data for an image.
 *
 * The return value should either be a string to put inside the src tag of an HTML <img> (usually
 * the URL itself), or an ArrayBuffer that can be made into a Blob.
 *
 * @param series the series the image belongs to
 * @param url the url for this page, e.g. from GetPageUrlsFunc or Series.remoteCoverUrl
 * @returns promise for the data as described above
 */
async function getImage(
  extensionId: string,
  series: Series,
  url: string
): Promise<string | ArrayBuffer> {
  return EXTENSION_CLIENTS[extensionId].getImage(series, url).catch((err: Error) => {
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
 * @returns promise for SeriesListResponse
 */
function search(
  extensionId: string,
  text: string,
  page: number,
  filterValues: FilterValues
): Promise<SeriesListResponse> {
  const extension = EXTENSION_CLIENTS[extensionId];
  log.info(
    `Searching for "${text}" page=${page} from extension ${extensionId} (v=${
      extension.getMetadata().version
    })`
  );

  return extension.getSearch(text, page, filterValues).catch((err: Error) => {
    log.error(err);
    return { seriesList: [], hasMore: false };
  });
}

/**
 * Get the directory for a content source (often the same as an empty search).
 *
 * @param extensionId
 * @returns promise for SeriesListResponse
 */
function directory(
  extensionId: string,
  page: number,
  filterValues: FilterValues
): Promise<SeriesListResponse> {
  const extension = EXTENSION_CLIENTS[extensionId];
  log.info(
    `Getting directory page=${page} from extension ${extensionId} (v=${
      extension.getMetadata().version
    })`
  );

  return extension.getDirectory(page, filterValues).catch((err: Error) => {
    log.error(err);
    return { seriesList: [], hasMore: false };
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
    `Getting setting types from extension ${extensionId} (v=${extension.getMetadata().version})`
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
  log.info(`Getting settings from extension ${extensionId} (v=${extension.getMetadata().version})`);

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
function setSettings(extensionId: string, settings: { [key: string]: unknown }): void {
  const extension = EXTENSION_CLIENTS[extensionId];
  log.info(`Setting settings from extension ${extensionId} (v=${extension.getMetadata().version})`);

  try {
    extension.setSettings(settings);
  } catch (err) {
    log.error(err);
  }
}

/**
 * Get an extension's filter options.
 *
 * @returns List[FilterOption]
 */
function getFilterOptions(extensionId: string): FilterOption[] {
  const extension = EXTENSION_CLIENTS[extensionId];
  // log.info(
  //   `Getting filter options from extension ${extensionId} (v=${extension.getMetadata().version})`
  // );

  try {
    return extension.getFilterOptions();
  } catch (err) {
    log.error(err);
    return [];
  }
}

export const createExtensionIpcHandlers = (
  ipcMain: IpcMain,
  pluginsDir: string,
  extractDir: string,
  webviewFn: WebviewFunc
) => {
  log.debug('Creating extension IPC handlers in main...');

  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.RELOAD, async (event) => {
    await loadExtensions(pluginsDir, extractDir, webviewFn);
    return event.sender.send(ipcChannels.APP.LOAD_STORED_EXTENSION_SETTINGS);
  });
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.INSTALL, (_event, name: string, version: string) => {
    return new Promise<void>((resolve) => {
      aki.install(name, version, pluginsDir, () => {
        resolve();
      });
    });
  });
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.UNINSTALL, (_event, name: string) => {
    return new Promise<void>((resolve) => {
      aki.uninstall(name, pluginsDir, () => {
        resolve();
      });
    });
  });
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.LIST, async () => {
    return aki.list(pluginsDir);
  });
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.GET, async (_event, extensionId: string) => {
    return extensionId in EXTENSION_CLIENTS
      ? EXTENSION_CLIENTS[extensionId].getMetadata()
      : undefined;
  });
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.GET_ALL, () => {
    return Object.values(EXTENSION_CLIENTS).map((client: ExtensionClientInterface) =>
      client.getMetadata()
    );
  });
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.CHECK_FOR_UPDATESS, async () => {
    if (Object.values(EXTENSION_CLIENTS).length <= 1) return {};
    log.debug('Checking for extension updates...');

    const availableUpdates: {
      [key: string]: { metadata: ExtensionMetadata; newVersion: string };
    } = {};
    const registryResults: RegistrySearchResults = await aki.search('extension', 'houdoku', 100);
    registryResults.objects.forEach((registryResult) => {
      const pkg: RegistrySearchPackage = registryResult.package;
      const description = JSON.parse(pkg.description);

      if (description.id in EXTENSION_CLIENTS) {
        const metadata = EXTENSION_CLIENTS[description.id].getMetadata();
        if (gt(pkg.version, metadata.version)) {
          availableUpdates[metadata.id] = {
            metadata,
            newVersion: pkg.version,
          };
        }
      }
    });

    log.debug(`Found ${Object.values(availableUpdates).length} available extension updates`);
    return availableUpdates;
  });

  ipcMain.handle(
    ipcChannels.EXTENSION.GET_SERIES,
    (_event, extensionId: string, seriesId: string) => {
      return getSeries(extensionId, seriesId);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_CHAPTERS,
    (_event, extensionId: string, seriesId: string) => {
      return getChapters(extensionId, seriesId);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_PAGE_REQUESTER_DATA,
    (_event, extensionId: string, seriesSourceId: string, chapterSourceId: string) => {
      return getPageRequesterData(extensionId, seriesSourceId, chapterSourceId);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_PAGE_URLS,
    (_event, extensionId: string, pageRequesterData: PageRequesterData) => {
      return getPageUrls(extensionId, pageRequesterData);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_IMAGE,
    (_event, extensionId: string, series: Series, url: string) => {
      return getImage(extensionId, series, url);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.SEARCH,
    (_event, extensionId: string, text: string, page: number, filterValues: FilterValues) => {
      return search(extensionId, text, page, filterValues);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.DIRECTORY,
    (_event, extensionId: string, page: number, filterValues: FilterValues) => {
      return directory(extensionId, page, filterValues);
    }
  );
  ipcMain.handle(ipcChannels.EXTENSION.GET_SETTING_TYPES, (_event, extensionId: string) => {
    return getSettingTypes(extensionId);
  });
  ipcMain.handle(ipcChannels.EXTENSION.GET_SETTINGS, (_event, extensionId: string) => {
    return getSettings(extensionId);
  });
  ipcMain.handle(
    ipcChannels.EXTENSION.SET_SETTINGS,
    (_event, extensionId: string, settings: { [key: string]: unknown }) => {
      return setSettings(extensionId, settings);
    }
  );
  ipcMain.handle(ipcChannels.EXTENSION.GET_FILTER_OPTIONS, (_event, extensionId: string) => {
    return getFilterOptions(extensionId);
  });
};
