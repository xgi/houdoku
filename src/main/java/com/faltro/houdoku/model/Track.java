package com.faltro.houdoku.model;

import java.util.Optional;
import com.faltro.houdoku.model.Statuses.Status;

/**
 * An entry for a series in the user's list on a Tracker.
 * 
 * Track instances should not be passed between different Tracker implementations. The fields each
 * implementation provides the Track instance, and the ones it expects, can vary significantly.
 * 
 * The Track instance does not necessarily have to reflect an existing entry in the Tracker. A
 * Track instance is generally created using "desired" information which can be passed to Tracker
 * methods to add or update the entry.
 * 
 * This class is primarily a utility class to replace the use of HashMap's -- it does not by itself
 * offer much functionality.
 */
public class Track {
    private final String mediaId;
    private final String listId;
    private final String title;
    private final Integer progress;
    private final Status status;

    public Track(String mediaId, String listId, String title, Integer progress, Status status) {
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

    public Integer getProgress() {
        return progress;
    }

    public String getTitle() {
        return title;
    }
}
