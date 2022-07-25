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
  totalPages?: number;
  downloadsDir: string;
};

export type DownloadError = {
  chapter: Chapter;
  series: Series;
  errorStr: string;
};

class DownloaderClient {
  setStatusTextState?: (text: string | undefined) => void;

  setRunningState?: (running: boolean) => void;

  setQueueState?: (queue: DownloadTask[]) => void;

  setCurrentTaskState?: (currentTask: DownloadTask | null) => void;

  setDownloadErrorsState?: (downloadErrors: DownloadError[]) => void;

  running = false;

  queue: DownloadTask[] = [];

  currentTask: DownloadTask | null = null;

  downloadErrors: DownloadError[] = [];

  setStateFunctions = (
    setStatusTextState: (text: string | undefined) => void,
    setRunningState: (running: boolean) => void,
    setQueueState: (queue: DownloadTask[]) => void,
    setCurrentTaskState: (currentTask: DownloadTask | null) => void,
    setDownloadErrorsState: (downloadErrors: DownloadError[]) => void
  ) => {
    this.setStatusTextState = setStatusTextState;
    this.setRunningState = setRunningState;
    this.setQueueState = setQueueState;
    this.setCurrentTaskState = setCurrentTaskState;
    this.setDownloadErrorsState = setDownloadErrorsState;
  };

  setRunning = (running: boolean) => {
    this.running = running;
    if (this.setRunningState) this.setRunningState(running);
  };

  setQueue = (queue: DownloadTask[]) => {
    this.queue = queue;
    if (this.setQueueState) this.setQueueState(queue);
  };

  setCurrentTask = (currentTask: DownloadTask | null) => {
    this.currentTask = currentTask;
    if (this.setCurrentTaskState) this.setCurrentTaskState(currentTask);
  };

  setDownloadErrors = (downloadErrors: DownloadError[]) => {
    this.downloadErrors = downloadErrors;
    if (this.setDownloadErrorsState)
      this.setDownloadErrorsState(downloadErrors);
  };

  _handleDownloadError = (downloadError: DownloadError) => {
    log.error(downloadError.errorStr);
    this.setRunning(false);
    this.setCurrentTask(null);
    this.setDownloadErrors([...this.downloadErrors, downloadError]);
  };

  start = async () => {
    if (this.running) return;

    if (this.queue.length === 0) {
      this.setRunning(false);
      return;
    }

    this.setRunning(true);
    while (this.running && this.queue.length > 0) {
      const task: DownloadTask | undefined = this.queue[0];
      this.setQueue(this.queue.slice(1));
      if (task === undefined) {
        break;
      }

      this.setCurrentTask({
        series: task.series,
        chapter: task.chapter,
        downloadsDir: task.downloadsDir,
      });

      // eslint-disable-next-line no-await-in-loop
      const chapterPath = await getChapterDownloadPath(
        task.series,
        task.chapter,
        task.downloadsDir
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
        this._handleDownloadError({
          chapter: task.chapter,
          series: task.series,
          errorStr: `Chapter contains invalid page URL(s) that cannot be downloaded`,
        } as DownloadError);
        break;
      }

      log.debug(
        `Downloading pages for chapter ${task.chapter.id} of series ${task.series.id}`
      );

      const startPage = task.page === undefined ? 1 : task.page;
      log.debug(`Starting download at page ${startPage}`);

      let i = startPage;
      for (i; i <= pageUrls.length && this.running; i += 1) {
        const pageUrl = pageUrls[i - 1];
        const ext = pageUrl.split('.').pop()?.split('?v')[0];
        const pageNumPadded = String(i).padStart(
          pageUrls.length.toString().length,
          '0'
        );
        const pagePath = path.join(chapterPath, `${pageNumPadded}.${ext}`);

        if (this.setStatusTextState) {
          const queueStr =
            this.queue.length > 0 ? ` [+${this.queue.length} in queue]` : '';

          this.setStatusTextState(
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
                  errorStr: `${err.name}: ${err.message}`,
                } as DownloadError);
            });
          })
          .catch((err: Error) => {
            this._handleDownloadError({
              chapter: task.chapter,
              series: task.series,
              errorStr: `${err.name}: ${err.message}`,
            } as DownloadError);
          });

        this.setCurrentTask({
          series: task.series,
          chapter: task.chapter,
          downloadsDir: task.downloadsDir,
          page: i,
          totalPages: pageUrls.length,
        });
      }

      if (!this.running) {
        // task was paused, add it back to the start of the queue
        this.setQueue([{ ...task, page: i }, ...this.queue]);
      }

      if (this.setStatusTextState) {
        if (this.running) {
          this.setStatusTextState(
            `Finished downloading ${task.series.title} chapter ${task.chapter.chapterNumber}`
          );
        }
      }
    }

    this.setRunning(false);
    this.setCurrentTask(null);
  };

  pause = () => {
    this.setRunning(false);
  };

  add = (tasks: DownloadTask[]) => {
    this.setQueue([...this.queue, ...tasks]);
  };

  clear = () => {
    this.setQueue([]);
  };
}

export const downloaderClient = new DownloaderClient();
