import { Chapter, Series } from '@tiyo/common';
const fs = require('fs');
const path = require('path');
import storeKeys from '../../common/constants/storeKeys.json';
import { updateSeries } from '../features/library/utils';
import library from '../services/library';

export const createBackup = async () => {
  const blob = new Blob([JSON.stringify(localStorage)], {
    type: 'application/json',
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `houdoku_backup_${new Date().toJSON().slice(0, 10)}.json`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const createAutoBackup = async (Count = 1) => {
  if (!fs.existsSync('backups')) {
    fs.mkdir('backups');
  }
  const fileName = `houdoku_backup_${new Date().toJSON().slice(0, 10)}.json`;
  if (!fs.existsSync(`backups/${fileName}`)) {
    let jsondata = JSON.stringify(localStorage);
    jsondata = JSON.parse(jsondata);
    await fs.writeJson(`backups/${fileName}`, jsondata);
  }
  fs.readdir('backups', (err, files) => {
    if (err) {
      console.error(`Unable to scan directory: ${err}`);
    }
    if (files.length > Count) {
      fs.unlinkSync(path.join('backups', files[0]));
    }
  });
};

export const restoreBackup = (backupFileContent: string) => {
  const data: { [key: string]: string } = JSON.parse(backupFileContent);

  // add series' from the backup into the library
  if (storeKeys.LIBRARY.SERIES_LIST in data) {
    const oldSeriesList: Series[] = JSON.parse(data[storeKeys.LIBRARY.SERIES_LIST]);
    Object.values(oldSeriesList).forEach((series: Series) => updateSeries(series));
  }

  // add chapters from backup while maintaining progress from current & backup
  Object.entries(data).forEach(([key, value]) => {
    if (key.startsWith(storeKeys.LIBRARY.CHAPTER_LIST_PREFIX)) {
      const seriesId = key.split(storeKeys.LIBRARY.CHAPTER_LIST_PREFIX)[1];
      const series = library.fetchSeries(seriesId);
      if (!series) return;

      const existingChapters = library.fetchChapters(seriesId);
      const oldChapters: Chapter[] = JSON.parse(value);

      const chaptersToSave: Chapter[] = [];
      oldChapters.forEach((oldChapter) => {
        const existingChapter = existingChapters.find((c) => c.id === oldChapter.id);
        chaptersToSave.push({
          ...oldChapter,
          read: (existingChapter && existingChapter.read) || oldChapter.read,
        });
      });
      library.upsertChapters(chaptersToSave, series);
    }
  });
};
