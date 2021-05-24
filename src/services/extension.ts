import { ExtensionMetadata, PageRequesterData } from 'houdoku-extension-lib';
import aki from 'aki-plugin-manager';
import { IpcMain } from 'electron';
import fetch from 'node-fetch';
import DOMParser from 'dom-parser';
import log from 'electron-log';
import { Chapter, Series, SeriesSourceType } from '../models/types';
import filesystem from './extensions/filesystem';
import ipcChannels from '../constants/ipcChannels.json';

const domParser = new DOMParser();

const EXTENSIONS = {
  [filesystem.METADATA.id]: filesystem,
};

export async function loadExtensions(pluginsDir: string) {
  log.info('Loading extensions...');

  Object.keys(EXTENSIONS).forEach((extensionId: string) => {
    if (extensionId !== filesystem.METADATA.id) {
      const extMetadata = EXTENSIONS[extensionId].METADATA;
      aki.unload(
        pluginsDir,
        `@houdoku/extension-${extMetadata.name.toLowerCase()}`
      );
      delete EXTENSIONS[extensionId];
      log.info(`Unloaded extension ${extMetadata.name} (ID ${extensionId})`);
    }
  });

  aki.list(pluginsDir).forEach((pluginDetails: [string, string]) => {
    const pluginName = pluginDetails[0];
    if (pluginName.startsWith('@houdoku/extension-')) {
      const mod = aki.load(
        pluginsDir,
        pluginName,
        // eslint-disable-next-line no-eval
        eval('require') as NodeRequire
      );

      log.info(`Loaded extension "${pluginName}" version ${pluginDetails[1]}`);
      EXTENSIONS[mod.METADATA.id] = mod;
    }
  });
}

/**
 * Get the metadata for an extension
 * @param extensionId
 * @returns the ExtensionMetadata defined for the extension
 */
function getExtensionMetadata(extensionId: string): ExtensionMetadata {
  return EXTENSIONS[extensionId].METADATA;
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
  seriesId: string,
  webviewFunc: (url: string) => Promise<string>
): Promise<Series | undefined> {
  const extension = EXTENSIONS[extensionId];
  log.info(extensionId);
  log.info(
    `Getting series ${seriesId} from extension ${extensionId} (v=${extension.METADATA.version})`
  );

  return extension.getSeries(
    sourceType,
    seriesId,
    fetch,
    webviewFunc,
    domParser
  );
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
  seriesId: string,
  webviewFunc: (url: string) => Promise<string>
): Promise<Chapter[]> {
  const extension = EXTENSIONS[extensionId];
  log.info(
    `Getting chapters for series ${seriesId} from extension ${extensionId} (v=${extension.METADATA.version})`
  );

  return extension.getChapters(
    sourceType,
    seriesId,
    fetch,
    webviewFunc,
    domParser
  );
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
  chapterSourceId: string,
  webviewFunc: (url: string) => Promise<string>
): Promise<PageRequesterData> {
  const extension = EXTENSIONS[extensionId];
  log.info(
    `Getting page requester data for series ${seriesSourceId} chapter ${chapterSourceId} from extension ${extensionId} (v=${extension.METADATA.version})`
  );

  return extension.getPageRequesterData(
    sourceType,
    seriesSourceId,
    chapterSourceId,
    fetch,
    webviewFunc,
    domParser
  );
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
  return EXTENSIONS[extensionId].getPageUrls(pageRequesterData);
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
  return EXTENSIONS[extensionId].getPageData(series, url);
}

/**
 * Search for a series.
 *
 * @param extensionId
 * @param text the user's search input; this can contain parameters in the form "key:value" which
 * are utilized at the extension's discretion
 * @returns promise for a list of series found from the content source
 */
function search(
  extensionId: string,
  text: string,
  webviewFunc: (url: string) => Promise<string>
): Promise<Series[]> {
  const extension = EXTENSIONS[extensionId];
  log.info(
    `Searching for "${text}" from extension ${extensionId} (v=${extension.METADATA.version})`
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

  return extension.getSearch(
    adjustedText,
    params,
    fetch,
    webviewFunc,
    domParser
  );
}

/**
 * Get the directory for a content source (often the same as an empty search).
 *
 * @param extensionId
 * @returns promise for a list of series found from the content source
 */
function directory(
  extensionId: string,
  webviewFunc: (url: string) => Promise<string>
): Promise<Series[]> {
  const extension = EXTENSIONS[extensionId];
  log.info(
    `Getting directory from extension ${extensionId} (v=${extension.METADATA.version})`
  );

  return extension.getDirectory(fetch, webviewFunc, domParser);
}

export const createExtensionIpcHandlers = (
  ipcMain: IpcMain,
  pluginsDir: string,
  webviewFunc: (url: string) => Promise<string>
) => {
  log.debug('Creating extension IPC handlers in main...');

  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.RELOAD, (event) => {
    return loadExtensions(pluginsDir);
  });
  ipcMain.handle(
    ipcChannels.EXTENSION_MANAGER.INSTALL,
    (event, name: string, version: string) => {
      return new Promise<void>((resolve, reject) => {
        aki.install(name, version, pluginsDir, () => {
          resolve();
        });
      });
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION_MANAGER.UNINSTALL,
    (event, name: string) => {
      return new Promise<void>((resolve, reject) => {
        aki.uninstall(name, pluginsDir, () => {
          resolve();
        });
      });
    }
  );
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.LIST, async (event) => {
    return aki.list(pluginsDir);
  });
  ipcMain.handle(
    ipcChannels.EXTENSION_MANAGER.GET,
    async (event, extensionId: string) => {
      return extensionId in EXTENSIONS
        ? EXTENSIONS[extensionId].METADATA
        : undefined;
    }
  );
  ipcMain.handle(ipcChannels.EXTENSION_MANAGER.GET_ALL, (event) => {
    return Object.values(EXTENSIONS).map((ext: any) => ext.METADATA);
  });

  ipcMain.handle(
    ipcChannels.EXTENSION.GET_SERIES,
    (
      event,
      extensionId: string,
      sourceType: SeriesSourceType,
      seriesId: string
    ) => {
      return getSeries(extensionId, sourceType, seriesId, webviewFunc);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_CHAPTERS,
    (
      event,
      extensionId: string,
      sourceType: SeriesSourceType,
      seriesId: string
    ) => {
      return getChapters(extensionId, sourceType, seriesId, webviewFunc);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_PAGE_REQUESTER_DATA,
    (
      event,
      extensionId: string,
      sourceType: SeriesSourceType,
      seriesSourceId: string,
      chapterSourceId: string
    ) => {
      return getPageRequesterData(
        extensionId,
        sourceType,
        seriesSourceId,
        chapterSourceId,
        webviewFunc
      );
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_PAGE_URLS,
    (event, extensionId: string, pageRequesterData: PageRequesterData) => {
      return getPageUrls(extensionId, pageRequesterData);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.GET_PAGE_DATA,
    (event, extensionId: string, series: Series, url: string) => {
      return getPageData(extensionId, series, url);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.SEARCH,
    (event, extensionId: string, text: string) => {
      return search(extensionId, text, webviewFunc);
    }
  );
  ipcMain.handle(
    ipcChannels.EXTENSION.DIRECTORY,
    (event, extensionId: string) => {
      return directory(extensionId, webviewFunc);
    }
  );
};
