package com.faltro.houdoku.util.runnable;

import com.faltro.houdoku.controller.ConfigController;
import com.faltro.houdoku.controller.SeriesController;
import com.faltro.houdoku.exception.NotAuthenticatedException;
import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.plugins.info.AniList;
import com.faltro.houdoku.plugins.tracker.Tracker;
import com.faltro.houdoku.util.ContentLoader;
import java.io.IOException;

public class LoadChaptersReadRunnable extends LoaderRunnable {
    private final Tracker tracker;
    private final Series series;
    private final SeriesController seriesController;


    /**
     * Runnable for loading the number of chapters read on a tracker.
     *
     * @param name             the name of the thread
     * @param contentLoader    the ContentLoader which created this instance
     * @param tracker          the Tracker to load from
     * @param series           the Series to get data for
     * @param seriesController the SeriesController to update after loading tracker data
     */
    public LoadChaptersReadRunnable(String name, ContentLoader contentLoader, Tracker tracker,
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

            String title = tracker.getTitle(series_id);
            int read_chapters = tracker.getChaptersRead(series_id);

            seriesController.reloadTrackerDetails(AniList.ID, series_id, title, read_chapters);
        } catch (IOException | NotAuthenticatedException | NotImplementedException e) {
            e.printStackTrace();
        }

        finish();
    }
}
