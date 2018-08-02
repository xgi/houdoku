package com.faltro.houdoku.plugins.content;

import com.faltro.houdoku.exception.LicensedContentException;
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
 * @see com.faltro.houdoku.util.ContentSource
 */
public class MangaTown extends GenericContentSource {
    public static final int ID = 3;
    public static final String NAME = "MangaTown";
    public static final String DOMAIN = "www.mangatown.com";
    public static final String PROTOCOL = "http";

    @Override
    public ArrayList<HashMap<String, Object>> search(String query) throws IOException {
        Document document = parse(GET(PROTOCOL + "://" + DOMAIN + "/search.php?name=" + query));

        ArrayList<HashMap<String, Object>> data_arr = new ArrayList<>();
        Elements results = document.selectFirst("ul[class=manga_pic_list]").select("li");
        for (Element result : results) {
            Element link = result.selectFirst("a[class=manga_cover]");
            String source = link.attr("href").substring(2 + DOMAIN.length());
            String title = link.attr("title");
            String coverSrc = link.selectFirst("img").attr("src");

            Elements detail_rows = result.select("p");
            String score = detail_rows.get(1).selectFirst("b").text();
            String author = detail_rows.get(3).text().substring(8);
            String status = detail_rows.get(4).text().substring(8);
            String views = detail_rows.get(5).text().substring(7);

            String details = String.format("%s\nAuthor: %s\n★%s/5, %s views\nStatus: %s",
                    title,
                    author,
                    score, views,
                    status
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
    public ArrayList<Chapter> chapters(Series series, Document document) {
        Element container = document.selectFirst("ul[class=chapter_list]");

        ArrayList<Chapter> chapters = new ArrayList<>();
        for (Element row : container.select("li")) {
            Element link = row.selectFirst("a");
            String source = link.attr("href").substring(2 + DOMAIN.length());
            double chapterNum = ParseHelpers.parseDouble(link.text().substring(
                    link.text().lastIndexOf(" ") + 1));
            String title = link.text();
            int volumeNum = -1;
            if (row.select("span").size() > 1) {
                String firstSpanText = row.selectFirst("span").text();
                if (firstSpanText.startsWith("Vol ")) {
                    volumeNum = ParseHelpers.parseInt(firstSpanText.substring(firstSpanText
                            .lastIndexOf(" ") + 1));
                    if (row.select("span").size() > 2) {
                        title = row.select("span").get(1).text();
                    }
                }
            }
            String dateString = row.selectFirst("span[class=time]").text();
            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern(
                    "MMM d, yyyy", Locale.ENGLISH
            );
            LocalDateTime localDateTime = ParseHelpers.potentiallyRelativeDate(
                    dateString, dateTimeFormatter);

            HashMap<String, Object> metadata = new HashMap<>();
            metadata.put("chapterNum", chapterNum);
            if (volumeNum != -1) {
                metadata.put("volumeNum", volumeNum);
            }
            metadata.put("localDateTime", localDateTime);

            chapters.add(new Chapter(series, title, source, metadata));
        }

        return chapters;
    }

    @Override
    public Series series(String source, boolean quick) throws IOException,
            LicensedContentException {
        Document seriesDocument = parse(GET(PROTOCOL + "://" + DOMAIN + source));

        if (seriesDocument.selectFirst("div[class=chapter_content]").text().contains(
                " has been licensed, it is not available in ")) {
            throw new LicensedContentException(
                    "This series has been licensed and is not available on " + NAME + ".");
        }

        String title = seriesDocument.selectFirst("h1[class=title-top]").text();
        Element container = seriesDocument.selectFirst("div[class=detail_content]");
        String imageSource = container.selectFirst("img").attr("src");
        Image cover = imageFromURL(imageSource, ParseHelpers.COVER_MAX_WIDTH);

        Elements rows = container.selectFirst("ul").select("li");
        double rating = ParseHelpers.parseDouble(rows.get(0).selectFirst("span").text());
        String ratingsExtended = rows.get(0).ownText();
        int ratings = ParseHelpers.parseInt(ratingsExtended.substring(1,
                ratingsExtended.lastIndexOf(" ")));
        String[] altNames = rows.get(2).ownText().split("; ");
        String[] genres = ParseHelpers.htmlListToStringArray(rows.get(4), "a");
        String author = String.join(", ", ParseHelpers.htmlListToStringArray(rows.get(5), "a"));
        String artist = String.join(", ", ParseHelpers.htmlListToStringArray(rows.get(6), "a"));
        String status = ParseHelpers.firstWord(rows.get(7).ownText());
        String description = rows.get(10).selectFirst("span#show").ownText();

        HashMap<String, Object> metadata = new HashMap<>();
        metadata.put("author", author);
        metadata.put("artist", artist);
        metadata.put("status", status);
        metadata.put("altNames", altNames);
        metadata.put("description", description);
        metadata.put("rating", rating);
        metadata.put("ratings", ratings);
        metadata.put("genres", genres);

        Series series = new Series(title, source, cover, ID, metadata);
        series.setChapters(chapters(series, seriesDocument));
        return series;
    }

    @Override
    public Image image(Chapter chapter, int page) throws IOException {
        Document document = parse(GET(PROTOCOL + "://" + DOMAIN + chapter.getSource() +
                (page == 1 ? "" : Integer.toString(page) + ".html")));

        // we may not have determined the number of pages yet, so do that here
        if (chapter.images.length == 1) {
            Elements page_options = document.select("select").get(1).select("option");
            int num_pages = page_options.size() - 1;
            chapter.images = new Image[num_pages];
        }

        String url = document.selectFirst("img#image").attr("src");
        return imageFromURL(url);
    }
}
