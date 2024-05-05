import { Series } from '@tiyo/common';
const { ipcRenderer } = require('electron');
import ipcChannels from '@/common/constants/ipcChannels.json';

/**
 * Download a series' cover to the filesystem.
 * The cover is saved in the internal thumbnail directory; see getThumbnailPath.
 * @param series the series to download cover for
 */
export async function downloadCover(series: Series) {
  const thumbnailPath = await ipcRenderer.invoke(ipcChannels.FILESYSTEM.GET_THUMBNAIL_PATH, series);
  if (thumbnailPath === null) return;

  const data = await ipcRenderer.invoke(
    ipcChannels.EXTENSION.GET_IMAGE,
    series.extensionId,
    series,
    series.remoteCoverUrl,
  );

  await ipcRenderer.invoke(ipcChannels.FILESYSTEM.DOWNLOAD_THUMBNAIL, thumbnailPath, data);
}
