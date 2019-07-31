package com.faltro.houdoku.plugins.tracker;

import com.faltro.houdoku.Houdoku;
import com.faltro.houdoku.data.Serializer;
import com.faltro.houdoku.exception.NotAuthenticatedException;
import com.faltro.houdoku.model.Statuses;
import com.faltro.houdoku.model.Track;
import com.faltro.houdoku.model.Statuses.Status;
import com.faltro.houdoku.net.KitsuInterceptor;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import okhttp3.*;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import static com.faltro.houdoku.net.Requests.GET;
import static com.faltro.houdoku.net.Requests.POST;

/**
 * This class contains implementation details for processing data from a specific "tracker" - a
 * website for users to track their reading.
 * <p>
 * For method and field documentation, please see the Tracker/TrackerOAuth classes. Additionally,
 * the implementation of some common methods is done in the GenericTrackerOAuth class.
 *
 * @see GenericTrackerOAuth
 * @see TrackerOAuth
 * @see Tracker
 */
public class Kitsu extends GenericTrackerOAuth {
    public static final int ID = 1;
    public static final String NAME = "Kitsu";
    public static final String DOMAIN = "kitsu.io";
    public static final String PROTOCOL = "https";
    public static final String TOKEN_URL = "/api/oauth/token";
    public static final String CLIENT_ID = Houdoku.getKitsuId();
    public static final String CLIENT_SECRET = Houdoku.getKitsuSecret();
    private static final String ALGOLIA_URL = "https://AWQO5J657S-dsn.algolia.net/1/indexes/production_media/query";
    private static final String ALGOLIA_APP_ID = "AWQO5J657S";
    private static final String ALGOLIA_FILTER = "&facetFilters=%5B%22kind%3Amanga%22%5D&attributesToRetrieve=%5B%22synopsis%22%2C%22canonicalTitle%22%2C%22chapterCount%22%2C%22posterImage%22%2C%22startDate%22%2C%22subtype%22%2C%22endDate%22%2C%20%22id%22%5D";
    private final KitsuInterceptor interceptor = new KitsuInterceptor();
    private final OkHttpClient client =
            new OkHttpClient().newBuilder().addInterceptor(interceptor).build();

    public Kitsu() {
    }

    public Kitsu(String access_token) {
        this.authenticated = true;
        this.setAccessToken(access_token);
    }

    @Override
    public void generateToken(String username, String password) throws IOException {
        // TODO: store refresh_token from response and add support for using it when necessary 
        FormBody.Builder body = new FormBody.Builder();
        body.add("grant_type", "password");
        body.add("client_id", CLIENT_ID);
        body.add("client_secret", CLIENT_SECRET);
        body.add("username", username);
        body.add("password", password);
        Response response = POST(client, PROTOCOL + "://" + DOMAIN + TOKEN_URL, body.build());

        JsonObject json_data = new JsonParser().parse(response.body().string()).getAsJsonObject();
        JsonElement json_access_token = json_data.get("access_token");
        if (json_access_token != null) {
            this.setAccessToken(json_access_token.getAsString());
            this.authenticated = true;
        }
    }

    @Override
    public String authenticatedUserName() throws IOException, NotAuthenticatedException {
        return authenticatedUser().get("attributes").getAsJsonObject().get("name").getAsString();
    }

    @Override
    public String search(String query) throws IOException, NotAuthenticatedException {
        Map<String, String> headers = new HashMap<>();
        headers.put("X-Algolia-Application-Id", ALGOLIA_APP_ID);
        headers.put("X-Algolia-API-Key", algoliaKey());

        JsonObject json = new JsonObject();
        json.addProperty("params", "query=" + query + ALGOLIA_FILTER);

        Response response = POST(client, ALGOLIA_URL, json.toString(), headers);
        JsonObject json_response =
                new JsonParser().parse(response.body().string()).getAsJsonObject();

        JsonObject first = json_response.get("hits").getAsJsonArray().get(0).getAsJsonObject();
        return first.get("id").getAsString();
    }

    @Override
    public String getTitle(String id) throws IOException, NotAuthenticatedException {
        Response response = GET(client, PROTOCOL + "://" + DOMAIN + "/api/edge/manga/" + id);
        JsonObject json_response =
                new JsonParser().parse(response.body().string()).getAsJsonObject();

        if (!json_response.has("errors")) {
            return json_response.get("data").getAsJsonObject().get("attributes")
                .getAsJsonObject().get("titles").getAsJsonObject().get("en").getAsString();
        }

        return "";
    }

    /**
     * Retrieve the tracker's Algolia key for performing queries.
     *
     * @return the Algolia API key
     * @throws IOException               an IOException occurred when retrieving
     * @throws NotAuthenticatedException the user is not authenticated
     */
    private String algoliaKey() throws IOException, NotAuthenticatedException {
        Response response = GET(client, PROTOCOL + "://" + DOMAIN + "/api/edge/algolia-keys/media");
        JsonObject json_response =
                new JsonParser().parse(response.body().string()).getAsJsonObject();
        return json_response.get("media").getAsJsonObject().get("key").getAsString();
    }
    
    /**
     * Retrieve a user object for the authenticated user.
     *
     * @return a JsonObject with the authenticated user's information
     * @throws IOException               an IOException occurred when retrieving
     * @throws NotAuthenticatedException the user is not authenticated
     */
    private JsonObject authenticatedUser() throws IOException, NotAuthenticatedException {
        HashMap<String, String> params = new HashMap<>();
        params.put("filter[self]", "true");
        Response response = GET(client, PROTOCOL + "://" + DOMAIN + "/api/edge/users", params);
        JsonObject json_response =
                new JsonParser().parse(response.body().string()).getAsJsonObject();

        JsonArray data = json_response.get("data").getAsJsonArray();
        return data.get(0).getAsJsonObject();
    }

    private void setAccessToken(String token) {
        this.access_token = token;
        interceptor.setToken(token);
    }
}
