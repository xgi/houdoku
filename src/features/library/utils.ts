/* eslint-disable promise/catch-or-return */
import { setSeriesList, setSeries, setChapterList } from './actions';
import db from '../../services/db';
import { Chapter, Series } from '../../models/types';
import { getChapters, getSeries } from '../../services/extension';
import filesystem from '../../services/extensions/filesystem';

export function loadSeriesList(dispatch: any) {
  db.fetchSerieses().then((response: any) => dispatch(setSeriesList(response)));
}

export function loadSeries(dispatch: any, id: number) {
  db.fetchSeries(id).then((response: any) => dispatch(setSeries(response[0])));
}

export function loadChapterList(dispatch: any, seriesId: number) {
  db.fetchChapters(seriesId).then((response: any) =>
    dispatch(setChapterList(response))
  );
}

export function toggleChapterRead(
  dispatch: any,
  chapter: Chapter,
  series: Series
) {
  const newChapter: Chapter = { ...chapter, read: !chapter.read };

  if (series.id !== undefined) {
    db.addChapters([newChapter], series)
      .then(() => db.updateSeriesNumberUnread(series))
      .then(() => {
        if (series.id !== undefined) {
          loadChapterList(dispatch, series.id);
          loadSeries(dispatch, series.id);
        }
        return true;
      });
  }
}

export async function reloadSeries(
  series: Series,
  setStatusText: (text?: string) => void,
  callback: () => void
) {
  if (series.id === undefined) return;

  setStatusText(`Reloading series "${series.title}"...`);
  const newSeries: Series = await getSeries(
    series.extensionId,
    series.sourceId
  );
  const newChapters: Chapter[] = await getChapters(
    series.extensionId,
    series.sourceId
  );

  if (series.extensionId !== filesystem.METADATA.id) {
    newSeries.id = series.id;
  } else {
    // TODO: add logic to avoid overriding manual values for filesystem-sourced series
  }

  const oldChapters: Chapter[] = await db.fetchChapters(series.id);
  const chapters: Chapter[] = newChapters.map((chapter: Chapter) => {
    const matchingChapter: Chapter | undefined = oldChapters.find(
      (c: Chapter) => c.sourceId === chapter.sourceId
    );
    if (matchingChapter !== undefined) {
      chapter.id = matchingChapter.id;
    }
    return chapter;
  });

  await db.addSeries(newSeries);
  await db.addChapters(chapters, newSeries);
  await db.updateSeriesNumberUnread(newSeries);
  setStatusText(`Finished reloading series "${newSeries.title}".`);

  callback();
}
