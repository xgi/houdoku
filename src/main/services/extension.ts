import {
  PageRequesterData,
  Chapter,
  Series,
  ExtensionClientInterface,
  SettingType,
  SeriesListResponse,
  FilterValues,
  FilterOption,
  TiyoClientInterface,
} from '@tiyo/common';
const aki = require('aki-plugin-manager');
import { BrowserWindow, IpcMain } from 'electron';
import { FS_METADATA } from '../../common/temp_fs_metadata';
import { FSExtensionClient } from './extensions/filesystem';
import ipcChannels from '../../common/constants/ipcChannels.json';

let TIYO_CLIENT: TiyoClientInterface | null = null;
let FILESYSTEM_EXTENSION: FSExtensionClient | null = null;

export async function loadPlugins(
  pluginsDir: string,
  extractDir: string,
  spoofWindow: BrowserWindow,
) {
  if (TIYO_CLIENT !== null) {
    TIYO_CLIENT = null;
  }
  if (FILESYSTEM_EXTENSION !== null) {
    FILESYSTEM_EXTENSION = null;
  }

  console.info('Checking for Tiyo plugin...');
  aki.list(pluginsDir).forEach((pluginDetails: [string, string]) => {
    const pluginName = pluginDetails[0];
    if (pluginName === '@tiyo/core') {
      const mod = aki.load(
        pluginsDir,
        pluginName,
        // eslint-disable-next-line no-eval
        eval('require') as NodeRequire,
      );

      TIYO_CLIENT = new mod.TiyoClient(spoofWindow);
      console.info(
        `Loaded Tiyo plugin v${TIYO_CLIENT!.getVersion()}; it has ${
          Object.keys(TIYO_CLIENT!.getExtensions()).length
        } extensions`,
      );
    } else {
      console.warn(`Ignoring unsupported plugin: ${pluginName}`);
    }
  });

  console.info('Initializing filesystem extension...');
  FILESYSTEM_EXTENSION = new FSExtensionClient(() => new Promise((_resolve, reject) => reject()));
  FILESYSTEM_EXTENSION.extractPath = extractDir;
}

function getExtensionClient(extensionId: string) {
  if (extensionId === FS_METADATA.id) return FILESYSTEM_EXTENSION as ExtensionClientInterface;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return TIYO_CLIENT!.getExtensions()[extensionId].client;
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
  const extension = getExtensionClient(extensionId);
  console.info(`Getting series ${seriesId} from extension ${extensionId}`);

  return extension.getSeries(seriesId).catch((err: Error) => {
    console.error(err);
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
  const extension = getExtensionClient(extensionId);
  console.info(`Getting chapters for series ${seriesId} from extension ${extensionId}`);

  return extension.getChapters(seriesId).catch((err: Error) => {
    console.error(err);
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
  chapterSourceId: string,
): Promise<PageRequesterData> {
  const extension = getExtensionClient(extensionId);
  console.info(
    `Getting page requester data for series ${seriesSourceId} chapter ${chapterSourceId} from extension ${extensionId}`,
  );

  return extension.getPageRequesterData(seriesSourceId, chapterSourceId).catch((err: Error) => {
    console.error(err);
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
    const extension = getExtensionClient(extensionId);
    const pageUrls = extension.getPageUrls(pageRequesterData);
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
  url: string,
): Promise<string | ArrayBuffer> {
  const extension = getExtensionClient(extensionId);
  return extension.getImage(series, url).catch((err: Error) => {
    console.error(err);
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
  filterValues: FilterValues,
): Promise<SeriesListResponse> {
  const extension = getExtensionClient(extensionId);
  console.info(`Searching for "${text}" page=${page} from extension ${extensionId}`);

  return extension.getSearch(text, page, filterValues).catch((err: Error) => {
    console.error(err);
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
  filterValues: FilterValues,
): Promise<SeriesListResponse> {
  const extension = getExtensionClient(extensionId);
  console.info(`Getting directory page=${page} from extension ${extensionId}`);

  return extension.getDirectory(page, filterValues).catch((err: Error) => {
    console.error(err);
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
  const extension = getExtensionClient(extensionId);
  console.info(`Getting setting types from extension ${extensionId}`);

  try {
    return extension.getSettingTypes();
  } catch (err) {
    console.error(err);
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
  const extension = getExtensionClient(extensionId);
  console.info(`Getting settings from extension ${extensionId}`);

  try {
    return extension.getSettings();
  } catch (err) {
    console.error(err);
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
  const extension = getExtensionClient(extensionId);
  console.info(`Setting settings from extension ${extensionId}`);

  try {
    extension.setSettings(settings);
  } catch (err) {
    console.error(err);
  }
}

/**
 * Get an extension's filter options.
 *
 * @returns List[FilterOption]
 */
function getFilterOptions(extensionId: string): FilterOption[] {
  const extension = getExtensionClient(extensionId);
  console.info(`Getting filter options from extension ${extensionId}`);

  try {
    return extension.getFilterOptions();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export const createExtensionIpcHandlers = (
  ipcMain: IpcMain,
  pluginsDir: string,
  extractDir: string,
  spoofWindow: BrowserWindow,
) => {
  console.debug('Creating extension IPC handlers in main...');

  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.RELOAD, async (event) => {
    await loadPlugins(pluginsDir, extractDir, spoofWindow);
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
    if (extensionId === FS_METADATA.id) {
      return FS_METADATA;
    }
    if (TIYO_CLIENT && Object.keys(TIYO_CLIENT.getExtensions()).includes(extensionId)) {
      return TIYO_CLIENT.getExtensions()[extensionId].metadata;
    }
    return undefined;
  });
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.GET_ALL, () => {
    const result = [FS_METADATA];
    if (TIYO_CLIENT) {
      result.push(...Object.values(TIYO_CLIENT.getExtensions()).map((e) => e.metadata));
    }
    return result;
  });
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.GET_TIYO_VERSION, () => {
    return TIYO_CLIENT ? TIYO_CLIENT.getVersion() : undefined;
  });
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.CHECK_FOR_UPDATES, async () => {
    // TODO: check registry
    return {};
  });

  ipcMain.handle(
    ipcChannels.EXTENSION.GET_SERIES,
    (_event, extensionId: string, seriesId: string) => {
      return getSeries(extensionId, seriesId);
    },
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_CHAPTERS,
    (_event, extensionId: string, seriesId: string) => {
      return getChapters(extensionId, seriesId);
    },
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_PAGE_REQUESTER_DATA,
    (_event, extensionId: string, seriesSourceId: string, chapterSourceId: string) => {
      return getPageRequesterData(extensionId, seriesSourceId, chapterSourceId);
    },
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_PAGE_URLS,
    (_event, extensionId: string, pageRequesterData: PageRequesterData) => {
      return getPageUrls(extensionId, pageRequesterData);
    },
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_IMAGE,
    (_event, extensionId: string, series: Series, url: string) => {
      return getImage(extensionId, series, url);
    },
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.SEARCH,
    (_event, extensionId: string, text: string, page: number, filterValues: FilterValues) => {
      return search(extensionId, text, page, filterValues);
    },
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.DIRECTORY,
    (_event, extensionId: string, page: number, filterValues: FilterValues) => {
      return directory(extensionId, page, filterValues);
    },
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
    },
  );
  ipcMain.handle(ipcChannels.EXTENSION.GET_FILTER_OPTIONS, (_event, extensionId: string) => {
    return getFilterOptions(extensionId);
  });
};
