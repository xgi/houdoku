package com.faltro.houdoku.plugins.content;

import com.faltro.houdoku.exception.ContentUnavailableException;
import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.util.ParseHelpers;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import javafx.scene.image.Image;
import okhttp3.Response;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;

import static com.faltro.houdoku.net.Requests.*;

/**
 * This class contains implementation details for processing data from a
 * specific "content source" - a website which contains series data and images.
 * <p>
 * For method and field documentation, please see the ContentSource class.
 * Additionally, the implementation of some common methods is done in the
 * GenericContentSource class.
 *
 * @see GenericContentSource
 * @see com.faltro.houdoku.util.ContentSource
 */
public class MangaDex extends GenericContentSource {
    public static final int ID = 0;
    public static final String NAME = "MangaDex";
    public static final String DOMAIN = "mangadex.org";
    public static final String PROTOCOL = "https";

    @Override
    public ArrayList<HashMap<String, Object>> search(String query) throws IOException {
        Document document = parse(GET(PROTOCOL + "://" + DOMAIN + "/?page=search&title=" + query));

        ArrayList<HashMap<String, Object>> data_arr = new ArrayList<>();
        Elements links = document.select("a[class*=manga_title]");
        for (Element link : links) {
            String linkHref = link.attr("href");
            String source = linkHref.substring(0, linkHref.lastIndexOf("/"));
            String title = link.text();
            Element parentDiv = link.parent().parent();
            String coverSrc = parentDiv.selectFirst("img").attr("src");
            String rating = parentDiv.selectFirst("span[title=Rating]").parent().text();
            String follows = parentDiv.selectFirst("span[title=Follows]").parent().text();
            String views = parentDiv.selectFirst("span[title=Views]").parent().text();

            String details = title + "\n★" + rating + "/10\n" + views + " views, " + follows +
                    " follows";

            HashMap<String, Object> content = new HashMap<>();
            content.put("contentSourceId", ID);
            content.put("source", source);
            content.put("coverSrc", PROTOCOL + "://" + DOMAIN + coverSrc);
            content.put("title", title);
            content.put("details", details);

            data_arr.add(content);
        }
        return data_arr;
    }

    @Override
    public ArrayList<Chapter> chapters(Series series) throws IOException {
        String id_str = series.getSource().split("/")[2];
        Response response = GET(PROTOCOL + "://" + DOMAIN + "/api/manga/" + id_str);
        JsonObject json_data = new JsonParser().parse(response.body().string())
                .getAsJsonObject();
        JsonObject json_chapters = json_data.get("chapter").getAsJsonObject();

        ArrayList<Chapter> chapters = new ArrayList<>();
        for (Map.Entry<String, JsonElement> chapter : json_chapters.entrySet()) {
            JsonObject json_chapter = chapter.getValue().getAsJsonObject();

            String source = "/chapter/" + chapter.getKey();
            String title = json_chapter.get("title").getAsString();
            double chapterNum = ParseHelpers.parseDouble(json_chapter.get("chapter").getAsString());
            int volumeNum = ParseHelpers.parseInt(json_chapter.get("volume").getAsString());
            String language = json_chapter.get("lang_code").getAsString();
            String group = json_chapter.get("group_name").getAsString();
            LocalDateTime localDateTime = LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(json_chapter.get("timestamp").getAsLong()),
                    TimeZone.getDefault().toZoneId()
            );

            HashMap<String, Object> metadata = new HashMap<>();
            metadata.put("chapterNum", chapterNum);
            metadata.put("volumeNum", volumeNum);
            metadata.put("language", language);
            metadata.put("group", group);
            metadata.put("localDateTime", localDateTime);

            chapters.add(new Chapter(series, title, source, metadata));
        }

