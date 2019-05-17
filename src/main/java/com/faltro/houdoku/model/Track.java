package com.faltro.houdoku.model;

import com.faltro.houdoku.model.Statuses.Status;

/**
 * An entry for a series in the user's list on a Tracker.
 * 
 * Track instances should not be passed between different Tracker implementations. The fields each
 * implementation provides the Track instance, and the ones it expects, can vary significantly.
 * 
 * This class is primarily a utility class to replace the use of HashMap's -- it does not by itself
 * offer much functionality.
 */
public class Track {
    private final String mediaId;
    private final String listId;
    private final String title;
    private final int progress;
    private final Status status;

    public Track(String mediaId, String listId, String title, int progress, Status status) {
        this.mediaId = mediaId;
        this.listId = listId;
        this.title = title;
        this.progress = progress;
        this.status = status;
    }

    public String getListId() {
        return listId;
    }

    public String getMediaId() {
        return mediaId;
    }

    public Status getStatus() {
        return status;
    }

    public int getProgress() {
        return progress;
    }

    public String getTitle() {
        return title;
    }
}
