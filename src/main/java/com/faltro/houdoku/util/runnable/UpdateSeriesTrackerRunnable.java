package com.faltro.houdoku.util.runnable;

import com.faltro.houdoku.controller.ConfigController;
import com.faltro.houdoku.exception.NotAuthenticatedException;
import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.model.Track;
import com.faltro.houdoku.plugins.tracker.Tracker;
import com.faltro.houdoku.util.ContentLoader;
import java.io.IOException;

public class UpdateSeriesTrackerRunnable extends LoaderRunnable {
    private final Tracker tracker;
    private final String id;
    private final Track track;
    private final boolean safe;


    /**
     * Runnable for updating an entry for a series in the user's list on a tracker.
     *
     * @param name          the name of the thread
     * @param contentLoader the ContentLoader which created this instance
     * @param tracker       the Tracker to update
     * @param id            the series id
     * @param track         a Track instance with the desired fields to modify
     * @param safe          whether to avoid decreasing number from the tracker
     */
    public UpdateSeriesTrackerRunnable(String name, ContentLoader contentLoader, Tracker tracker,
            String id, Track track, boolean safe) {
        super(name, contentLoader);
        this.tracker = tracker;
        this.id = id;
        this.track = track;
        this.safe = safe;
    }

    @Override
    public void run() {
        try {
            tracker.update(id, track, safe);
        } catch (IOException | NotAuthenticatedException | NotImplementedException e) {
            e.printStackTrace();
        }

        finish();
    }
}
