/* eslint-disable no-underscore-dangle */
import fs from 'fs';
import { ipcRenderer } from 'electron';
import { Chapter, PageRequesterData, Series } from 'houdoku-extension-lib';
import log from 'electron-log';
import path from 'path';
import { getChapterDownloadPath } from '../util/filesystem';
import ipcChannels from '../constants/ipcChannels.json';

export type DownloadTask = {
  chapter: Chapter;
  series: Series;
  page?: number;
};

export type DownloadError = {
  chapter: Chapter;
  series: Series;
  error: Error;
};

export default class DownloaderClient {
  copyClientState?: () => void;

  setStatusText?: (text: string | undefined) => void;

  running = false;

  queue: DownloadTask[] = [];

  downloadErrors: DownloadError[] = [];

  _handleDownloadError = (downloadError: DownloadError) => {
    log.error(downloadError.error);
    this.running = false;
    this.downloadErrors.push(downloadError);

    if (this.copyClientState) this.copyClientState();
  };

  start = async () => {
    if (this.running) return;

    if (this.queue.length === 0) {
      this.running = false;
      return;
    }

    this.running = true;
    while (this.running && this.queue.length > 0) {
      const task: DownloadTask | undefined = this.queue.shift();
      if (task === undefined) {
        break;
      }

      // eslint-disable-next-line no-await-in-loop
      const chapterPath = await getChapterDownloadPath(
        task.series,
        task.chapter
      );
      if (!fs.existsSync(chapterPath)) {
        fs.mkdirSync(chapterPath, { recursive: true });
      }

      // eslint-disable-next-line no-await-in-loop
      const pageUrls: string[] = await ipcRenderer
        .invoke(
          ipcChannels.EXTENSION.GET_PAGE_REQUESTER_DATA,
          task.series.extensionId,
          task.series.sourceType,
          task.series.sourceId,
          task.chapter.sourceId
        )
        .then((pageRequesterData: PageRequesterData) =>
          ipcRenderer.invoke(
            ipcChannels.EXTENSION.GET_PAGE_URLS,
            task.series.extensionId,
            pageRequesterData
          )
        );

      if (
        !pageUrls.every(
          (pageUrl: string) =>
            pageUrl.startsWith('http://') || pageUrl.startsWith('https://')
        )
      ) {
        // TODO: send status message saying 'found non-http page; can only download chapters using http'
        return;
      }

      log.debug(
        `Downloading pages for chapter ${task.chapter.id} of series ${task.series.id}`
      );

      const startPage = task.page === undefined ? 1 : task.page;
      log.debug(`Starting download at page ${startPage}`);

      let i = startPage;
      for (i; i <= pageUrls.length && this.running; i += 1) {
        const pageUrl = pageUrls[i - 1];
        const ext = pageUrl.split('.').pop();
        const pagePath = path.join(chapterPath, `${i}.${ext}`);

        if (this.setStatusText) {
          const queueStr =
            this.queue.length > 0 ? ` [+${this.queue.length} in queue]` : '';

          this.setStatusText(
            `Downloading ${task.series.title} chapter ${task.chapter.chapterNumber} (${i}/${pageUrls.length})${queueStr}`
          );
        }

        // eslint-disable-next-line no-await-in-loop
        await fetch(pageUrl)
          .then((response) => response.arrayBuffer())
          // eslint-disable-next-line promise/always-return
          .then((buffer) => {
            fs.writeFile(pagePath, Buffer.from(buffer), (err) => {
              if (err)
                this._handleDownloadError({
                  chapter: task.chapter,
                  series: task.series,
                  error: err,
                } as DownloadError);
            });
          })
          .catch((err: Error) => {
            this._handleDownloadError({
              chapter: task.chapter,
              series: task.series,
              error: err,
            } as DownloadError);
          });
      }

      if (!this.running) {
        // task was paused, add it back to the start of the queue
        this.queue.unshift({ ...task, page: i });
      }

      if (this.setStatusText) {
        if (this.running) {
          this.setStatusText(
            `Finished downloading ${task.series.title} chapter ${task.chapter.chapterNumber}`
          );
        }
      }

      if (this.copyClientState) this.copyClientState();
    }

    this.running = false;
    if (this.copyClientState) this.copyClientState();
  };

  pause = () => {
    this.running = false;
  };

  add = (tasks: DownloadTask[]) => {
    tasks.forEach((task) => this.queue.push(task));
  };

  clear = () => {
    this.queue = [];
  };

  setCopyClientStateFunc = (copyClientState: () => void) => {
    this.copyClientState = copyClientState;
  };

  setStatusTextFunc = (setStatusText: (text: string | undefined) => void) => {
    this.setStatusText = setStatusText;
  };
}
