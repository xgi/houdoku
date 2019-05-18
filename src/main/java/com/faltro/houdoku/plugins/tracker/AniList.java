package com.faltro.houdoku.plugins.tracker;

import com.faltro.houdoku.data.Serializer;
import com.faltro.houdoku.exception.NotAuthenticatedException;
import com.faltro.houdoku.model.Statuses;
import com.faltro.houdoku.model.Track;
import com.faltro.houdoku.model.Statuses.Status;
import com.faltro.houdoku.net.AniListInterceptor;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import okhttp3.FormBody;
import okhttp3.OkHttpClient;
import okhttp3.Response;
import java.io.IOException;
import java.util.HashMap;
import java.util.Optional;
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
    private final HashMap<Status, String> statuses = new HashMap<Status, String>() {
        private static final long serialVersionUID = 1L;
        {
            put(Status.READING, "CURRENT");
            put(Status.PLANNING, "PLANNING");
            put(Status.COMPLETED, "COMPLETED");
            put(Status.DROPPED, "DROPPED");
            put(Status.PAUSED, "PAUSED");
            put(Status.REREADING, "REPEATING");
        }
    };

    public AniList() {
    }

    public AniList(String access_token) {
        this.authenticated = true;
        this.setAccessToken(access_token);
    }

    @Override
    public void generateToken(String code) throws IOException {
        FormBody.Builder body = new FormBody.Builder();
        body.add("grant_type", "authorization_code");
        body.add("client_id", CLIENT_ID);
        body.add("client_secret", CLIENT_SECRET);
        body.add("redirect_uri", REDIRECT_URI);
        body.add("code", code);
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
        return authenticatedUser().get("name").getAsString();
    }

    @Override
    public String search(String query) throws IOException, NotAuthenticatedException {
        // @formatter:off
        final String body = "" +
                "query ($search: String) {\n" +
                "  Media (search: $search, type: MANGA) {" +
                "    id\n" +
                "    title {\n" +
                "      romaji\n" +
                "    }\n" +
                "  }\n" +
                "}";
        // @formatter:on

        JsonObject response = post(body, new String[] {"search", query});

        JsonElement media = response.get("Media");
        if (media.isJsonNull()) {
            return null;
        } else {
            return media.getAsJsonObject().get("id").getAsString();
        }
    }

    @Override
    public String getTitle(String id) throws IOException, NotAuthenticatedException {
        // @formatter:off
        final String body = "" +
            "query ($id: Int) {\n" +
            "  Media (id: $id, type: MANGA) {" +
            "    title {\n" +
            "      romaji\n" +
            "    }\n" +
            "  }\n" +
            "}";
        // @formatter:on

        JsonObject response = post(body, new String[] {"id", id});

        JsonElement media = response.get("Media");
        if (media.isJsonNull()) {
            return "";
        } else {
            return media.getAsJsonObject().get("title").getAsJsonObject().get("romaji")
                    .getAsString();
        }
    }

    @Override
    public Track getSeriesInList(String id) throws IOException, NotAuthenticatedException {
        if (!this.authenticated) {
            throw new NotAuthenticatedException();
        }

        String user_id = authenticatedUser().get("id").getAsString();
        JsonObject series = seriesInList(user_id, id);

        if (series == null) {
            return null;
        } else {
            JsonObject json_media = series.get("media").getAsJsonObject();
            String mediaId = json_media.get("id").getAsString();
            String title = json_media.get("title").getAsJsonObject().get("romaji").getAsString();
            String listId = series.get("id").getAsString();
            int progress = series.get("progress").getAsInt();
            Status status = Statuses.get(series.get("status").getAsString());
            int score = series.get("scoreRaw").getAsInt();

            return new Track(mediaId, listId, title, progress, status, score);
        }
    }

    @Override
    public void update(String id, Track track, boolean safe)
            throws IOException, NotAuthenticatedException {
        if (!this.authenticated) {
            throw new NotAuthenticatedException();
        }

        Track track_old = getSeriesInList(id);

        if (track_old == null) {
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

        // @formatter:off
        final String body = "" +
                "mutation UpdateManga($listId: Int, $progress: Int, $status: MediaListStatus, $scoreRaw: Int) {\n" +
                "  SaveMediaListEntry (id: $listId, progress: $progress, status: $status, scoreRaw: $scoreRaw) {" +
                "    id\n" +
                "    progress\n" +
                "  }\n" +
                "}";
        // @formatter:on

        post(body, new String[] {"listId", track_old.getListId()},
                new String[] {"progress", String.valueOf(progress)},
                new String[] {"status", statuses.get(status)},
                new String[] {"scoreRaw", String.valueOf(score)});
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
    private JsonObject post(String body, String[]... variables)
            throws IOException, NotAuthenticatedException {
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
        JsonObject json_response =
                new JsonParser().parse(response.body().string()).getAsJsonObject();
        System.out.println(json_response);
        return json_response.get("data").getAsJsonObject();
    }

    /**
     * Retrieve a user object for the authenticated user.
     *
     * @return a JsonObject with the authenticated user's information
     * @throws IOException               an IOException occurred when retrieving
     * @throws NotAuthenticatedException the user is not authenticated
     */
    private JsonObject authenticatedUser() throws IOException, NotAuthenticatedException {
        // @formatter:off
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
        // @formatter:on

        JsonObject response = post(body);
        JsonElement viewer = response.get("Viewer");

        if (viewer.isJsonNull()) {
            this.authenticated = false;
            throw new NotAuthenticatedException();
        }

        return viewer.getAsJsonObject();
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
        // @formatter:off
        final String body = "" +
                "mutation AddManga($mediaId: Int) {\n" +
                "  SaveMediaListEntry (mediaId: $mediaId) {" +
                "    mediaId\n" +
                "  }\n" +
                "}";
        // @formatter:on

        post(body, new String[] {"mediaId", id});
        return getSeriesInList(id); // not ideal to have an extra page request here
    }

    /**
     * Retrieve a user-specific series in the authenticated user's list.
     *
     * @param user_id  the user's id
     * @param manga_id the series id
     * @return the series in the user's list if it is within, else null
     * @throws IOException               an IOException occurred when retrieving
     * @throws NotAuthenticatedException the user is not authenticated
     */
    private JsonObject seriesInList(String user_id, String manga_id)
            throws IOException, NotAuthenticatedException {
        // @formatter:off
        final String body = "" +
                "query ($id: Int!, $manga_id: Int!) {\n" +
                "  Page {" +
                "    mediaList(userId: $id, type: MANGA, mediaId: $manga_id) {\n" +
                "      id\n" +
                "      status\n" +
                "      scoreRaw: score(format: POINT_100)\n" +
                "      progress\n" +
                "      media {\n" +
                "        id\n" +
                "        title {\n" +
                "          romaji\n" +
                "        }\n" +
                "      }\n" +
                "    }\n" +
                "  }\n" +
                "}";
        // @formatter:on

        JsonObject response =
                post(body, new String[] {"id", user_id}, new String[] {"manga_id", manga_id});

        JsonElement page = response.get("Page");
        if (page.isJsonNull()) {
            return null;
        } else {
            JsonArray results = page.getAsJsonObject().get("mediaList").getAsJsonArray();
            return results.size() == 0 ? null : results.get(0).getAsJsonObject();
        }
    }

    private void setAccessToken(String token) {
        this.access_token = token;
        interceptor.setToken(token);
    }
}
