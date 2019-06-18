package com.faltro.houdoku.util.runnable;

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
    private final boolean can_add;


    /**
     * Runnable for updating an entry for a series in the user's list on a tracker.
     *
     * @param name          the name of the thread
     * @param contentLoader the ContentLoader which created this instance
     * @param tracker       the Tracker to update
     * @param id            the series id
     * @param track         a Track instance with the desired fields to modify
     * @param safe          whether to avoid decreasing number from the tracker
     * @param can_add       whether to add the series to the user's list if not already in it
     */
    public UpdateSeriesTrackerRunnable(String name, ContentLoader contentLoader, Tracker tracker,
            String id, Track track, boolean safe, boolean can_add) {
        super(name, contentLoader);
        this.tracker = tracker;
        this.id = id;
        this.track = track;
        this.safe = safe;
        this.can_add = can_add;
    }

    @Override
    public void run() {
        try {
            tracker.update(id, track, safe, can_add);
        } catch (IOException | NotAuthenticatedException | NotImplementedException e) {
            e.printStackTrace();
        }

        finish();
    }
}
