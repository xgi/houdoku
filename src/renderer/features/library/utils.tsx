const fs = require('fs');
const { ipcRenderer } = require('electron');
import { Chapter, LanguageKey, Series } from '@tiyo/common';
import React from 'react';
import { SetterOrUpdater } from 'recoil';
import { closeAllModals, openConfirmModal, openModal } from '@mantine/modals';
import { Button, Group, List, Text } from '@mantine/core';
import { v4 as uuidv4 } from 'uuid';
import { showNotification, updateNotification } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck, IconX } from '@tabler/icons';
import { downloadCover } from '@/renderer/util/download';
import { FS_METADATA } from '@/common/temp_fs_metadata';
import ipcChannels from '@/common/constants/ipcChannels.json';
import library from '@/renderer/services/library';
import { getNumberUnreadChapters } from '@/renderer/util/comparison';
import routes from '@/common/constants/routes.json';
import { Category } from '@/common/models/types';

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

  const notificationId = uuidv4();
  if (!series.preview) {
    showNotification({
      id: notificationId,
      title: 'Adding series...',
      message: (
        <Text>
          Adding{' '}
          <Text c="teal" component="span" fs="italic">
            {series.title}
          </Text>
        </Text>
      ),
      loading: true,
      autoClose: false,
    });
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
    updateNotification({
      id: notificationId,
      title: `Failed to add series`,
      message: <Text>An error occurred while adding the series to your library.</Text>,
      color: 'red',
      icon: React.createElement(IconX, { size: 16 }),
      autoClose: true,
      loading: false,
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
    updateNotification({
      id: notificationId,
      title: 'Added series',
      message: (
        <Text>
          Added{' '}
          <Text c="teal" component="span" fs="italic">
            {addedSeries.title}
          </Text>
        </Text>
      ),
      color: 'teal',
      icon: React.createElement(IconCheck, { size: 16 }),
      autoClose: true,
      loading: false,
    });
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

// eslint-disable-next-line consistent-return
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
  categoryList: Category[],
) {
  console.debug(`Reloading series list...`);
  setReloadingSeriesList(true);

  const notificationId = uuidv4();
  showNotification({ id: notificationId, message: 'Refreshing library...', loading: true });

  const sortedSeriesList = [...seriesList].sort((a: Series, b: Series) =>
    a.title.localeCompare(b.title),
  );

  const categoryIdsToSkip = categoryList
    .filter((category) => category.refreshEnabled === false)
    .map((category) => category.id);
  const filteredSeriesList =
    sortedSeriesList.length <= 1
      ? sortedSeriesList
      : sortedSeriesList.filter(
          (series) =>
            !series.categories ||
            !series.categories.some((category) => categoryIdsToSkip.includes(category)),
        );

  let cur = 0;
  const failedToUpdate: Series[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const series of filteredSeriesList) {
    updateNotification({
      id: notificationId,
      title: `Refreshing library...`,
      message: `Reloading series ${cur}/${filteredSeriesList.length}`,
      loading: true,
      autoClose: false,
    });

    // eslint-disable-next-line no-await-in-loop
    const ret = await reloadSeries(series, chapterLanguages);
    if (ret instanceof Error) {
      console.error(ret);
      failedToUpdate.push(series);
    }
    cur += 1;
  }

  setSeriesList(library.fetchSeriesList());
  if (cur === 1 && failedToUpdate.length > 0) {
    updateNotification({
      id: notificationId,
      title: `Library refresh failed`,
      message: `Error while reloading series "${seriesList[0].title}"`,
      color: 'red',
      icon: React.createElement(IconX, { size: 16 }),
      loading: false,
      autoClose: true,
    });
  } else if (failedToUpdate.length > 0) {
    updateNotification({
      id: notificationId,
      title: `Library refreshed with errors`,
      message: (
        <Text>
          Reloaded {cur} series (
          <Text
            component="a"
            variant="link"
            onClick={() =>
              openModal({
                title: 'Library Update Failed',
                children: (
                  <>
                    <Text>Failed to reload the following series:</Text>
                    <List pb="sm">
                      {failedToUpdate.map((series) => (
                        <List.Item key={series?.id}>{series.title}</List.Item>
                      ))}
                    </List>
                    <Group justify="flex-end">
                      <Button variant="default" onClick={() => closeAllModals()} mt="md">
                        Okay
                      </Button>
                    </Group>
                  </>
                ),
              })
            }
          >
            {failedToUpdate.length} errors
          </Text>
          )
        </Text>
      ),
      color: 'yellow',
      icon: React.createElement(IconAlertTriangle, { size: 16 }),
      loading: false,
      autoClose: false,
    });
  } else {
    updateNotification({
      id: notificationId,
      title: `Library refreshed`,
      message: `Reloaded ${cur} series`,
      color: 'teal',
      icon: React.createElement(IconCheck, { size: 16 }),
      loading: false,
      autoClose: true,
    });
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

export async function goToSeries(
  series: Series,
  setSeriesList: SetterOrUpdater<Series[]>,
  navigate: (location: string) => void,
) {
  if (series.id !== undefined) {
    if (
      (await ipcRenderer.invoke(ipcChannels.EXTENSION_MANAGER.GET, series.extensionId)) ===
      undefined
    ) {
      openConfirmModal({
        title: 'Content source not found',
        centered: true,
        children: (
          <>
            <Text>
              The content source for this series was not found. To view the series, please install
              or update the Tiyo plugin. Or, you may remove the series from your library.
            </Text>
            <Text color="dimmed" mt="xs">
              (id: {series.extensionId})
            </Text>
          </>
        ),
        labels: { confirm: 'Remove from library', cancel: 'Cancel' },
        confirmProps: { color: 'red' },
        onConfirm: () => removeSeries(series, setSeriesList),
      });
    } else {
      navigate(`${routes.SERIES}/${series.id}`);
    }
  }
}
