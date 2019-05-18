package com.faltro.houdoku.model;

import com.faltro.houdoku.model.Statuses.Status;

/**
 * An entry for a series in the user's list on a Tracker.
 * 
 * Track instances should not be passed between different Tracker implementations. The fields each
 * implementation provides the Track instance, and the ones it expects, can vary significantly.
 * 
 * The Track instance does not necessarily have to reflect an existing entry in the Tracker. A Track
 * instance is generally created using "desired" information which can be passed to Tracker methods
 * to add or update the entry.
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
    private final Integer score;

    /**
     * Default constructor.
     * 
     * All fields are nullable.
     * 
     * @param mediaId  the id of the series on the tracker. If the tracker only provides one ID, use
     *                 this field
     * @param listId   the id of the entry for the series in the user's list
     * @param title    the user-friendly title of the series on the tracker. Don't use CJK
     *                 characters; romanized form is preferred
     * @param progress the number of chapters the user has read of the series
     * @param status   the user's reading Status for the series
     * @param score    the user's 0-100 score of the series
     */
    public Track(String mediaId, String listId, String title, Integer progress, Status status,
            Integer score) {
        this.mediaId = mediaId;
        this.listId = listId;
        this.title = title;
        this.progress = progress;
        this.status = status;
        this.score = score;
    }

    public String getMediaId() {
        return mediaId;
    }

    public String getListId() {
        return listId;
    }

    public String getTitle() {
        return title;
    }

    public Integer getProgress() {
        return progress;
    }

    public Status getStatus() {
        return status;
    }

    public Integer getScore() {
        return score;
    }
}
