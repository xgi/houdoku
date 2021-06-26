import { Chapter, Series } from 'houdoku-extension-lib';
import path from 'path';
import db from '../../services/db';
import { getAllDownloadedChapterPaths } from '../../util/filesystem';

// eslint-disable-next-line import/prefer-default-export
export async function getDownloadedList(): Promise<{
  seriesList: Series[];
  chapterList: Chapter[];
}> {
  const downloadedChapterPaths: string[] = await getAllDownloadedChapterPaths();

  const cache: {
    [seriesId: number]: { series: Series; chapters: Chapter[] };
  } = {};

  const seriesList: Series[] = [];
  const chapterList: Chapter[] = [];

  await Promise.all(
    downloadedChapterPaths.map(async (chapterPath: string) => {
      const chapterId = parseInt(path.basename(chapterPath), 10);
      const seriesId = parseInt(path.basename(path.dirname(chapterPath)), 10);

      if (Number.isNaN(chapterId) || Number.isNaN(seriesId)) return;

      if (seriesId in cache) {
        const cachedChapter = cache[seriesId].chapters.find(
          (chapter: Chapter) => chapter.id === chapterId
        );
        if (cachedChapter !== undefined) chapterList.push(cachedChapter);
      } else {
        const series = (await db.fetchSeries(seriesId))[0] as Series;
        const chapters = await db.fetchChapters(seriesId);

        cache[seriesId] = {
          series,
          chapters,
        };

        seriesList.push(series);
        const chapter = chapters.find((c: Chapter) => c.id === chapterId);
        if (chapter !== undefined) chapterList.push(chapter);
      }
    })
  );

  return { seriesList, chapterList };
}
