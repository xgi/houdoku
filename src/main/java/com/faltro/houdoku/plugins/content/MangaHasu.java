package com.faltro.houdoku.plugins.content;

import com.faltro.houdoku.exception.ContentUnavailableException;
import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.util.ParseHelpers;
import javafx.scene.image.Image;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;

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
 * @see ContentSource
 */
public class MangaHasu extends GenericContentSource {
    public static final int ID = 6;
    public static final String NAME = "MangaHasu";
    public static final String DOMAIN = "mangahasu.se";
    public static final String PROTOCOL = "http";

    @Override
    public ArrayList<HashMap<String, Object>> search(String query) throws IOException {
        Document document =
                parse(GET(client, PROTOCOL + "://" + DOMAIN + "/advanced-search.html?keyword=" + query));

        ArrayList<HashMap<String, Object>> data_arr = new ArrayList<>();
        Elements results = document.selectFirst("ul[class=list_manga]").select("li");
        for (Element result : results) {
            Element link = result.selectFirst("a");
            String source = link.attr("href").substring(PROTOCOL.length() + 3 + DOMAIN.length());
            String title = link.attr("title");
            String coverSrc = result.selectFirst("img").attr("src");
            String latest = result.selectFirst("a[class=name-chapter]").selectFirst("span").text();

            String details = String.format("%s\nLatest: %s",
                    title,
                    latest
            );

            HashMap<String, Object> content = new HashMap<>();
            content.put("contentSourceId", ID);
            content.put("source", source);
            content.put("coverSrc", coverSrc);
            content.put("title", title);
            content.put("details", details);

            data_arr.add(content);
        }
        return data_arr;
    }

    @Override
    public ArrayList<Chapter> chapters(Series series, Document seriesDocument) {
        Elements rows = seriesDocument.selectFirst("div[class=list-chapter]")
                .selectFirst("tbody").select("tr");

        ArrayList<Chapter> chapters = new ArrayList<>();
        for (Element row : rows) {
            Element link = row.selectFirst("a");
            String title = link.selectFirst("span").text();
            String source = link.attr("href").substring(PROTOCOL.length() + 3 + DOMAIN.length());
            String chapterNumExtended = link.text();
            double chapterNum = ParseHelpers.parseDouble(
                    chapterNumExtended.substring(chapterNumExtended.indexOf("hapter") + 7)
            );
            String dateString = row.selectFirst("td[class=date-updated]").text();
            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern(
                    "MMM d, yyyy", Locale.ENGLISH
            );
            LocalDateTime localDateTime = ParseHelpers.potentiallyRelativeDate(
                    dateString, dateTimeFormatter);

            HashMap<String, Object> metadata = new HashMap<>();
            metadata.put("chapterNum", chapterNum);
            metadata.put("localDateTime", localDateTime);

            chapters.add(new Chapter(series, title, source, metadata));
        }

        return chapters;
    }

    @Override
    public Series series(String source, boolean quick) throws IOException {
        Document seriesDocument = parse(GET(client, PROTOCOL + "://" + DOMAIN + source));

        Element image = seriesDocument.selectFirst("div[class*=info-img]").selectFirst("img");
        String title = image.attr("alt");
        String imageSource = image.attr("src");
        Image cover = imageFromURL(client, imageSource, ParseHelpers.COVER_MAX_WIDTH);

        Element container = seriesDocument.selectFirst("div[class*=info-content]");
        Elements rows = container.select("div[class*=detail_item]");

        String[] altNames = container.selectFirst("h3").text().split("; ");
        String author = rows.get(0).selectFirst("span").text();
        String artist = rows.get(1).selectFirst("span").text();
        String[] genres = ParseHelpers.htmlListToStringArray(
                rows.get(3).selectFirst("span"), "a");
        String status = rows.get(4).selectFirst("span").text();
        int views = ParseHelpers.parseInt(rows.get(5).selectFirst("span").text());
        double rating = ParseHelpers.parseDouble(
                container.selectFirst("span[class=ratings]").text());
        int ratings = ParseHelpers.parseInt(
                container.selectFirst("span[class=div_evaluate]").text());
        int follows = ParseHelpers.parseInt(
                container.selectFirst("span[class=div_follow]").text());
        String description =
                seriesDocument.selectFirst("div[class=content-info]").selectFirst("div").text();

        HashMap<String, Object> metadata = new HashMap<>();
        metadata.put("altNames", altNames);
        metadata.put("author", author);
        metadata.put("artist", artist);
        metadata.put("genres", genres);
        metadata.put("status", status);
        metadata.put("views", views);
        metadata.put("rating", rating);
        metadata.put("ratings", ratings);
        metadata.put("follows", follows);
        metadata.put("description", description);

        Series series = new Series(title, source, cover, ID, metadata);
        series.setChapters(chapters(series, seriesDocument));
        return series;
    }

    @Override
    public Image image(Chapter chapter, int page) throws IOException, ContentUnavailableException {
        Image result = null;

//        if (chapter.imageUrlTemplate != null) {
//            result = imageFromURL(String.format(chapter.imageUrlTemplate, page));
//        } else {
//            Document document = parse(GET(client, PROTOCOL + "://" + DOMAIN + chapter.getSource()));
//            Elements pages = document.selectFirst("div[class=vung-doc]").select("img");
//            String first_src = pages.get(0).attr("src");
//
//            chapter.images = new Image[pages.size()];
//            chapter.imageUrlTemplate = first_src.replace("/1", "/%s");
//
//             rerun the method, but we should now match chapter.iUT != null
//            result = image(chapter, page);
//        }

//        return result;
        Document document = parse(GET(client, PROTOCOL + "://" + DOMAIN + chapter.getSource()));
        System.out.println(document);
        Element p = document.selectFirst("img[class=page1]");
        return imageFromURL(client, p.attr("src"));
    }
}
