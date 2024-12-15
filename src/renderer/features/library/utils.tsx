const fs = require('fs');
const { ipcRenderer } = require('electron');
import { Chapter, LanguageKey, Series } from '@tiyo/common';
import { toast } from '@/ui/hooks/use-toast';
import { downloadCover } from '@/renderer/util/download';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import ipcChannels from '@/common/constants/ipcChannels.json';
import library from '@/renderer/services/library';
import { getNumberUnreadChapters } from '@/renderer/util/comparison';
import routes from '@/common/constants/routes.json';

const updateSeriesNumberUnread = (series: Series, chapterLanguages: LanguageKey[]) => {
  if (series.id !== undefined) {
    const chapters: Chapter[] = library.fetchChapters(series.id);
    library.upsertSeries({
      ...series,
      numberUnread: getNumberUnreadChapters(
        chapters.filter(
          (chapter) =>
            chapterLanguages.includes(chapter.languageKey) || chapterLanguages.length === 0,
        ),
      ),
    });
  }
};

export function loadSeries(seriesId: string, setSeries: (series: Series) => void) {
  const series: Series | null = library.fetchSeries(seriesId);
  if (series !== null) {
    setSeries(series);
  }
}

export function loadChapterList(
  seriesId: string,
  setChapterList: (chapterList: Chapter[]) => void,
) {
  const chapters: Chapter[] = library.fetchChapters(seriesId);
  setChapterList(chapters);
}

export function removeSeries(series: Series, setSeriesList: (seriesList: Series[]) => void) {
  if (series.id === undefined) return;

  library.removeSeries(series.id);
  ipcRenderer.invoke(ipcChannels.FILESYSTEM.DELETE_THUMBNAIL, series);
  setSeriesList(library.fetchSeriesList());
}

export async function importSeries(
  series: Series,
  chapterLanguages: LanguageKey[],
  getFirst = false,
): Promise<Series> {
  console.debug(`Importing series ${series.sourceId} from extension ${series.extensionId}`);

  let update: ReturnType<typeof toast>['update'] = () => false;
  if (!series.preview) {
    const toastResp = toast({
      title: 'Adding series to your library...',
      description: `Adding ${series.title}`,
      duration: 900000,
    });
    update = toastResp.update;
  }

  let seriesToAdd = series;
  let chapters: Chapter[] = [];
  try {
    if (getFirst) {
      seriesToAdd = await ipcRenderer.invoke(
        ipcChannels.EXTENSION.GET_SERIES,
        series.extensionId,
        series.sourceId,
      );
    }
    chapters = await ipcRenderer.invoke(
      ipcChannels.EXTENSION.GET_CHAPTERS,
      seriesToAdd.extensionId,
      seriesToAdd.sourceId,
    );
  } catch (error) {
    update({
      title: 'Failed to add series',
      description: 'An error occurred while adding the series to your library.',
    });

    throw error;
  }

  const addedSeries = library.upsertSeries({
    ...seriesToAdd,
    id: series.id,
  });
  library.upsertChapters(chapters, addedSeries);
  updateSeriesNumberUnread(addedSeries, chapterLanguages);

  console.debug(`Imported series ${addedSeries.sourceId} with database ID ${addedSeries.id}`);
  if (!series.preview) {
    update({ title: 'Added series', description: `Added ${addedSeries.title}`, duration: 5000 });
  }
  return addedSeries;
}

export function markChapters(
  chapters: Chapter[],
  series: Series,
  read: boolean,
  setChapterList: (chapterList: Chapter[]) => void,
  setSeries: (series: Series) => void,
  chapterLanguages: LanguageKey[],
) {
  if (series.id !== undefined) {
    const newChapters = chapters.map((chapter) => ({ ...chapter, read }));
    library.upsertChapters(newChapters, series);
    updateSeriesNumberUnread(series, chapterLanguages);
    loadChapterList(series.id, setChapterList);
    loadSeries(series.id, setSeries);
  }
}

async function reloadSeries(
  series: Series,
  chapterLanguages: LanguageKey[],
): Promise<Error | void> {
  console.info(`Reloading series ${series.id} - ${series.title}`);
  if (series.id === undefined) {
    return new Promise((resolve) => resolve(Error('Series does not have database ID')));
  }

  if (
    (await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.GET, series.extensionId)) === undefined
  ) {
    return new Promise((resolve) => resolve(Error('Could not retrieve extension data')));
  }

  let newSeries: Series | undefined = await ipcRenderer.invoke(
    ipcChannels.EXTENSION.GET_SERIES,
    series.extensionId,
    series.sourceId,
  );
  if (newSeries === undefined)
    return new Promise((resolve) => resolve(Error('Could not get series from extension')));

  const newChapters: Chapter[] = await ipcRenderer.invoke(
    ipcChannels.EXTENSION.GET_CHAPTERS,
    series.extensionId,
    series.sourceId,
  );

  if (series.extensionId === FS_METADATA.id) {
    newSeries = { ...series };
  } else {
    newSeries.id = series.id;
    newSeries.trackerKeys = series.trackerKeys;
    newSeries.categories = series.categories;
  }

  const oldChapters: Chapter[] = library.fetchChapters(series.id);
  const orphanedChapterIds: string[] = oldChapters.map((chapter: Chapter) => chapter.id || '');

  const chapters: Chapter[] = newChapters.map((chapter: Chapter) => {
    const matchingChapter: Chapter | undefined = oldChapters.find(
      (c: Chapter) => c.sourceId === chapter.sourceId,
    );
    if (matchingChapter !== undefined && matchingChapter.id !== undefined) {
      chapter.id = matchingChapter.id;
      chapter.read = matchingChapter.read;

      orphanedChapterIds.splice(orphanedChapterIds.indexOf(matchingChapter.id), 1);
    }
    return chapter;
  });

  library.upsertSeries(newSeries);
  library.upsertChapters(chapters, newSeries);
  if (orphanedChapterIds.length > 0 && newSeries.id !== undefined) {
    library.removeChapters(orphanedChapterIds, newSeries.id);
  }

  updateSeriesNumberUnread(newSeries, chapterLanguages);

  // download the cover as a thumbnail if the remote URL has changed or
  // there is no existing thumbnail
  const thumbnailPath = await ipcRenderer.invoke(ipcChannels.FILESYSTEM.GET_THUMBNAIL_PATH, series);
  if (thumbnailPath !== null) {
    if (newSeries.remoteCoverUrl !== series.remoteCoverUrl || !fs.existsSync(thumbnailPath)) {
      console.debug(`Updating cover for series ${newSeries.id}`);
      ipcRenderer.invoke(ipcChannels.FILESYSTEM.DELETE_THUMBNAIL, series);
      downloadCover(newSeries);
    }
  }
}

