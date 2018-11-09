package com.faltro.houdoku.plugins.tracker;

import com.faltro.houdoku.exception.NotImplementedException;

import java.io.IOException;

/**
 * This class contains implementations for some methods from TrackerOAuth that
 * are expected to be common between most OAuth-based tracker plugins.
 * <p>
 * For method and field documentation, please see the TrackerOAuth class.
 *
 * @see TrackerOAuth
 */
public class GenericTrackerOAuth implements TrackerOAuth {
    public static final int ID = -1;
    public static final String NAME = "GenericTrackerOAuth";
    public static final String DOMAIN = "example.com";
    public static final String PROTOCOL = "https";
    public static final String AUTH_URL = "default_auth_url";
    public static final String TOKEN_URL = "default_token_url";
    public static final String CLIENT_ID = "default_client_id";
    public static final String CLIENT_SECRET = "default_client_secret";
    public static final String REDIRECT_URI = "default_redirect_uri";
    public static final String RESPONSE_TYPE = "default_response_type";

    boolean authenticated = false;
    String access_token = null;

    @Override
    public String full_auth_url() {
        try {
            String protocol = this.getClass().getField("PROTOCOL").get(null).toString();
            String domain = this.getClass().getField("DOMAIN").get(null).toString();
            String auth_url = this.getClass().getField("AUTH_URL").get(null).toString();
            String client_id = this.getClass().getField("CLIENT_ID").get(null).toString();
            String redirect_uri = this.getClass().getField("REDIRECT_URI").get(null).toString();
            String response_type = this.getClass().getField("RESPONSE_TYPE").get(null).toString();
            return String.format("%s://%s%s?client_id=%s&redirect_uri=%s&response_type=%s",
                    protocol,
                    domain,
                    auth_url,
                    client_id,
                    redirect_uri,
                    response_type
            );
        } catch (NoSuchFieldException | IllegalAccessException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public void generate_token(String code) throws NotImplementedException, IOException {
        throw new NotImplementedException();
    }

    @Override
    public boolean isAuthenticated() {
        return authenticated;
    }

    @Override
    public void updateChaptersRead(String id, int num) throws NotImplementedException {
        throw new NotImplementedException();
    }
}
