import { Chapter, Series } from '@tiyo/common';
import { downloaderClient, DownloadTask } from '../../services/downloader';
import {
  deleteDownloadedChapter,
  getChapterDownloaded,
  getChaptersDownloaded,
} from '../../util/filesystem';
import library from '../../services/library';

export async function downloadNextX(
  chapterList: Chapter[],
  series: Series,
  downloadsDir: string,
  downloadQueue: DownloadTask[],
  amount: number
) {
  const sortedChapterList = [...chapterList].sort(
    (a, b) => parseFloat(b.chapterNumber) - parseFloat(a.chapterNumber)
  );
  let startIndex = sortedChapterList.findIndex((chapter) => chapter.read);
  if (startIndex < 0) startIndex = sortedChapterList.length;

  const queue: Chapter[] = [];
  let curIndex = startIndex - 1;
  while (queue.length < amount && curIndex >= 0) {
    const chapter = sortedChapterList[curIndex];
    /* eslint-disable no-await-in-loop */
    if (
      chapter &&
      !(await getChapterDownloaded(series, chapter, downloadsDir)) &&
      !downloadQueue.some((existingTask) => existingTask.chapter.id === chapter.id)
    ) {
      queue.push(chapter);
    }
    curIndex -= 1;
  }

  downloaderClient.add(
    queue.map(
      (chapter: Chapter) =>
        ({
          chapter,
          series,
          downloadsDir,
        } as DownloadTask)
    )
  );
  downloaderClient.start();
}

export async function downloadAll(
  chapterList: Chapter[],
  series: Series,
  downloadsDir: string,
  unreadOnly?: boolean
) {
  const filteredChapterList = unreadOnly
    ? chapterList.filter((chapter) => !chapter.read)
    : chapterList;
  const queue = await Promise.all(
    filteredChapterList.map(async (chapter) => {
      if (!(await getChapterDownloaded(series, chapter, downloadsDir))) {
        return chapter;
      }
      return undefined;
    })
  );
  const chaptersToDownload = queue.filter((chapter) => chapter !== undefined);
  const sortedQueue = chaptersToDownload.sort(
    // @ts-expect-error undefined filterd out ^
    (a, b) => parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber)
  ) as Chapter[];

  downloaderClient.add(
    sortedQueue.map(
      (chapter: Chapter) =>
        ({
          chapter,
          series,
          downloadsDir,
        } as DownloadTask)
    )
  );
  downloaderClient.start();
}

/**
 * The function `DownloadUnreadChapters` downloads a specified number of unread chapters from a list of
 * series, filtering out already downloaded chapters.
 * @param {Series[]} seriesList - An array of objects representing a list of series. Each series object
 * should have properties like `sourceId`, `numberUnread`, and `id`.
 * @param {string} downloadsDir - The `downloadsDir` parameter is a string that represents the
 * directory where the downloaded chapters will be saved.
 * @param {number} [count=1] - The `count` parameter specifies the number of unread chapters to
 * download for each series. By default, it is set to 1, meaning it will download the latest unread
 * chapter. However, you can provide a different value to download a specific number of unread
 * chapters.
 * @param {Chapter[]} serieChapters - An array of Chapter objects representing the chapters of a
 * series.
 * @returns The function does not have a return statement.
 */
export async function DownloadUnreadChapters(
  seriesList: Series[],
  downloadsDir: string,
  count = 1,
  serieChapters: Chapter[] = []
) {
  for (const series of seriesList) {
    if (!library.validURL(series.sourceId)) {
      return;
    }

    if (series.numberUnread <= 0 || !series.id) continue;
    serieChapters = library
      .fetchChapters(series.id)
      .filter((x) => !x.read)
      .sort((a, b) => parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber))
      .slice(0, count);

    const nonDownloadedChapters: Chapter[] = [];
    for (const x of serieChapters) {
      const result = await getChapterDownloaded(series, x, downloadsDir);
      if (result !== true) {
        nonDownloadedChapters.push(x);
      }
    }
    downloaderClient.add(
      nonDownloadedChapters.map(
        (chapter: Chapter) =>
          ({
            chapter,
            series,
            downloadsDir,
          } as DownloadTask)
      )
    );
    downloaderClient.start();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

/**
 * The function `DeleteReadChapters` deletes downloaded chapters for a list of series that have been
 * marked as read.
 * @param {Series[]} seriesList - An array of objects representing a list of series. Each object in the
 * array should have an "id" property.
 * @param {string} downloadsDir - The `downloadsDir` parameter is a string that represents the
 * directory where the downloaded chapters are stored.
 * @param {Chapter[]} [serieChapters] - An optional array of Chapter objects representing the chapters
 * of a series.
 * @returns The function does not have a return statement.
 */
export async function DeleteReadChapters(
  seriesList: Series[],
  downloadsDir: string,
  serieChapters?: Chapter[]
) {
  for (const series of seriesList) {
    if (!series.id) return;
    serieChapters = library.fetchChapters(series.id)
      .filter((x) => x.read);
    const DownloadedChapters: Chapter[] = [];
    const downloadedChapters = await getChaptersDownloaded(series, serieChapters, downloadsDir);
    for (const key in downloadedChapters) {
      if (downloadedChapters.hasOwnProperty(key)) {
        const foundChapter = serieChapters.find((chapter) => chapter.id === key);
        if (foundChapter) {
          DownloadedChapters.push(foundChapter);
        }
      }
    }
    for (const x of DownloadedChapters) {
      await deleteDownloadedChapter(series, x, downloadsDir);
    }
  }
}
