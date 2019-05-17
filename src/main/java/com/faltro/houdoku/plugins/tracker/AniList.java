package com.faltro.houdoku.plugins.tracker;

import com.faltro.houdoku.data.Serializer;
import com.faltro.houdoku.exception.NotAuthenticatedException;
import com.faltro.houdoku.model.Statuses;
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
    public HashMap<String, Object> getSeriesInList(String id)
            throws IOException, NotAuthenticatedException {
        if (!this.authenticated) {
            throw new NotAuthenticatedException();
        }

        String user_id = authenticatedUser().get("id").getAsString();
        JsonObject series = seriesInList(user_id, id);

        if (series == null) {
            return null;
        } else {
            return new HashMap<String, Object>() {
                private static final long serialVersionUID = 1L;
                {
                    put("title", series.get("media").getAsJsonObject().get("title").getAsJsonObject()
                            .get("romaji").getAsString());
                    put("progress", series.get("progress").getAsInt());
                    put("status", Statuses.get(series.get("status").getAsString()));
                }
            };
        }
    }

    @Override
    public void updateChaptersRead(String id, int num, boolean safe)
            throws IOException, NotAuthenticatedException {
        if (!this.authenticated) {
            throw new NotAuthenticatedException();
        }

        String user_id = authenticatedUser().get("id").getAsString();
        JsonObject series = seriesInList(user_id, id);

        // if safe mode enabled, check whether the current progress is greater than the desired
        if (safe) {
            int cur_progress = Integer.parseInt(series.get("progress").getAsString());
            if (cur_progress > num) {
                return;
            }
        }

        // @formatter:off
        final String body = "" +
                "mutation UpdateManga($listId: Int, $progress: Int) {\n" +
                "  SaveMediaListEntry (id: $listId, progress: $progress) {" +
                "    id\n" +
                "    progress\n" +
                "  }\n" +
                "}";
        // @formatter:on

        JsonObject response = post(body, new String[] {"listId", series.get("id").getAsString()},
                new String[] {"progress", Integer.toString(num)});
    }

    @Override
    public void updateStatus(String id, Status status)
            throws IOException, NotAuthenticatedException {
        if (!this.authenticated) {
            throw new NotAuthenticatedException();
        }

        String user_id = authenticatedUser().get("id").getAsString();
        JsonObject series = seriesInList(user_id, id);

        // @formatter:off
        final String body = "" +
                "mutation UpdateManga($listId: Int, $status: MediaListStatus) {\n" +
                "  SaveMediaListEntry (id: $listId, status: $status) {" +
                "    id\n" +
                "    progress\n" +
                "  }\n" +
                "}";
        // @formatter:on

        JsonObject response = post(body, new String[] {"listId", series.get("id").getAsString()},
                new String[] {"status", statuses.get(status)});
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
