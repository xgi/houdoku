package com.faltro.houdoku.util.runnable;

import com.faltro.houdoku.controller.ConfigController;
import com.faltro.houdoku.exception.NotAuthenticatedException;
import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.plugins.tracker.Tracker;
import com.faltro.houdoku.util.ContentLoader;
import java.io.IOException;

public class UpdateChaptersReadRunnable extends LoaderRunnable {
    private final Tracker tracker;
    private final String id;
    private final int num;
    private final boolean safe;


    /**
     * Runnable for updating the number of chapters read on a tracker.
     *
     * @param name          the name of the thread
     * @param contentLoader the ContentLoader which created this instance
     * @param tracker       the Tracker to update
     * @param id            the series id
     * @param num           the number of chapters read
     * @param safe          whether to avoid decreasing number from the tracker
     */
    public UpdateChaptersReadRunnable(String name, ContentLoader contentLoader, Tracker tracker,
            String id, int num, boolean safe) {
        super(name, contentLoader);
        this.tracker = tracker;
        this.id = id;
        this.num = num;
        this.safe = safe;
    }

    @Override
    public void run() {
        try {
            tracker.updateChaptersRead(id, num, safe);
        } catch (IOException | NotAuthenticatedException | NotImplementedException e) {
            e.printStackTrace();
        }

        finish();
    }
}
