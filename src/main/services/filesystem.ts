import { IpcMain } from 'electron';
import { Chapter, Series } from '@tiyo/common';
import {
  getChapterDownloadPath,
  deleteDownloadedChapter,
  getAllDownloadedChapterIds,
  downloadThumbnail,
  getThumbnailPath,
  deleteThumbnail,
  getChaptersDownloaded,
  getChapterDownloaded,
} from '@/main/util/filesystem';
import ipcChannels from '@/common/constants/ipcChannels.json';
import { THUMBNAILS_DIR } from '../util/appdata';

export const createFilesystemIpcHandlers = (ipcMain: IpcMain) => {
  console.debug('Creating filesystem IPC handlers in main...');

  ipcMain.handle(
    ipcChannels.FILESYSTEM.GET_CHAPTER_DOWNLOAD_PATH,
    (_event, series: Series, chapter: Chapter, downloadsDir: string) => {
      return getChapterDownloadPath(series, chapter, downloadsDir);
    },
  );

  ipcMain.handle(
    ipcChannels.FILESYSTEM.GET_CHAPTERS_DOWNLOADED,
    (_event, series: Series, chapters: Chapter[], downloadsDir: string) => {
      return getChaptersDownloaded(series, chapters, downloadsDir);
    },
  );

  ipcMain.handle(
    ipcChannels.FILESYSTEM.GET_CHAPTER_DOWNLOADED,
    (_event, series: Series, chapter: Chapter, downloadsDir: string) => {
      return getChapterDownloaded(series, chapter, downloadsDir);
    },
  );

  ipcMain.handle(
    ipcChannels.FILESYSTEM.DELETE_DOWNLOADED_CHAPTER,
    (_event, series: Series, chapter: Chapter, downloadsDir: string) => {
      return deleteDownloadedChapter(series, chapter, downloadsDir);
    },
  );

  ipcMain.handle(
    ipcChannels.FILESYSTEM.GET_ALL_DOWNLOADED_CHAPTER_IDS,
    (_event, downloadsDir: string) => {
      return getAllDownloadedChapterIds(downloadsDir);
    },
  );

  ipcMain.handle(ipcChannels.FILESYSTEM.GET_THUMBNAIL_PATH, (_event, series: Series) => {
    return getThumbnailPath(series, THUMBNAILS_DIR);
  });

  ipcMain.handle(
    ipcChannels.FILESYSTEM.DOWNLOAD_THUMBNAIL,
    (_event, thumbnailPath: string, data: string | BlobPart) => {
      return downloadThumbnail(thumbnailPath, data);
    },
  );

  ipcMain.handle(ipcChannels.FILESYSTEM.DELETE_THUMBNAIL, (_event, series: Series) => {
    return deleteThumbnail(series, THUMBNAILS_DIR);
  });
};
