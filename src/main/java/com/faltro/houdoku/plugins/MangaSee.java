package com.faltro.houdoku.plugins;

import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.util.ParseHelpers;
import javafx.scene.image.Image;
import okhttp3.FormBody;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;

import static com.faltro.houdoku.net.Requests.*;

/**
 * This class contains implementation details for processing data from a
 * specific "content source" - a website which contains series data and images.
 * <p>
 * For method and field documentation, please see the ContentSource class.
 * Additionally, the implementation of some common methods is done in the
 * GenericContentSource class.
 */
public class MangaSee extends GenericContentSource {
    public static final int ID = 2;
    public static final String NAME = "MangaSee";
    public static final String DOMAIN = "mangaseeonline.us";
    public static final String PROTOCOL = "https";

    @Override
    public ArrayList<HashMap<String, Object>> search(String query) throws IOException {
        FormBody.Builder body = new FormBody.Builder();
        body.add("keyword", query);
        Document document = parse(
                POST(PROTOCOL + "://" + DOMAIN + "/search/request.php", body.build())
        );

        ArrayList<HashMap<String, Object>> data_arr = new ArrayList<>();
        Elements results = document.select("div[class=requested]");
        for (Element result : results) {
            Element link = result.selectFirst("a[class=resultLink]");
            String source = link.attr("href");
            String title = link.text();
            String coverSrc = result.selectFirst("img").attr("src");
            Elements detail_rows = result.selectFirst("div[class=col-xs-8]").select("p");
            String[] authors = ParseHelpers.htmlListToStringArray(detail_rows.get(0), "a");
            String status = detail_rows.get(1).selectFirst("a").text();
            String latest_release = detail_rows.get(2).selectFirst("a").text();

            String details = String.format("%s\n%s\nStatus: %s\nLatest release: %s",
                    title,
                    String.join(", ", authors),
                    status,
                    latest_release
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
        Element tbody = document.selectFirst("div[class*=chapter-list]");

        ArrayList<Chapter> chapters = new ArrayList<>();
        for (Element row : tbody.select("a")) {
            String source = row.attr("href");
            String title = row.selectFirst("span[class=chapterLabel]").text();
            double chapterNum = ParseHelpers.parseDouble(row.attr("chapter"));
            String dateString = row.selectFirst("time").attr("datetime");
            LocalDateTime localDateTime = LocalDateTime.parse(dateString,
                    DateTimeFormatter.ISO_OFFSET_DATE_TIME);

            HashMap<String, Object> metadata = new HashMap<>();
            metadata.put("chapterNum", chapterNum);
            metadata.put("localDateTime", localDateTime);

            chapters.add(new Chapter(series, title, source, metadata));
        }

        return chapters;
    }

    @Override
    public Series series(String source) throws IOException {
        Document seriesDocument = parse(GET(PROTOCOL + "://" + DOMAIN + source));


        Element container = seriesDocument.selectFirst("div[class*=mainWell]");
        String title = container.selectFirst("h1[class=SeriesName]").text();
        String imageSource = container.selectFirst("img").attr("src");
        Image cover = imageFromURL(imageSource);

        Element details = container.selectFirst("span[class*=details]");

        Element labelAltNames = details.selectFirst("b:contains(Alternate)");
        Element labelAuthor = details.selectFirst("b:contains(Author)");
        Element labelGenres = details.selectFirst("b:contains(Genre)");
        Element labelStatus = details.selectFirst("b:contains(Status)");

        String[] altNames = labelAltNames == null ? new String[]{} :
                labelAltNames.parent().ownText().split(", ");
        Elements authors = labelAuthor.parent().select("a");
        String author = authors.first().text();
        String artist = authors.last().text();
        String[] genres = ParseHelpers.htmlListToStringArray(labelGenres.parent(), "a");
        String status = labelStatus.parent().selectFirst("a").text();
        String description = details.selectFirst("div[class=description]").text();

        HashMap<String, Object> metadata = new HashMap<>();
        metadata.put("author", author);
        metadata.put("artist", artist);
        metadata.put("status", status);
        metadata.put("altNames", altNames);
        metadata.put("description", description);
        metadata.put("genres", genres);

        Series series = new Series(title, source, cover, ID, metadata);
        series.setChapters(chapters(series, seriesDocument));
        return series;
    }

    @Override
    public Image image(Chapter chapter, int page) throws IOException {
        String chapterFirstUrl = PROTOCOL + "://" + DOMAIN + chapter.getSource();
        String baseUrl = chapterFirstUrl.substring(0, chapterFirstUrl.lastIndexOf("-"));
        Document document = parse(GET(baseUrl + "-" + Integer.toString(page) + ".html"));

        // we may not have determined the number of pages yet, so do that here
        if (chapter.images.length == 1) {
            Elements page_options = document.selectFirst("select[class*=PageSelect]")
                    .select("option");
            chapter.images = new Image[page_options.size()];
        }

        String url = document.selectFirst("img[class*=CurImage]").attr("src");
        return imageFromURL(url);
    }
}
