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
 *
 * @see GenericContentSource
 * @see ContentSource
 */
public class MangaFree extends GenericContentSource {
    public static final int ID = 5;
    public static final String NAME = "MangaFree";
    public static final String DOMAIN = "mangafree.online";
    public static final String PROTOCOL = "http";

    @Override
    public ArrayList<HashMap<String, Object>> search(String query) throws IOException {
        Document document = parse(GET(client, PROTOCOL + "://" + DOMAIN + "/search/" + query));

        ArrayList<HashMap<String, Object>> data_arr = new ArrayList<>();
        Elements results = document.select("div[class=list-truyen-item-wrap]");
        for (Element result : results) {
            Element link = result.selectFirst("a");
            String source = link.attr("href").substring(PROTOCOL.length() + 3 + DOMAIN.length());
            String title = link.attr("title");
            String coverSrc = result.selectFirst("img").attr("src");
            String last_updated = result.selectFirst("span[title=Updatetime]").text().substring(13);
            String views = result.selectFirst("span[class=aye_icon]").text();

            String details = String.format("%s\nViews: %s\nUpdated: %s",
                    title,
                    views,
                    last_updated
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
        Elements rows = seriesDocument.selectFirst("div[class=chapter-list]").select(
                "div[class=row]");

        ArrayList<Chapter> chapters = new ArrayList<>();
        for (Element row : rows) {
            Element link = row.selectFirst("a");
            String title = link.text();
            String source = link.attr("href").substring(PROTOCOL.length() + 3 + DOMAIN.length());
            String chapterNumExtended = link.text();
            double chapterNum = ParseHelpers.parseDouble(
                    chapterNumExtended.substring(chapterNumExtended.indexOf("hapter") + 7)
            );
            HashMap<String, Object> metadata = new HashMap<>();
            metadata.put("chapterNum", chapterNum);

            chapters.add(new Chapter(series, title, source, metadata));
        }

        return chapters;
    }

    @Override
    public Series series(String source, boolean quick) throws IOException {
        Document seriesDocument = parse(GET(client, PROTOCOL + "://" + DOMAIN + source));

        Element container = seriesDocument.selectFirst("div[class=manga-info-top]");
        String title = container.selectFirst("h1").text();
        String imageSource = container.selectFirst("img").attr("src");
        Image cover = imageFromURL(client, imageSource, ParseHelpers.COVER_MAX_WIDTH);

        String[] altNames =
                container.selectFirst("span[class*=alternative]").text().substring(14).split(";");
        String author = container.selectFirst("a[id=ContentPlaceHolderLeft_mA_Actor]").text();
        int views = ParseHelpers.parseInt(container.selectFirst("span[id" +
                "=ContentPlaceHolderLeft_numView]").text());
        String status = container.selectFirst("span[id=ContentPlaceHolderLeft_span_status]").text();
        String[] genres = ParseHelpers.htmlListToStringArray(
                container.selectFirst("p[id=ContentPlaceHolderLeft_mP_Kind]"), "a");
        String description =
                seriesDocument.selectFirst("div[id=ContentPlaceHolderLeft_maincontent]").text();

        HashMap<String, Object> metadata = new HashMap<>();
        metadata.put("author", author);
        metadata.put("artist", author);
        metadata.put("status", status);
        metadata.put("altNames", altNames);
        metadata.put("genres", genres);
        metadata.put("views", views);
        metadata.put("description", description);

        Series series = new Series(title, source, cover, ID, metadata);
        series.setChapters(chapters(series, seriesDocument));
        return series;
    }

    @Override
    public Image image(Chapter chapter, int page) throws IOException, ContentUnavailableException {
        Image result = null;

        if (chapter.imageUrlTemplate != null) {
            result = imageFromURL(client, String.format(chapter.imageUrlTemplate, page));
        } else {
            Document document = parse(GET(client, PROTOCOL + "://" + DOMAIN + chapter.getSource()));
            Elements pages = document.selectFirst("div[class=vung-doc]").select("img");
            String first_src = pages.get(0).attr("src");

            chapter.images = new Image[pages.size()];
            chapter.imageUrlTemplate = first_src.replace("/1", "/%s");

            // rerun the method, but we should now match chapter.iUT != null
            result = image(chapter, page);
        }

        return result;
    }
}
