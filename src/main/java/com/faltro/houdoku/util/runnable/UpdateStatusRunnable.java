package com.faltro.houdoku.util.runnable;

import com.faltro.houdoku.controller.ConfigController;
import com.faltro.houdoku.exception.NotAuthenticatedException;
import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.model.Statuses.Status;
import com.faltro.houdoku.plugins.tracker.Tracker;
import com.faltro.houdoku.util.ContentLoader;
import java.io.IOException;

public class UpdateStatusRunnable extends LoaderRunnable {
    private final Tracker tracker;
    private final String id;
    private final Status status;


    /**
     * Runnable for updating the status of a series on a tracker.
     *
     * @param name          the name of the thread
     * @param contentLoader the ContentLoader which created this instance
     * @param tracker       the Tracker to update
     * @param id            the series id
     * @param status        the status of the series
     */
    public UpdateStatusRunnable(String name, ContentLoader contentLoader, Tracker tracker,
            String id, Status status) {
        super(name, contentLoader);
        this.tracker = tracker;
        this.id = id;
        this.status = status;
    }

    @Override
    public void run() {
        try {
            tracker.updateStatus(id, status);
        } catch (IOException | NotAuthenticatedException | NotImplementedException e) {
            e.printStackTrace();
        }

        finish();
    }
}
