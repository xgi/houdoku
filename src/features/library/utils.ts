import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { Chapter, Series } from 'houdoku-extension-lib';
import {
  setSeriesList,
  setSeries,
  setChapterList,
  setCompletedStartReload,
  setReloadingSeriesList,
} from './actions';
import {
  deleteAllDownloadedChapters,
  deleteThumbnail,
} from '../../util/filesystem';
import { downloadCover } from '../../util/download';
import { setStatusText } from '../statusbar/actions';
import { FS_METADATA } from '../../services/extensions/filesystem';
import ipcChannels from '../../constants/ipcChannels.json';
import library from '../../services/library';
import { getNumberUnreadChapters } from '../../util/comparison';

const updateSeriesNumberUnread = (series: Series) => {
  if (series.id !== undefined) {
    const chapters: Chapter[] = library.fetchChapters(series.id);
    library.upsertSeries({
      ...series,
      numberUnread: getNumberUnreadChapters(chapters),
    });
  }
};

export function loadSeriesList(dispatch: any) {
  const seriesList: Series[] = library.fetchSeriesList();
  dispatch(setSeriesList(seriesList));
}

export function loadSeries(dispatch: any, seriesId: string) {
  const series: Series | null = library.fetchSeries(seriesId);
  if (series !== null) {
    dispatch(setSeries(series));
  }
}

export function loadChapterList(dispatch: any, seriesId: string) {
  const chapters: Chapter[] = library.fetchChapters(seriesId);
  dispatch(setChapterList(chapters));
}

export function removeSeries(
  dispatch: any,
  series: Series,
  deleteDownloadedChapters = false
) {
  if (series.id === undefined) return;

  library.removeSeries(series.id);
  deleteThumbnail(series);
  if (deleteDownloadedChapters) {
    deleteAllDownloadedChapters(series);
  }
  loadSeriesList(dispatch);
}

export async function importSeries(dispatch: any, series: Series) {
  log.debug(
    `Importing series ${series.sourceId} from extension ${series.extensionId}`
  );
  dispatch(setStatusText(`Adding "${series.title}" to your library...`));

  const chapters: Chapter[] = await ipcRenderer.invoke(
    ipcChannels.EXTENSION.GET_CHAPTERS,
    series.extensionId,
    series.sourceType,
    series.sourceId
  );

  const addedSeries = library.upsertSeries(series);
  library.upsertChapters(chapters, addedSeries);
  updateSeriesNumberUnread(addedSeries);
  await loadSeriesList(dispatch);
  downloadCover(addedSeries);

  log.debug(`Imported series ${series.sourceId} with database ID ${series.id}`);
  dispatch(setStatusText(`Added "${addedSeries.title}" to your library.`));
}

export function toggleChapterRead(
  dispatch: any,
  chapter: Chapter,
  series: Series
) {
  log.debug(
    `Toggling chapter read status for series ${series.title} chapterNum ${chapter.chapterNumber}`
  );

  const newChapter: Chapter = { ...chapter, read: !chapter.read };

  if (series.id !== undefined) {
    library.upsertChapters([newChapter], series);
    updateSeriesNumberUnread(series);
    if (series.id !== undefined) {
      loadChapterList(dispatch, series.id);
      loadSeries(dispatch, series.id);
    }
  }
}

async function reloadSeries(series: Series): Promise<Error | void> {
  if (series.id === undefined)
    return new Promise((resolve) =>
      resolve(Error('Series does not have database ID'))
    );

  if (
    (await ipcRenderer.invoke(
      ipcChannels.EXTENSION_MANAGER.GET,
      series.extensionId
    )) === undefined
  ) {
    return new Promise((resolve) =>
      resolve(Error('Could not retrieve extension data'))
    );
  }

  let newSeries: Series | undefined = await ipcRenderer.invoke(
    ipcChannels.EXTENSION.GET_SERIES,
    series.extensionId,
    series.sourceType,
    series.sourceId
  );
  if (newSeries === undefined)
    return new Promise((resolve) =>
      resolve(Error('Could not get series from extension'))
    );

  const newChapters: Chapter[] = await ipcRenderer.invoke(
    ipcChannels.EXTENSION.GET_CHAPTERS,
    series.extensionId,
    series.sourceType,
    series.sourceId
  );

  if (series.extensionId === FS_METADATA.id) {
    newSeries = { ...series };
  } else {
    newSeries.id = series.id;
    newSeries.userTags = series.userTags;
  }

  const oldChapters: Chapter[] = library.fetchChapters(series.id);
  const orphanedChapterIds: string[] = oldChapters.map(
    (chapter: Chapter) => chapter.id || ''
  );

  const chapters: Chapter[] = newChapters.map((chapter: Chapter) => {
    const matchingChapter: Chapter | undefined = oldChapters.find(
      (c: Chapter) => c.sourceId === chapter.sourceId
    );
    if (matchingChapter !== undefined && matchingChapter.id !== undefined) {
      chapter.id = matchingChapter.id;
      chapter.read = matchingChapter.read;

      orphanedChapterIds.splice(
        orphanedChapterIds.indexOf(matchingChapter.id),
        1
      );
    }
    return chapter;
  });

  library.upsertSeries(newSeries);
  library.upsertChapters(chapters, newSeries);
  if (orphanedChapterIds.length > 0 && newSeries.id !== undefined) {
    library.removeChapters(orphanedChapterIds, newSeries.id);
  }

  updateSeriesNumberUnread(newSeries);

  if (newSeries.remoteCoverUrl !== series.remoteCoverUrl) {
    log.debug(`Updating cover for series ${newSeries.id}`);
    deleteThumbnail(series);
    downloadCover(newSeries);
  }

  return new Promise((resolve) => resolve());
}

export async function reloadSeriesList(
  dispatch: any,
  seriesList: Series[],
  callback?: () => void
) {
  log.debug(`Reloading series list...`);

  dispatch(setReloadingSeriesList(true));

  const sortedSeriesList = [...seriesList].sort((a: Series, b: Series) =>
    a.title.localeCompare(b.title)
  );
  let cur = 0;
  let errs = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const series of sortedSeriesList) {
    dispatch(
      setStatusText(
        `Reloading library (${cur}/${seriesList.length}) - ${series.title}`
      )
    );
    // eslint-disable-next-line no-await-in-loop
    const ret = await reloadSeries(series);
    if (ret instanceof Error) {
      log.error(ret);
      errs += 1;
    }
    cur += 1;
  }

  let statusMessage = '';
  if (cur === 1) {
    statusMessage =
      errs > 0
        ? `Error occurred while reloading series "${seriesList[0].title}"`
        : `Reloaded series "${seriesList[0].title}"`;
  } else {
    statusMessage =
      errs > 0
        ? `Reloaded ${cur} series with ${errs} errors`
        : `Reloaded ${cur} series`;
  }

  dispatch(setReloadingSeriesList(false));
  dispatch(setCompletedStartReload(true));
  dispatch(setStatusText(statusMessage));
  if (callback !== undefined) callback();
}

export function updateSeries(series: Series) {
  const newSeries = library.upsertSeries(series);
  return downloadCover(newSeries);
}

export function updateSeriesUserTags(series: Series, userTags: string[]) {
  library.upsertSeries({ ...series, userTags });
}

export function updateSeriesTrackerKeys(
  series: Series,
  trackerKeys: { [trackerId: string]: string } | undefined
) {
  library.upsertSeries({ ...series, trackerKeys });
}
