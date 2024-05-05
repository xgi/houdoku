import { Series } from '@tiyo/common';
const { ipcRenderer } = require('electron');
import { getThumbnailPath } from '@/common/util/filesystem';
import ipcChannels from '@/common/constants/ipcChannels.json';

/**
 * Download a series' cover to the filesystem.
 * The cover is saved in the internal thumbnail directory; see getThumbnailPath.
 * @param series the series to download cover for
 */
// eslint-disable-next-line import/prefer-default-export
export async function downloadCover(series: Series) {
  const thumbnailPath = await getThumbnailPath(series);
  if (thumbnailPath === null) return;

  const data = await ipcRenderer.invoke(
    ipcChannels.EXTENSION.GET_IMAGE,
    series.extensionId,
    series,
    series.remoteCoverUrl,
  );

  await ipcRenderer.invoke(ipcChannels.DOWNLOAD_THUMBNAIL, thumbnailPath, data);
}
