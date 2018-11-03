package com.faltro.houdoku.plugins.tracker;

/**
 * TODO: write a description for this class
 *
 * @see com.faltro.houdoku.plugins.tracker
 */
public interface Tracker {
    /**
     * The unique identifier for the Tracker.
     */
    int ID = -1;
    /**
     * The user-friendly name of the Tracker.
     */
    String NAME = "UnimplementedInfoSource";
    /**
     * The domain of the Tracker.
     */
    String DOMAIN = "example.com";
    /**
     * The protocol for the Tracker, which is likely either http or https.
     */
    String PROTOCOL = "https";

    /**
     * @return whether or not the user is authenticated
     */
    boolean isAuthenticated();

    /**
     * Represents this InfoSource as a string.
     *
     * @return the user-friendly representation of this InfoSource
     */
    String toString();
}
