/* eslint-disable promise/catch-or-return */
import { setSeriesList, setSeries, setChapterList } from './actions';
import db from '../../services/db';
import { Chapter, Series } from '../../models/types';
import { getChapters, getSeries } from '../../services/extension';
import filesystem from '../../services/extensions/filesystem';
import { deleteThumbnail } from '../../util/filesystem';

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

export function removeSeries(dispatch: any, series: Series) {
  if (series.id === undefined) return;

  db.deleteSeries(series.id).then((response: any) => {
    deleteThumbnail(series);
    return loadSeriesList(dispatch);
  });
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

async function reloadSeries(series: Series) {
  if (series.id === undefined) return;

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
      chapter.read = matchingChapter.read;
    }
    return chapter;
  });

  await db.addSeries(newSeries);
  await db.addChapters(chapters, newSeries);
  await db.updateSeriesNumberUnread(newSeries);
}

export async function reloadSeriesList(
  seriesList: Series[],
  setStatusText: (text?: string) => void,
  callback?: () => void
) {
  let cur = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const series of seriesList) {
    setStatusText(
      `Reloading library (${cur}/${seriesList.length}) - ${series.title}`
    );
    // eslint-disable-next-line no-await-in-loop
    await reloadSeries(series);
    cur += 1;
  }

  setStatusText(`Reloaded ${cur} series`);
  if (callback !== undefined) callback();
}
