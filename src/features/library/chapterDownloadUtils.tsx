import { Chapter, Series } from 'houdoku-extension-lib';
import { downloaderClient, DownloadTask } from '../../services/downloader';
import { getChapterDownloaded } from '../../util/filesystem';

export function downloadNextX(
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
    if (
      chapter &&
      !getChapterDownloaded(chapter, downloadsDir) &&
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

export function downloadAll(
  chapterList: Chapter[],
  series: Series,
  downloadsDir: string,
  unreadOnly?: boolean
) {
  const filteredChapterList = unreadOnly
    ? chapterList.filter((chapter) => !chapter.read)
    : chapterList;
  const queue = filteredChapterList
    .filter((chapter) => !getChapterDownloaded(chapter, downloadsDir))
    .sort((a, b) => parseFloat(a.chapterNumber) - parseFloat(b.chapterNumber));

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
