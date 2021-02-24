import path from 'path';
import fs from 'fs';
import { ipcRenderer } from 'electron';
import { Series } from '../models/types';

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

export async function getThumbnailPath(series: Series): Promise<string | null> {
  if (series.remoteCoverUrl === '') return null;

  const thumbnailsDir = await ipcRenderer.invoke('get-thumbnails-dir');
  if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir);
  }

  const ext = series.remoteCoverUrl.split('.').pop();
  return path.join(thumbnailsDir, `${series.id}.${ext}`);
}

export async function deleteThumbnail(series: Series) {
  const thumbnailPath = await getThumbnailPath(series);
  if (thumbnailPath === null) return;

  fs.unlink(thumbnailPath, (err) => {
    if (err) {
      console.error(err);
    }
  });
}
