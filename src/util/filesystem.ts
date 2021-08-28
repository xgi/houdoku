import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { Chapter, Series } from 'houdoku-extension-lib';
import ipcChannels from '../constants/ipcChannels.json';

/**
 * Get a list of all file paths within a directory (recursively).
 * @param directory the directory to start from
 * @returns list of all full file paths
 */
export function walk(directory: string): string[] {
  let fileList: string[] = [];

  const files = fs.readdirSync(directory);
  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    const curPath = path.join(directory, file);
    if (fs.statSync(curPath).isDirectory()) {
      fileList = [...fileList, ...walk(curPath)];
    } else {
      fileList.push(curPath);
    }
  }

  return fileList;
}

/**
 * Get the expected path for a saved series thumbnail.
 * The thumbnail does not necessarily exist; this just provides the filename that it would/should
 * exist at.
 * When a series has an empty remoteCoverUrl value, it does not have a relevant thumbnail path. Thus
 * we return null in that case.
 * @param series the series to get the expected path for
 * @returns a promise for the expected thumbnail path if the series has a remoteCoverUrl, else null
 */
export async function getThumbnailPath(series: Series): Promise<string | null> {
  if (series.remoteCoverUrl === '') return null;

  const thumbnailsDir = await ipcRenderer.invoke(
    ipcChannels.GET_PATH.THUMBNAILS_DIR
  );
  if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir);
  }

  const ext = series.remoteCoverUrl.split('.').pop();
  return path.join(thumbnailsDir, `${series.id}.${ext}`);
}

export function getChapterDownloadPathSync(
  series: Series,
  chapter: Chapter,
  downloadsDir: string
): string {
  return path.join(downloadsDir, `${series.id}`, `${chapter.id}`);
}

export async function getChapterDownloadPath(
  series: Series,
  chapter: Chapter
): Promise<string> {
  const downloadsDir = await ipcRenderer.invoke(
    ipcChannels.GET_PATH.DOWNLOADS_DIR
  );
  return getChapterDownloadPathSync(series, chapter, downloadsDir);
}

export async function getChapterDownloaded(
  series: Series,
  chapter: Chapter
): Promise<boolean> {
  const downloadsDir = await ipcRenderer.invoke(
    ipcChannels.GET_PATH.DOWNLOADS_DIR
  );
  const chapterPath = getChapterDownloadPathSync(series, chapter, downloadsDir);
  return fs.existsSync(chapterPath)
    ? fs.readdirSync(chapterPath).length > 0
    : false;
}

export function getChapterDownloadedSync(
  series: Series,
  chapter: Chapter,
  downloadsDir: string
): boolean {
  const chapterPath = getChapterDownloadPathSync(series, chapter, downloadsDir);
  return fs.existsSync(chapterPath)
    ? fs.readdirSync(chapterPath).length > 0
    : false;
}

export async function getAllDownloadedChapterPaths(): Promise<string[]> {
  const downloadsDir = await ipcRenderer.invoke(
    ipcChannels.GET_PATH.DOWNLOADS_DIR
  );

  if (!fs.existsSync(downloadsDir)) {
    return [];
  }

  const chapterPaths: Set<string> = new Set();

  fs.readdirSync(downloadsDir).forEach((seriesDirName: string) => {
    const seriesPath = path.join(downloadsDir, seriesDirName);
    if (fs.statSync(seriesPath).isDirectory()) {
      fs.readdirSync(seriesPath).forEach((chapterDirName: string) => {
        const chapterPath = path.join(seriesPath, chapterDirName);
        chapterPaths.add(chapterPath);
      });
    }
  });

  return Array.from(chapterPaths);
}

export async function deleteDownloadedChapter(
  series: Series,
  chapter: Chapter
): Promise<void> {
  log.debug(
    `Deleting from disk chapter ${chapter.id} from series ${series.id}`
  );
  if (series.id === undefined || chapter.id === undefined)
    return new Promise((resolve) => resolve());

  const chapterDownloadPath = await getChapterDownloadPath(series, chapter);
  if (fs.existsSync(chapterDownloadPath)) {
    return new Promise((resolve) =>
      rimraf(chapterDownloadPath, () => {
        const seriesDir = path.dirname(chapterDownloadPath);
        if (
          fs.existsSync(seriesDir) &&
          fs.readdirSync(seriesDir).length === 0
        ) {
          fs.rmdirSync(seriesDir);
        }
        resolve();
      })
    );
  }
  return new Promise((resolve) => resolve());
}

export async function deleteAllDownloadedChapters(
  series: Series
): Promise<void> {
  log.debug(`Deleting from disk all chapters for series ${series.id}`);
  if (series.id === undefined) return new Promise((resolve) => resolve());

  const downloadsDir = await ipcRenderer.invoke(
    ipcChannels.GET_PATH.DOWNLOADS_DIR
  );
  const seriesDownloadPath = path.join(downloadsDir, `${series.id}`);

  if (fs.existsSync(seriesDownloadPath)) {
    return new Promise((resolve) =>
      rimraf(seriesDownloadPath, () => {
        resolve();
      })
    );
  }
  return new Promise((resolve) => resolve());
}

/**
 * Delete a series thumbnail from the filesystem.
 * This does not necessarily require the thumbnail to exist; therefore this function can be simply
 * used to ensure that a thumbnail does not exist.
 * @param series the series to delete the thumbnail for
 */
export async function deleteThumbnail(series: Series) {
  const thumbnailsDir = await ipcRenderer.invoke(
    ipcChannels.GET_PATH.THUMBNAILS_DIR
  );
  if (!fs.existsSync(thumbnailsDir)) return;

  const files = fs.readdirSync(thumbnailsDir);
  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    if (file.startsWith(`${series.id}.`)) {
      const curPath = path.join(thumbnailsDir, file);
      log.debug(`Deleting thumbnail at ${curPath}`);
      fs.unlink(curPath, (err) => {
        if (err) {
          log.error(err);
        }
      });
    }
  }
}
