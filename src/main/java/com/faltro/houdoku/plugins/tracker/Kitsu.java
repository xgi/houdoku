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
import static com.faltro.houdoku.net.Requests.PATCH;

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
    private final HashMap<Status, String> statuses = new HashMap<Status, String>() {
        private static final long serialVersionUID = 1L;
        {
            put(Status.READING, "current");
            put(Status.PLANNING, "planned");
            put(Status.COMPLETED, "completed");
            put(Status.DROPPED, "dropped");
            put(Status.PAUSED, "on_hold");
            put(Status.REREADING, "current");
        }
    };

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
                .getAsJsonObject().get("canonicalTitle").getAsString();
        }

        return "";
    }

    @Override
    public Track getSeriesInList(String id) throws IOException, NotAuthenticatedException {
        if (!this.authenticated) {
            throw new NotAuthenticatedException();
        }

        HashMap<String, String> params = new HashMap<>();
        params.put("filter[manga_id]", id);
        params.put("filter[user_id]", authenticatedUser().get("id").getAsString());
        params.put("include", "manga");
        Response response = GET(client, PROTOCOL + "://" + DOMAIN + "/api/edge/library-entries",
                params);
        JsonObject json_response =
                new JsonParser().parse(response.body().string()).getAsJsonObject();

        JsonArray data = json_response.get("data").getAsJsonArray();
        if (data.size() > 0) {
            JsonObject entry = data.get(0).getAsJsonObject();
            JsonObject included = 
                    json_response.get("included").getAsJsonArray().get(0).getAsJsonObject();
            String listId = entry.get("id").getAsString();
            String title = included.get("attributes").getAsJsonObject()
                    .get("canonicalTitle").getAsString();
            int progress = entry.get("attributes").getAsJsonObject().get("progress").getAsInt();
            Status status = Statuses.get(
                entry.get("attributes").getAsJsonObject().get("status").getAsString());
            JsonElement rating = entry.get("attributes").getAsJsonObject().get("ratingTwenty");
            int score = rating.isJsonNull() ? 0 : rating.getAsInt() * 5;

            return new Track(id, listId, title, progress, status, score);
        }

        return null;
    }

    @Override
    public void update(String id, Track track, boolean safe, boolean can_add)
            throws IOException, NotAuthenticatedException {
        if (!this.authenticated) {
            throw new NotAuthenticatedException();
        }

        Track track_old = getSeriesInList(id);

        if (track_old == null) {
            if (!can_add) {
                // series isn't in the user's list and we aren't allowed to add it, so do nothing
                return;
            }
            // The series doesn't exist in the list, so add it. That method doesn't set any
            // properties (i.e. progress or status), so we'll continue with this method to do an
            // update request as well
            track_old = add(id);
        }

        Status status = track.getStatus() == null ? track_old.getStatus() : track.getStatus();
        int progress = track.getProgress() == null ? track_old.getProgress() : track.getProgress();
        int score = track.getScore() == null ? track_old.getScore() : track.getScore();

        // in safe mode, only update progress if current progress is greater than the desired
        if (safe) {
            Integer progress_old = track_old.getProgress();
            Integer progress_new = track.getProgress();
            if (progress_old != null && progress_new != null) {
                if (progress_old > progress_new) {
                    progress = progress_old;
                }
            }
        }

        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/vnd.api+json");

        JsonObject json_attributes = new JsonObject();
        json_attributes.addProperty("status", statuses.get(status));
        json_attributes.addProperty("progress", progress);
        json_attributes.addProperty("ratingTwenty", score / 5);

        JsonObject json_content = new JsonObject();
        json_content.addProperty("type", "libraryEntries");
        json_content.addProperty("id", track_old.getListId());
        json_content.add("attributes", json_attributes);

        JsonObject json = new JsonObject();
        json.add("data", json_content);

        PATCH(client, PROTOCOL + "://" + DOMAIN + "/api/edge/library-entries/"
                + track_old.getListId(), json.toString(), headers,
                MediaType.parse("application/vnd.api+json; charset=utf-8"));
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
        if (!this.authenticated) {
            throw new NotAuthenticatedException();
        }
        
        HashMap<String, String> params = new HashMap<>();
        params.put("filter[self]", "true");
        Response response = GET(client, PROTOCOL + "://" + DOMAIN + "/api/edge/users", params);
        JsonObject json_response =
                new JsonParser().parse(response.body().string()).getAsJsonObject();

        JsonArray data = json_response.get("data").getAsJsonArray();
        return data.get(0).getAsJsonObject();
    }

    /**
     * Add an entry for a series to the user's list.
     * 
     * This method should only be run if the series is known to not exist in the user's list.
     *
     * @param id the series id
     * @return a Track instance for the series in the user's list
     * @throws NotImplementedException   the operation has not yet been implemented for this tracker
     * @throws NotAuthenticatedException the user is not authenticated
     * @throws IOException               an IOException occurred when updating
     */
    private Track add(String id) throws NotAuthenticatedException, IOException {
        Map<String, String> headers = new HashMap<>();
        headers.put("Content-Type", "application/vnd.api+json");

        JsonObject json_user_data = new JsonObject();
        json_user_data.addProperty("id", authenticatedUser().get("id").getAsString());
        json_user_data.addProperty("type", "users");
        JsonObject json_user = new JsonObject();
        json_user.add("data", json_user_data);

        JsonObject json_media_data = new JsonObject();
        json_media_data.addProperty("id", id);
        json_media_data.addProperty("type", "manga");
        JsonObject json_media = new JsonObject();
        json_media.add("data", json_media_data);

        JsonObject json_attributes = new JsonObject();
        json_attributes.addProperty("status", statuses.get(Statuses.Status.PLANNING));
        json_attributes.addProperty("progress", 0);

        JsonObject json_relationships = new JsonObject();
        json_relationships.add("user", json_user);
        json_relationships.add("media", json_media);

        JsonObject json_content = new JsonObject();
        json_content.addProperty("type", "libraryEntries");
        json_content.add("attributes", json_attributes);
        json_content.add("relationships", json_relationships);

        JsonObject json = new JsonObject();
        json.add("data", json_content);

        POST(client, PROTOCOL + "://" + DOMAIN + "/api/edge/library-entries", json.toString(),
                headers, MediaType.parse("application/vnd.api+json; charset=utf-8"));
        return getSeriesInList(id);
    }

    private void setAccessToken(String token) {
        this.access_token = token;
        interceptor.setToken(token);
    }
}
