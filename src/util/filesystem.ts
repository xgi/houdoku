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
 * Get a list of all directories within a directory (recursively).
 * @param directory the directory to start from
 * @returns list of all subdirectories
 */
export function getDirectories(directory: string): string[] {
  let fileList: string[] = [];

  const files = fs.readdirSync(directory);
  files.forEach((file) => {
    const curPath = path.join(directory, file);
    if (fs.statSync(curPath).isDirectory()) {
      fileList = [...fileList, curPath, ...getDirectories(curPath)];
    }
  });

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

  const thumbnailsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.THUMBNAILS_DIR);
  if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir);
  }

  const extMatch = series.remoteCoverUrl.match(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i);
  const ext = extMatch ? extMatch[1] : 'jpg';
  return path.join(thumbnailsDir, `${series.id}.${ext}`);
}

export function getChapterDownloadPath(
  series: Series,
  chapter: Chapter,
  downloadsDir: string
): string {
  return path.join(downloadsDir, `${series.id}`, `${chapter.id}`);
}

export function getChapterDownloaded(
  series: Series,
  chapter: Chapter,
  downloadsDir: string
): boolean {
  const chapterPath = getChapterDownloadPath(series, chapter, downloadsDir);
  return fs.existsSync(chapterPath) ? fs.readdirSync(chapterPath).length > 0 : false;
}

export function getAllDownloadedChapterPaths(downloadsDir: string): string[] {
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
  chapter: Chapter,
  downloadsDir: string
): Promise<void> {
  log.debug(`Deleting from disk chapter ${chapter.id} from series ${series.id}`);
  if (series.id === undefined || chapter.id === undefined)
    return new Promise((resolve) => resolve());

  const chapterDownloadPath = getChapterDownloadPath(series, chapter, downloadsDir);
  if (fs.existsSync(chapterDownloadPath)) {
    return new Promise((resolve) =>
      rimraf(chapterDownloadPath, () => {
        const seriesDir = path.dirname(chapterDownloadPath);
        if (fs.existsSync(seriesDir) && fs.readdirSync(seriesDir).length === 0) {
          fs.rmdirSync(seriesDir);
        }
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
  const thumbnailsDir = await ipcRenderer.invoke(ipcChannels.GET_PATH.THUMBNAILS_DIR);
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
