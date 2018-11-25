package com.faltro.houdoku.plugins.tracker;

import com.faltro.houdoku.data.Serializer;
import com.faltro.houdoku.exception.NotAuthenticatedException;
import com.faltro.houdoku.net.AniListInterceptor;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import okhttp3.FormBody;
import okhttp3.Interceptor;
import okhttp3.OkHttpClient;
import okhttp3.Response;

import java.io.IOException;

import static com.faltro.houdoku.net.Requests.POST;

/**
 * This class contains implementation details for processing data from a
 * specific "tracker" - a website for users to track their reading.
 * <p>
 * For method and field documentation, please see the Tracker/TrackerOAuth
 * classes. Additionally, the implementation of some common methods is done in
 * the GenericTrackerOAuth class.
 *
 * @see GenericTrackerOAuth
 * @see TrackerOAuth
 * @see Tracker
 */
public class AniList extends GenericTrackerOAuth {
    public static final int ID = 0;
    public static final String NAME = "AniList";
    public static final String DOMAIN = "anilist.co";
    public static final String PROTOCOL = "https";
    public static final String AUTH_URL = "/api/v2/oauth/authorize";
    public static final String TOKEN_URL = "/api/v2/oauth/token";
    public static final String CLIENT_ID = "1320";
    public static final String CLIENT_SECRET = "CiUjj1Q0YkcIZZkEcWLCgzgNJTGolgOtVMnxGOjd";
    public static final String REDIRECT_URI = "https://anilist.co/api/v2/oauth/pin";
    public static final String RESPONSE_TYPE = "code";
    private final AniListInterceptor interceptor = new AniListInterceptor();
    private final OkHttpClient client =
            new OkHttpClient().newBuilder().addInterceptor(interceptor).build();

    @Override
    public void generateToken(String code) throws IOException {
        FormBody.Builder body = new FormBody.Builder();
        body.add("grant_type", "authorization_code");
        body.add("client_id", CLIENT_ID);
        body.add("client_secret", CLIENT_SECRET);
        body.add("redirect_uri", REDIRECT_URI);
        body.add("code", code);
        Response response = POST(client, PROTOCOL + "://" + DOMAIN + TOKEN_URL, body.build());

        JsonObject json_data = new JsonParser().parse(response.body().string())
                .getAsJsonObject();
        JsonElement json_access_token = json_data.get("access_token");
        if (json_access_token != null) {
            this.setAccessToken(json_access_token.getAsString());
            this.authenticated = true;
        }
    }

    /**
     * Make an HTTP POST request to the tracker's API.
     *
     * @param body      the JSON-formatted body of the request
     * @param variables an array of [key, value] pairs
     * @return a JsonObject of the response
     * @throws IOException               an IOException occurred when making the request
     * @throws NotAuthenticatedException the user is not authenticated
     */
    private JsonObject post(String body, String[]... variables) throws IOException,
            NotAuthenticatedException {
        if (!this.authenticated) {
            throw new NotAuthenticatedException();
        }

        JsonObject json_root = new JsonObject();
        JsonObject json_variables = new JsonObject();
        for (String[] pair : variables) {
            json_variables.add(pair[0], Serializer.gson.toJsonTree(pair[1]));
        }
        json_root.add("query", Serializer.gson.toJsonTree(body));
        json_root.add("variables", json_variables);

        Response response = POST(client, PROTOCOL + "://graphql." + DOMAIN, json_root.toString());
        JsonObject json_response = new JsonParser().parse(response.body().string())
                .getAsJsonObject();
        return json_response.get("data").getAsJsonObject();
    }

    private JsonObject getAuthenticatedUser() throws IOException, NotAuthenticatedException {
        if (!this.authenticated) {
            throw new NotAuthenticatedException();
        }

        final String body = "" +
                "query User {\n" +
                "  Viewer {" +
                "    id\n" +
                "    name\n" +
                "    mediaListOptions {\n" +
                "      scoreFormat\n" +
                "    }\n" +
                "  }\n" +
                "}";

        JsonObject response = post(body);
        return response.get("Viewer").getAsJsonObject();
    }

    public String authenticatedUserName() throws IOException, NotAuthenticatedException {
        return getAuthenticatedUser().get("name").getAsString();
    }

    private void setAccessToken(String token) {
        this.access_token = token;
        interceptor.setToken(token);
    }
}
