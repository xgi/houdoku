package com.faltro.houdoku.plugins.tracker;

import com.faltro.houdoku.exception.NotAuthenticatedException;
import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.model.Track;
import okhttp3.OkHttpClient;
import java.io.IOException;

/**
 * A tracker is a website for users to individually track their manga/comic lists. These websites
 * generally hold a database of series' with extensive information for each. Users can create a
 * 'list' of series' that they are interested in, generally also being able to categorize them in
 * various ways (i.e. "Reading", "Planning", "Completed"). Users are also able to record the number
 * of chapters from each series that they have read.
 * <p>
 * For this client, we want users to link with a tracker and have their lists be automatically
 * updated. When they read a chapter in the client, their list should be updated. One of the primary
 * difficulties faced here is that tracker websites often store series' under different
 * names/titles. It is unfortunately necessary that we create an interface for the user to manually
 * search each database in order to link it with a Series in their Library.
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
    String NAME = "UnimplementedTracker";
    /**
     * The domain of the Tracker.
     */
    String DOMAIN = "example.com";
    /**
     * The protocol for the Tracker, which is likely either http or https.
     */
    String PROTOCOL = "https";

    /**
     * Determine whether the tracker is currently supported, since client can run without API creds.
     * 
     * @return whether or not the tracker is supported
     */
    boolean isSupported();

    /**
     * @return whether or not the user is authenticated
     */
    boolean isAuthenticated();

    /**
     * Verify whether the client is actually authenticated with the server, regardless of a cached
     * `authenticated` property.
     * <p>
     * The {@link #isAuthenticated()} property is updated, if necessary.
     * <p>
     * This function is particularly useful to check whether any access token is still valid after
     * the client was restarted.
     *
     * @throws NotImplementedException the operation has not yet been implemented for this tracker
     * @throws IOException             an IOException occurred when checking
     */
    void verifyAuthenticated() throws NotImplementedException, IOException;

    /**
     * Retrieve the name of the authenticated user.
     * <p>
     * Requires {@link #isAuthenticated()}.
     *
     * @return the name of the authenticated user
     * @throws NotImplementedException   the operation has not yet been implemented for this tracker
     * @throws NotAuthenticatedException the user is not authenticated
     * @throws IOException               an IOException occurred when retrieving
     */
    String authenticatedUserName()
            throws NotImplementedException, NotAuthenticatedException, IOException;

    /**
     * Search for a series and retrieve the first result.
     *
     * @param query the search query
     * @return the series_id of the first series result, or null if none found
     * @throws NotImplementedException   the operation has not yet been implemented for this tracker
     * @throws NotAuthenticatedException the user is not authenticated
     * @throws IOException               an IOException occurred when updating
     */
    String search(String query)
            throws NotImplementedException, NotAuthenticatedException, IOException;

    /**
     * Retrieve the title for a series on the tracker.
     *
     * @param id the series id
     * @return the title of the series
     * @throws NotImplementedException   the operation has not yet been implemented for this tracker
     * @throws NotAuthenticatedException the user is not authenticated
     * @throws IOException               an IOException occurred when updating
     */
    String getTitle(String id)
            throws NotImplementedException, NotAuthenticatedException, IOException;

    /**
     * Retrieve details about a series in the user's list.
     *
     * @param id the series id
     * @return a Track instance for the series in the user's list if it is within, else null
     * @throws NotImplementedException   the operation has not yet been implemented for this tracker
     * @throws NotAuthenticatedException the user is not authenticated
     * @throws IOException               an IOException occurred when updating
     */
    Track getSeriesInList(String id)
            throws NotImplementedException, NotAuthenticatedException, IOException;

    /**
     * Add or update an entry for a series in the user's list.
     * 
     * If "safe" is true: If the user's number read is greater than the given value, the number on
     * the tracker is not changed.
     *
     * @param id      the series id
     * @param track   a Track instance with the desired fields to modify
     * @param safe    whether to avoid decreasing number from the tracker (see above description)
     * @param can_add whether to add the series to the user's list if not already in it
     * @throws NotImplementedException   the operation has not yet been implemented for this tracker
     * @throws NotAuthenticatedException the user is not authenticated
     * @throws IOException               an IOException occurred when updating
     */
    void update(String id, Track track, boolean safe, boolean can_add)
            throws NotImplementedException, NotAuthenticatedException, IOException;

    /**
     * Retrieve the client for making HTTP requests, which may be built with applicable
     * interceptors.
     *
     * @return an OkHttpClient for making requests to this Tracker
     */
    OkHttpClient getClient();

    /**
     * Represents this Tracker as a string.
     *
     * @return the user-friendly representation of this Tracker
     */
    String toString();
}
