package com.faltro.houdoku.plugins.info;

import com.faltro.houdoku.data.Serializer;
import com.faltro.houdoku.model.Series;
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import javafx.scene.image.Image;
import okhttp3.Response;

import java.io.IOException;

import static com.faltro.houdoku.net.Requests.POST;
import static com.faltro.houdoku.net.Requests.imageFromURL;

/**
 * This class contains implementation details for processing data from a
 * specific "info source" - a website which contains generic series information
 * and media.
 * <p>
 * For method and field documentation, please see the InfoSource class.
 * Additionally, the implementation of some common methods is done in the
 * GenericInfoSource class.
 *
 * @see GenericInfoSource
 * @see InfoSource
 */
public class AniList extends GenericInfoSource {
    public static final int ID = 0;
    public static final String NAME = "AniList";
    public static final String DOMAIN = "anilist.co";
    public static final String PROTOCOL = "https";

    @Override
    public Image banner(Series series) throws IOException {
        final String banner_request_body = "query ($q: String) {\n" +
                "  Media (search: $q, type: MANGA, format_not_in: [NOVEL]) {\n" +
                "    id\n" +
                "    bannerImage\n" +
                "  }\n" +
                "}";

        JsonObject json_root = new JsonObject();
        JsonObject json_variables = new JsonObject();
        json_variables.add("q", Serializer.gson.toJsonTree(series.getTitle()));
        json_root.add("query", Serializer.gson.toJsonTree(banner_request_body));
        json_root.add("variables", json_variables);

        Response response = POST(client, PROTOCOL + "://graphql." + DOMAIN, json_root.toString());
        JsonObject json_response = new JsonParser().parse(response.body().string())
                .getAsJsonObject();
        JsonObject json_data = json_response.get("data").getAsJsonObject();

        Image result = null;
        if (json_data.get("Media").getClass() != JsonNull.class) {
            JsonObject json_media = json_data.get("Media").getAsJsonObject();
            // if Media is not null, id must exist
            series.setInfoSourceId(json_media.get("id").getAsString());
            // bannerImage is not guaranteed to be non-null
            if (json_media.get("bannerImage").getClass() != JsonNull.class) {
                String banner_source = json_media.get("bannerImage").getAsString();
                result = imageFromURL(client, banner_source);
            }
        }

        return result;
    }
}
