import fs from 'fs';
import path from 'path';
import { ipcRenderer } from 'electron';
import { Series } from '../models/types';

// eslint-disable-next-line import/prefer-default-export
export async function downloadCover(series: Series) {
  if (series.remoteCoverUrl === '') return;

  const thumbnailsDir = await ipcRenderer.invoke('get-thumbnails-dir');
  if (!fs.existsSync(thumbnailsDir)) {
    fs.mkdirSync(thumbnailsDir);
  }

  const ext = series.remoteCoverUrl.split('.').pop();
  // eslint-disable-next-line promise/catch-or-return
  fetch(series.remoteCoverUrl)
    .then((response) => response.arrayBuffer())
    .then((buffer) => {
      fs.writeFile(
        path.join(thumbnailsDir, `${series.id}.${ext}`),
        Buffer.from(buffer),
        (err) => {
          if (err) {
            alert(err);
          } else {
            console.log('Saved file');
          }
        }
      );
      return true;
    });
}
