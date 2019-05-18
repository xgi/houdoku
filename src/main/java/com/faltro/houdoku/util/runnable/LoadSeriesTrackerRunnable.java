package com.faltro.houdoku.util.runnable;

import com.faltro.houdoku.controller.ConfigController;
import com.faltro.houdoku.controller.SeriesController;
import com.faltro.houdoku.exception.NotAuthenticatedException;
import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.model.Track;
import com.faltro.houdoku.model.Statuses.Status;
import com.faltro.houdoku.plugins.info.AniList;
import com.faltro.houdoku.plugins.tracker.Tracker;
import com.faltro.houdoku.util.ContentLoader;
import java.io.IOException;
import java.util.HashMap;

public class LoadSeriesTrackerRunnable extends LoaderRunnable {
    private final Tracker tracker;
    private final Series series;
    private final SeriesController seriesController;


    /**
     * Runnable for loading details from a series in the user's list on a tracker.
     *
     * @param name             the name of the thread
     * @param contentLoader    the ContentLoader which created this instance
     * @param tracker          the Tracker to load from
     * @param series           the Series to get data for
     * @param seriesController the SeriesController to update after loading tracker data
     */
    public LoadSeriesTrackerRunnable(String name, ContentLoader contentLoader, Tracker tracker,
            Series series, SeriesController seriesController) {
        super(name, contentLoader);
        this.tracker = tracker;
        this.series = series;
        this.seriesController = seriesController;
    }

    @Override
    public void run() {
        try {
            String series_id = tracker.search(series.getTitle());

            try {
                int tracker_id = tracker.getClass().getField("ID").getInt(null);
                series.updateTrackerId(tracker_id, series_id);
            } catch (NoSuchFieldException | IllegalAccessException e) {
                e.printStackTrace();
            }

            Track track = tracker.getSeriesInList(series_id);

            if (track == null) {
                String title = tracker.getTitle(series_id);
                seriesController.reloadTrackerDetails(AniList.ID, series_id, title, 0,
                        Status.PLANNING, 0);
            } else {
                seriesController.reloadTrackerDetails(AniList.ID, series_id, track.getTitle(),
                        track.getProgress(), track.getStatus(), track.getScore());
            }
        } catch (IOException | NotAuthenticatedException | NotImplementedException e) {
            e.printStackTrace();
        }

        finish();
    }
}
