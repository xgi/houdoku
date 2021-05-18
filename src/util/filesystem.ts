import path from 'path';
import fs from 'fs';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { Series } from '../models/types';
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

/**
 * Delete a series thumbnail from the filesystem.
 * This does not necessarily require the thumbnail to exist; therefore this function can be simply
 * used to ensure that a thumbnail does not exist.
 * @param series the series to delete the thumbnail for
 */
export async function deleteThumbnail(series: Series) {
  const thumbnailPath = await getThumbnailPath(series);
  if (thumbnailPath === null) return;

  fs.unlink(thumbnailPath, (err) => {
    if (err) {
      log.error(err);
    }
  });
}
