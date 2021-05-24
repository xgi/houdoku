import fs from 'fs';
import log from 'electron-log';
import { Series } from 'houdoku-extension-lib';
import { getThumbnailPath } from './filesystem';

/**
 * Download a series' cover to the filesystem.
 * The cover is saved in the internal thumbnail directory; see getThumbnailPath.
 * @param series the series to download cover for
 */
// eslint-disable-next-line import/prefer-default-export
export async function downloadCover(series: Series) {
  const thumbnailPath = await getThumbnailPath(series);
  if (thumbnailPath === null) return;

  log.debug(
    `Downloading cover for series ${series.id} (sourceId=${series.sourceId}, extId=${series.extensionId}) from ${series.remoteCoverUrl}`
  );

  // eslint-disable-next-line promise/catch-or-return
  fetch(series.remoteCoverUrl)
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
      fs.writeFile(thumbnailPath, Buffer.from(buffer), (err) => {
        if (err) {
          log.error(err);
        }
      });
      return true;
    });
}
