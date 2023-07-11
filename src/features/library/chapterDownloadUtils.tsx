import { Chapter, Series } from 'houdoku-extension-lib';
import { downloaderClient, DownloadTask } from '../../services/downloader';
import { getChapterDownloaded } from '../../util/filesystem';

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
