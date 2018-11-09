package com.faltro.houdoku.plugins.tracker;

import com.faltro.houdoku.exception.NotImplementedException;

import java.io.IOException;

/**
 * A Tracker with OAuth-based authentication.
 *
 * @see Tracker
 * @see com.faltro.houdoku.plugins.tracker
 */
public interface TrackerOAuth extends Tracker {
    /**
     * The path for authorizing the user (with DOMAIN as the prefix).
     */
    String AUTH_URL = "unimplemented_auth_url";
    /**
     * The path for receiving the user token (with DOMAIN as the prefix).
     */
    String TOKEN_URL = "unimplemented_token_url";
    /**
     * The OAuth client_id.
     */
    String CLIENT_ID = "unimplemented_client_id";
    /**
     * The OAuth client_secret.
     */
    String CLIENT_SECRET = "unimplemented_client_secret";
    /**
     * The OAuth redirect_uri.
     */
    String REDIRECT_URI = "unimplemented_redirect_uri";
    /**
     * The OAuth response_type.
     */
    String RESPONSE_TYPE = "unimplemented_response_type";

    /**
     * Generate a user-friendly URL for the user to authorize with the tracker.
     *
     * @return the full auth url
     */
    String full_auth_url();

    /**
     * Generate the user's access token.
     * <p>
     * If this method successfully retrieves a valid token,
     * {@link #isAuthenticated()} will be true.
     *
     * @param code a verification code given by the user after authorization
     * @throws NotImplementedException the operation has not yet been
     *                                 implemented for this tracker
     */
    void generate_token(String code) throws NotImplementedException, IOException;

    /**
     * Represents this Tracker as a string.
     *
     * @return the user-friendly representation of this Tracker
     */
    String toString();
}