export async function reloadSeriesList(
  seriesList: Series[],
  setSeriesList: (seriesList: Series[]) => void,
  setReloadingSeriesList: (reloadingSeriesList: boolean) => void,
  chapterLanguages: LanguageKey[],
) {
  console.debug(`Reloading series list...`);
  setReloadingSeriesList(true);

  const { update } = toast!({
    title: 'Refreshing library...',
    duration: 900000,
  });

  const sortedSeriesList = [...seriesList].sort((a: Series, b: Series) =>
    a.title.localeCompare(b.title),
  );

  let cur = 0;
  const failedToUpdate: Series[] = [];

  for (const series of sortedSeriesList) {
    update({ description: `Reloading series ${cur}/${sortedSeriesList.length}` });

    const ret = await reloadSeries(series, chapterLanguages);
    if (ret instanceof Error) {
      console.error(ret);
      failedToUpdate.push(series);
    }
    cur += 1;
  }

  setSeriesList(library.fetchSeriesList());
  if (cur === 1 && failedToUpdate.length > 0) {
    update({
      title: 'Library refresh failed',
      description: `Error while reloading series "${seriesList[0].title}"`,
      duration: 5000,
    });
  } else if (failedToUpdate.length > 0) {
    update({
      title: 'Library refreshed with errors',
      description: `Failed to update ${failedToUpdate.length} series`,
    });
  } else {
    update({ title: 'Library refreshed', description: `Reloaded ${cur} series`, duration: 5000 });
  }

  setReloadingSeriesList(false);
}

export function updateSeries(series: Series) {
  const newSeries = library.upsertSeries(series);
  return downloadCover(newSeries);
}

export function updateSeriesTrackerKeys(
  series: Series,
  trackerKeys: { [trackerId: string]: string } | undefined,
) {
  return library.upsertSeries({ ...series, trackerKeys });
}

/**
 * Get a list of Series and associated Chapters from a list of chapterIds.
 * @param chapterIds list of Chapter UUIDs
 * @returns An object with two properties:
 *  - seriesList: Series[]
 *  - chapterLists: object with keys as `seriesId`s and values as Chapter[]
 */
export function getFromChapterIds(chapterIds: string[]): {
  seriesList: Series[];
  chapterLists: { [seriesId: string]: Chapter[] };
} {
  const seriesSet = new Set<Series>();
  const chapterLists: { [seriesId: string]: Chapter[] } = {};

  library.fetchSeriesList().forEach((series) => {
    if (!series.id) return;

    library
      .fetchChapters(series.id)
      .filter((c) => c.id && chapterIds.includes(c.id))
      .forEach((chapter) => {
        if (!series.id) return;

        seriesSet.add(series);
        if (series.id in chapterLists) {
          chapterLists[series.id] = [...chapterLists[series.id], chapter];
        } else {
          chapterLists[series.id] = [chapter];
        }
      });
  });

  return {
    seriesList: Array.from(seriesSet),
    chapterLists,
  };
}

export function migrateSeriesTags() {
  const seriesList: Series[] = library.fetchSeriesList();
  seriesList.forEach((series) => {
    const tags: string[] = [];
    ['formats', 'genres', 'demographics', 'contentWarnings', 'themes', 'tagKeys'].forEach(
      (oldField) => {
        if (oldField in series) {
          // @ts-expect-error handling deprecated key
          tags.push(...series[oldField]);
          // @ts-expect-error handling deprecated key
          delete series[oldField];

          library.upsertSeries({ ...series, tags });
        }
      },
    );
  });
}

export async function goToSeries(series: Series, navigate: (location: string) => void) {
  if (series.id !== undefined) {
    if (
      (await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.GET, series.extensionId)) ===
      undefined
    ) {
      toast({
        title: 'Content source not found',
        description:
          'The content source for this series was not found. Please update your plugins.',
        duration: 5000,
      });
    } else {
      navigate(`${routes.SERIES}/${series.id}`);
    }
  }
}
