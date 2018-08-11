package com.faltro.houdoku.plugins.content;

import com.faltro.houdoku.exception.ContentUnavailableException;
import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.util.ParseHelpers;
import com.google.gson.JsonArray;
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
        ArrayList<Document> documents = new ArrayList<>();
        documents.add(parse(GET(PROTOCOL + "://" + DOMAIN + series.getSource())));

        // Determine if there is a pager. If there is, we will need to make
        // multiple requests to get all chapters.
        Element pager = documents.get(0).selectFirst("ul[class*=pagination]");
        if (pager != null) {
            // we will avoid navigating using the pager and simply predict
            // the url for each page, checking whether the link is present
            // on the most recent document before trying to access it
            String first_url = pager.selectFirst("li[class*=page-item]")
                    .selectFirst("a").attr("href");
            String url_base = first_url.substring(0, first_url.length() - 2);

            boolean running = true;
            for (int i = 2; running; i++) {
                String url_fragment = url_base + Integer.toString(i);
                if (documents.get(documents.size() - 1)
                        .selectFirst("a[href*=" + url_fragment + "]") != null) {
                    documents.add(parse(GET(PROTOCOL + "://" + DOMAIN + url_fragment)));
                } else {
                    running = false;
                }
            }
        }

        ArrayList<Chapter> chapters = new ArrayList<>();
        for (Document document : documents) {
            chapters.addAll(chapters(series, document));
        }
        return chapters;
    }

    @Override
    public ArrayList<Chapter> chapters(Series series, Document document) {
        Elements chapterRows = document.selectFirst("div[class=chapter-container]")
                .select("div[class*=chapter-row]");
        chapterRows.remove(0);

        ArrayList<Chapter> chapters = new ArrayList<>();
        for (Element row : chapterRows) {
            Elements cells = row.select("div");

            String title = row.attr("data-title");
            double chapterNum = ParseHelpers.parseDouble(row.attr("data-chapter"));
            int volumeNum = ParseHelpers.parseInt(row.attr("data-volume"));
            String source = "/chapter/" + row.attr("data-id");
            int views = ParseHelpers.parseInt(row.attr("data-views"));
            String language = cells.get(7).selectFirst("img").attr("title");
            String group = cells.get(8).selectFirst("a").text();
            LocalDateTime localDateTime = LocalDateTime.ofInstant(
                    Instant.ofEpochSecond(
                            ParseHelpers.parseLong(row.attr("data-timestamp"))),
                    TimeZone.getDefault().toZoneId()
            );

            HashMap<String, Object> metadata = new HashMap<>();
            metadata.put("chapterNum", chapterNum);
            metadata.put("volumeNum", volumeNum);
            metadata.put("language", language);
            metadata.put("group", group);
            metadata.put("views", views);
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
        series.setChapters(quick ? chapters(series, seriesDocument) : chapters(series));
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