        return chapters;
    }

    @Override
    public Series series(String source, boolean quick) throws IOException {
        Document seriesDocument = parse(GET(PROTOCOL + "://" + DOMAIN + source));

        Element titlePanel = seriesDocument.selectFirst("h6");
        String title = titlePanel.ownText();
        String language = titlePanel.selectFirst("img").attr("title");

        Element contentContainer = seriesDocument.selectFirst("div[class=card-body p-0]");
        String imageSource = contentContainer.selectFirst("img[class=rounded]").attr("src");
        Image cover = imageFromURL(PROTOCOL + "://" + DOMAIN + imageSource,
                ParseHelpers.COVER_MAX_WIDTH);

        Element metadataContainer = contentContainer.selectFirst(
                "div[class=col-xl-9 col-lg-8 col-md-7]");
        Element rowAltNames = metadataContainer.selectFirst(
                "div:containsOwn(Alt name)").parent().select("div").get(2);
        Element rowAuthor = metadataContainer.selectFirst(
                "div:containsOwn(Author)").parent().select("div").get(2);
        Element rowArtist = metadataContainer.selectFirst(
                "div:containsOwn(Artist)").parent().select("div").get(2);
        Element rowGenres = metadataContainer.selectFirst(
                "div:containsOwn(Genres)").parent().select("div").get(2);
        Element rowRating = metadataContainer.selectFirst(
                "div:containsOwn(Rating)").parent().select("div").get(2);
        Element rowStatus = metadataContainer.selectFirst(
                "div:containsOwn(Pub. status)").parent().select("div").get(2);
        Element rowStats = metadataContainer.selectFirst(
                "div:containsOwn(Stats)").parent().select("div").get(2);
        Element rowDescription = metadataContainer.selectFirst(
                "div:containsOwn(Description)").parent().select("div").get(2);

        String[] altNames = ParseHelpers.htmlListToStringArray(rowAltNames.selectFirst("ul"));
        String author = rowAuthor.selectFirst("a").text();
        String artist = rowArtist.selectFirst("a").text();
        String[] genres = ParseHelpers.htmlListToStringArray(rowGenres, "span");
        double rating = ParseHelpers.parseDouble(
                rowRating.selectFirst("span[title=Rating]").parent().text());
        int ratings = ParseHelpers.parseInt(
                rowRating.selectFirst("span[title=Users]").parent().text());
        String status = rowStatus.text();
        int views = ParseHelpers.parseInt(rowStats.selectFirst("span[title=Views]")
                .parent().text());
        int follows = ParseHelpers.parseInt(rowStats.selectFirst("span[title=Follows]")
                .parent().text());
        String description = rowDescription.text();

        HashMap<String, Object> metadata = new HashMap<>();
        metadata.put("language", language);
        metadata.put("author", author);
        metadata.put("artist", artist);
        metadata.put("status", status);
        metadata.put("altNames", altNames);
        metadata.put("description", description);
        metadata.put("views", views);
        metadata.put("follows", follows);
        metadata.put("rating", rating);
        metadata.put("ratings", ratings);
        metadata.put("genres", genres);

        Series series = new Series(title, source, cover, ID, metadata);
        series.setChapters(chapters(series));
        return series;
    }

    @Override
    public Image image(Chapter chapter, int page) throws IOException, ContentUnavailableException {
        Image result = null;

        if (chapter.imageUrlTemplate != null) {
            result = imageFromURL(String.format(chapter.imageUrlTemplate, page));
        } else {
            Response response = GET(PROTOCOL + "://" + DOMAIN + "/api" + chapter.getSource());
            JsonObject json_data = new JsonParser().parse(response.body().string())
                    .getAsJsonObject();

            String status = json_data.get("status").getAsString();
            if (status.equals("OK")) {
                JsonArray pages = json_data.get("page_array").getAsJsonArray();

                chapter.images = new Image[pages.size()];
                chapter.imageUrlTemplate = json_data.get("server").getAsString() +
                        json_data.get("hash").getAsString() + "/" +
                        (pages.get(page - 1).getAsString().replace("1", "%s"));

                // rerun the method, but we should now match chapter.iUT != null
                result = image(chapter, page);
            } else if (status.equals("delayed")) {
                String group_website = json_data.get("group_website").getAsString();
                throw new ContentUnavailableException(
                        "This content is not available because its release has been delayed by the " +
                                "group.\nYou may be able to read it at: " + group_website);
            }
        }

        return result;
    }
}
