const fs = require('fs');
const { ipcRenderer } = require('electron');
import { Chapter, PageRequesterData, Series } from '@tiyo/common';
import path from 'path';
import { toast } from '@/ui/hooks/use-toast';
import ipcChannels from '@/common/constants/ipcChannels.json';

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

const showDownloadNotification = (
  update: ReturnType<typeof toast>['update'],
  task: DownloadTask | null,
  queueSize?: number,
) => {
  if (!task) return;

  const queueStr = queueSize && queueSize > 0 ? ` (${queueSize} downloads queued)` : '';
  update({
    title: `Downloading ${task.series.title} chapter ${task.chapter.chapterNumber}`,
    description: `Page ${task.page || 0}/${task.totalPages || '??'}${queueStr}`,
    duration: 900000,
  });
};

class DownloaderClient {
  setRunningState?: (running: boolean) => void;

  setQueueState?: (queue: DownloadTask[]) => void;

  setCurrentTaskState?: (currentTask: DownloadTask | null) => void;

  setDownloadErrorsState?: (downloadErrors: DownloadError[]) => void;

  running = false;

  queue: DownloadTask[] = [];

  currentTask: DownloadTask | null = null;

  downloadErrors: DownloadError[] = [];

  setStateFunctions = (
    setRunningState: (running: boolean) => void,
    setQueueState: (queue: DownloadTask[]) => void,
    setCurrentTaskState: (currentTask: DownloadTask | null) => void,
    setDownloadErrorsState: (downloadErrors: DownloadError[]) => void,
  ) => {
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
    if (this.setDownloadErrorsState) this.setDownloadErrorsState(downloadErrors);
  };

  _handleDownloadError = (downloadError: DownloadError) => {
    console.error(downloadError.errorStr);
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

    const startingQueueSize = this.queue.length;
    const { update } = toast({ title: 'Starting download...', duration: 900000 });

    this.setRunning(true);
    let tasksCompleted = 0;
    while (this.running && this.queue.length > 0) {
      const task: DownloadTask | undefined = this.queue[0];
      this.setQueue(this.queue.slice(1));
      if (task === undefined) {
        break;
      }

      this.setCurrentTask(task);
      showDownloadNotification(update, this.currentTask, this.queue.length);

      const chapterPath = await ipcRenderer.invoke(
        ipcChannels.FILESYSTEM.GET_CHAPTER_DOWNLOAD_PATH,
        task.series,
        task.chapter,
        task.downloadsDir,
      );
      if (!fs.existsSync(chapterPath)) {
        fs.mkdirSync(chapterPath, { recursive: true });
      }

      const pageUrls: string[] = await ipcRenderer
        .invoke(
          ipcChannels.EXTENSION.GET_PAGE_REQUESTER_DATA,
          task.series.extensionId,
          task.series.sourceId,
          task.chapter.sourceId,
        )
        .then((pageRequesterData: PageRequesterData) =>
          ipcRenderer.invoke(
            ipcChannels.EXTENSION.GET_PAGE_URLS,
            task.series.extensionId,
            pageRequesterData,
          ),
        );

      if (
        !pageUrls.every(
          (pageUrl: string) => pageUrl.startsWith('http://') || pageUrl.startsWith('https://'),
        )
      ) {
        this._handleDownloadError({
          chapter: task.chapter,
          series: task.series,
          errorStr: `Chapter contains invalid page URL(s) that cannot be downloaded`,
        } as DownloadError);
        break;
      }

      console.debug(`Downloading pages for chapter ${task.chapter.id} of series ${task.series.id}`);

      const startPage = task.page === undefined ? 1 : task.page;
      console.debug(`Starting download at page ${startPage}`);

      let i = startPage;
      for (i; i <= pageUrls.length && this.running; i += 1) {
        const pageUrl = pageUrls[i - 1];
        const extMatch = pageUrl.match(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i);
        const ext = extMatch ? extMatch[1] : 'jpg';
        const pageNumPadded = String(i).padStart(pageUrls.length.toString().length, '0');
        const pagePath = path.join(chapterPath, `${pageNumPadded}.${ext}`);

        const arrayBuffer: ArrayBuffer = await ipcRenderer
          .invoke(ipcChannels.EXTENSION.GET_IMAGE, task.series.extensionId, task.series, pageUrl)
          .then(async (data) => {
            if (typeof data === 'string') {
              return fetch(pageUrl)
                .then(async (response) => response.arrayBuffer())
                .catch((err) => {
                  update({
                    title: `Failed to download ${task.series.title} chapter ${task.chapter.chapterNumber}`,
                    description: `Error: ${err.message}`,
                    duration: 5000,
                  });
                  this._handleDownloadError({
                    chapter: task.chapter,
                    series: task.series,
                    errorStr: `fetch failed: ${err.message}`,
                  });
                });
            }
            return data;
          });

        fs.writeFileSync(pagePath, Buffer.from(arrayBuffer));
        this.setCurrentTask({
          series: task.series,
          chapter: task.chapter,
          downloadsDir: task.downloadsDir,
          page: i,
          totalPages: pageUrls.length,
        });
        showDownloadNotification(update, this.currentTask, this.queue.length);
      }

      if (!this.running) {
        // task was paused, add it back to the start of the queue
        this.setQueue([{ ...task, page: i, totalPages: pageUrls.length }, ...this.queue]);
      } else {
        tasksCompleted += 1;
      }
    }

    if (this.running) {
      update({
        title: `Downloaded ${this.currentTask?.series.title} chapter ${this.currentTask?.chapter.chapterNumber}`,
        description: startingQueueSize > 1 ? `Downloaded ${tasksCompleted} chapters` : '',
        duration: 5000,
      });
    } else {
      update({
        title: 'Download paused',
        description: startingQueueSize > 1 ? `Finished ${tasksCompleted} downloads` : '',
        duration: 5000,
      });
    }

    this.setRunning(false);
    this.setCurrentTask(null);
  };

  pause = () => {
    this.setRunning(false);
  };

  add = (tasks: DownloadTask[]) => {
    const filteredTasks = tasks.filter(
      (task) => !this.queue.some((existingTask) => existingTask.chapter.id === task.chapter.id),
    );

    this.setQueue([...this.queue, ...filteredTasks]);
  };

  clear = () => {
    this.setQueue([]);
  };
}

export const downloaderClient = new DownloaderClient();
