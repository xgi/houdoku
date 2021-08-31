import { Chapter, Series } from 'houdoku-extension-lib';
import path from 'path';
import library from '../../services/library';
import { getAllDownloadedChapterPaths } from '../../util/filesystem';

// eslint-disable-next-line import/prefer-default-export
export async function getDownloadedList(downloadsDir: string): Promise<{
  seriesList: Series[];
  chapterLists: { [seriesId: string]: Chapter[] };
}> {
  const downloadedChapterPaths: string[] =
    getAllDownloadedChapterPaths(downloadsDir);

  const seriesList: Series[] = [];
  const chapterLists: { [seriesId: string]: Chapter[] } = {};

  await Promise.all(
    // eslint-disable-next-line array-callback-return
    downloadedChapterPaths.map((chapterPath: string) => {
      const chapterId = path.basename(chapterPath);
      const seriesId = path.basename(path.dirname(chapterPath));

      const existingSeries: Series | undefined = seriesList.find(
        (s) => s.id === seriesId
      );
      const series: Series | null =
        existingSeries || library.fetchSeries(seriesId);
      if (series === null) return;
      if (!existingSeries) {
        seriesList.push(series);
      }

      const chapter: Chapter | null = library.fetchChapter(seriesId, chapterId);
      if (chapter === null) return;

      if (seriesId in chapterLists) {
        chapterLists[seriesId] = [...chapterLists[seriesId], chapter];
      } else {
        chapterLists[seriesId] = [chapter];
      }
    })
  );

  return {
    seriesList,
    chapterLists,
  };
}
