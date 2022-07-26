import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { Chapter, Series } from 'houdoku-extension-lib';
import ipcChannels from '../../constants/ipcChannels.json';
import { TrackEntry } from '../../models/types';

// eslint-disable-next-line import/prefer-default-export
export function sendProgressToTrackers(chapter: Chapter, series: Series) {
  const roundChapterNum = Math.floor(parseFloat(chapter.chapterNumber));

  if (series.trackerKeys) {
    Object.keys(series.trackerKeys).forEach(async (trackerId: string) => {
      if (series.trackerKeys && series.trackerKeys[trackerId]) {
        const curTrackEntry: TrackEntry | null = await ipcRenderer.invoke(
          ipcChannels.TRACKER.GET_LIBRARY_ENTRY,
          trackerId,
          series.trackerKeys[trackerId]
        );

        if (
          curTrackEntry !== null &&
          curTrackEntry.progress &&
          curTrackEntry.progress >= roundChapterNum
        ) {
          log.debug(
            `Skipping progress update on tracker ${trackerId} for series ${series.title} because it is already ahead`
          );
          return;
        }

        log.debug(
          `Update on tracker ${trackerId} for series ${series.title} to ${roundChapterNum}`
        );
        await ipcRenderer.invoke(ipcChannels.TRACKER.UPDATE_LIBRARY_ENTRY, trackerId, {
          seriesId: series.trackerKeys[trackerId],
          progress: roundChapterNum,
        } as TrackEntry);
      }
    });
  }
}
