package com.faltro.houdoku.plugins;

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
import java.time.format.DateTimeFormatterBuilder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;

import static com.faltro.houdoku.net.Requests.GET;
import static com.faltro.houdoku.net.Requests.parse;

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
public class MangaPark extends GenericContentSource {
    public static final int ID = 4;
    public static final String NAME = "MangaPark";
    public static final String DOMAIN = "mangapark.me";
    public static final String PROTOCOL = "https";

    @Override
    public ArrayList<HashMap<String, Object>> search(String query) throws IOException {
        Document document = parse(GET(PROTOCOL + "://" + DOMAIN + "/search?q=" + query));

        ArrayList<HashMap<String, Object>> data_arr = new ArrayList<>();
        Elements results = document.selectFirst("div[class=manga-list]").select("div[class*=item]");
        for (Element result : results) {
            Element link = result.selectFirst("a");
            String source = link.attr("href");
            String title = link.attr("title");
            String cover_src = result.selectFirst("img").attr("src");
            Element info_div = result.selectFirst("div[class*=info]");
            Elements info_links = info_div.select("a");
            String release = info_links.last().text();
            String status = info_links.get(info_links.size() - 2).text();

            String details = String.format("%s\nStatus: %s\nReleased: %s",
                    title,
                    status,
                    release
            );

            HashMap<String, Object> content = new HashMap<>();
            content.put("contentSourceId", ID);
            content.put("source", source);
            content.put("coverSrc", PROTOCOL + ":" + cover_src);
            content.put("title", title);
            content.put("details", details);

            data_arr.add(content);
        }
        return data_arr;
    }

    @Override
    public ArrayList<Chapter> chapters(Series series, Document document) {
        Element container = document.selectFirst("div[class=stream]");

        ArrayList<Chapter> chapters = new ArrayList<>();
        for (Element item : container.select("li")) {
            Element link = item.selectFirst("a");
            String title = link.parent().ownText().equals("") ?
                    link.text() : link.parent().ownText().substring(2);
            String source_extended = link.attr("href");
            String source = source_extended.substring(0, source_extended.lastIndexOf("/"));

            double chapterNum = ParseHelpers.parseDouble(link.text().split("ch.")[1]);
            String[] volume_extended = link.parent().parent().parent().parent()
                    .selectFirst("h4").attr("id").split("-");
            int volumeNum = volume_extended.length < 3 ? 0 :
                    volume_extended[2].equals("tbd") ? 0 :
                            ParseHelpers.parseInt(volume_extended[2]);

            String date_string_extended = item.selectFirst("i").text();
            String date_string = date_string_extended.substring(0,
                    date_string_extended.lastIndexOf(" "));
            DateTimeFormatter dateTimeFormatter = new DateTimeFormatterBuilder()
                    .parseCaseInsensitive()
                    .appendPattern("MMM d, yyyy, HH:mm")
                    .toFormatter(Locale.ENGLISH);
            LocalDateTime localDateTime = item.className().equals("new") ? null :
                    LocalDateTime.parse(date_string, dateTimeFormatter);

            HashMap<String, Object> metadata = new HashMap<>();
            metadata.put("chapterNum", chapterNum);
            metadata.put("volumeNum", volumeNum);
            metadata.put("localDateTime", localDateTime);

            chapters.add(new Chapter(series, title, source, metadata));
        }

        return chapters;
    }

    @Override
    public Series series(String source, boolean quick) throws IOException {
        Document seriesDocument = parse(GET(PROTOCOL + "://" + DOMAIN + source));

        Element container = seriesDocument.selectFirst("table[class=outer]");

        String image_source = container.selectFirst("img").attr("src");
        Image cover = imageFromURL(PROTOCOL + ":" + image_source, ParseHelpers.COVER_MAX_WIDTH);

        String title = container.selectFirst("img").attr("title");
        String description = seriesDocument.selectFirst("p[class=summary]").text();

        Element tbody = container.selectFirst("table[class=attr]").selectFirst("tbody");
        Element rowAltNames = ParseHelpers.tdWithHeader(tbody, "Alternative");
        Element rowAuthor = ParseHelpers.tdWithHeader(tbody, "Author(s)");
        Element rowArtist = ParseHelpers.tdWithHeader(tbody, "Artist(s)");
        Element rowGenres = ParseHelpers.tdWithHeader(tbody, "Genre(s)");
        Element rowRating = ParseHelpers.tdWithHeader(tbody, "Rating");
        Element rowStatus = ParseHelpers.tdWithHeader(tbody, "Status");
        Element rowRank = ParseHelpers.tdWithHeader(tbody, "Rank");

        String[] altNames = rowAltNames.selectFirst("td").text().split(" ; ");
        String author = rowAuthor.selectFirst("td").selectFirst("a").text();
        String artist = rowArtist.selectFirst("td").selectFirst("a").text();
        String[] genres = rowGenres.selectFirst("td").text().split(" ; ");
        double rating = ParseHelpers.parseDouble(rowRating.selectFirst("td").text().split(" ")[1]);
        int ratings = ParseHelpers.parseInt(rowRating.selectFirst("td").text().split(" ")[6]);
        String status = rowStatus.selectFirst("td").text();
        int views = ParseHelpers.parseInt(rowRank.selectFirst("td").text().split(" ")[3]);

        HashMap<String, Object> metadata = new HashMap<>();
        metadata.put("author", author);
        metadata.put("artist", artist);
        metadata.put("status", status);
        metadata.put("altNames", altNames);
        metadata.put("description", description);
        metadata.put("views", views);
        metadata.put("rating", rating);
        metadata.put("ratings", ratings);
        metadata.put("genres", genres);

        Series series = new Series(title, source, cover, ID, metadata);
        series.setChapters(chapters(series, seriesDocument));
        return series;
    }

    @Override
    public Image image(Chapter chapter, int page) throws IOException {
        Document document = parse(GET(PROTOCOL + "://" + DOMAIN + chapter.getSource() + "/" +
                Integer.toString(page)));

        // we may not have determined the number of pages yet, so do that here
        if (chapter.images.length == 1) {
            Element num_link = document.selectFirst("a[class=img-num]");
            int num_pages = ParseHelpers.parseInt(num_link.text().split(" / ")[1]);
            chapter.images = new Image[num_pages];
        }

        String img_src = document.selectFirst("img#img-1").attr("src");
        return imageFromURL(img_src.startsWith(PROTOCOL) ? img_src : PROTOCOL + ":" + img_src);
    }
}
