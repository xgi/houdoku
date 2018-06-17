package com.faltro.houdoku.plugins;

import com.faltro.houdoku.exception.ContentUnavailableException;
import com.faltro.houdoku.exception.LicensedContentException;
import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.util.ParseHelpers;
import javafx.scene.image.Image;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;

public class MangaHere extends GenericContentSource {
    public static final int ID = 1;
    public static final String NAME = "MangaHere";
    public static final String DOMAIN = "www.mangahere.cc";
    public static final String PROTOCOL = "https";

    @Override
    public ArrayList<HashMap<String, Object>> search(String query) throws IOException {
        Document doc = getURL(PROTOCOL + "://" + DOMAIN + "/search.php?name=" + query);

        ArrayList<HashMap<String, Object>> data_arr = new ArrayList<>();
        Elements rows = doc.select("div[class=result_search]").select("dl");
        for (Element row : rows) {
            Element link = row.selectFirst("a[class*=manga_info]");
            String source = link.attr("href").substring(2 + DOMAIN.length());
            String title = link.text();
            String latest_release = row.selectFirst("a[class=name_two]").text();

            String details = title + "\nLatest release: " + latest_release;

            HashMap<String, Object> content = new HashMap<>();
            content.put("contentSourceId", ID);
            content.put("source", source);
            content.put("title", title);
            content.put("details", details);

            data_arr.add(content);
        }
        return data_arr;
    }

    @Override
    public ArrayList<Chapter> chapters(Series series, Document seriesDocument) {
        Elements rows = seriesDocument.selectFirst("div[class=detail_list]").selectFirst("ul")
                .select("li");

        ArrayList<Chapter> chapters = new ArrayList<>();
        for (Element row : rows) {
            String title = row.selectFirst("span[class=left]").ownText();
            Element link = row.selectFirst("a");
            String source = link.attr("href").substring(2 + DOMAIN.length());
            String chapterNumExtended = link.text();
            double chapterNum = ParseHelpers.parseDouble(
                    chapterNumExtended.substring(chapterNumExtended.lastIndexOf(" ") + 1)
            );

            String dateString = row.selectFirst("span[class=right]").text();
            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern(
                    "MMM d, yyyy", Locale.ENGLISH
            );
            LocalDateTime localDateTime = dateString.equals("Today")
                    ? LocalDate.now().atStartOfDay()
                    : LocalDate.parse(dateString, dateTimeFormatter).atStartOfDay();

            HashMap<String, Object> metadata = new HashMap<>();
            metadata.put("chapterNum", chapterNum);
            metadata.put("localDateTime", localDateTime);

            chapters.add(new Chapter(series, title, source, metadata));
        }

        return chapters;
    }

    @Override
    public Series series(String source) throws IOException {
        Document seriesDocument = getURL(PROTOCOL + "://" + DOMAIN + source);

        String titleExtended = seriesDocument.selectFirst("h2").text();
        String title = titleExtended.substring(0, titleExtended.length() - 6);

        Element detailContainer = seriesDocument.selectFirst("div[class=manga_detail]");
        String imageSource = detailContainer.selectFirst("img").attr("src");
        Image cover = imageFromURL(imageSource);
        double rating = ParseHelpers.parseDouble(detailContainer.selectFirst("span#current_rating")
                .text());
        String ratingsExtended = detailContainer.selectFirst("span[class=ml5]").text();
        int ratings = ParseHelpers.parseInt(ratingsExtended.substring(1, ratingsExtended.indexOf
                (" ")));

        Elements detailRows = detailContainer.selectFirst("ul[class=detail_topText]").select("li");
        String[] altNames = detailRows.get(2).ownText().split("; ");
        String[] genres = detailRows.get(3).ownText().split("; ");
        String author = detailRows.get(4).selectFirst("a").text();
        String artist = detailRows.get(5).selectFirst("a").text();
        String status = ParseHelpers.firstWord(detailRows.get(6).ownText());
        String description = detailRows.get(8).selectFirst("p#show").ownText();

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
    public Image cover(String source) throws IOException {
        Document seriesDocument = getURL(PROTOCOL + "://" + DOMAIN + source);
        String url = seriesDocument.selectFirst("img[class=img]").attr("src");
        return imageFromURL(url);
    }

    @Override
    public Image image(Chapter chapter, int page) throws IOException, ContentUnavailableException {
        Document document = getURL(PROTOCOL + "://" + DOMAIN + chapter.getSource() +
                (page == 1 ? "" : Integer.toString(page) + ".html"));

        Elements errors = document.select("div[class=mangaread_error]");
        if (errors.size() > 0) {
            if (errors.first().text().contains("has been licensed")) {
                throw new LicensedContentException("This content has been licensed and is not " +
                        "available on " + NAME + ".");
            }
        }

        // we may not have determined the number of pages yet, so do that here
        if (chapter.images.length == 1) {
            Elements page_options = document.selectFirst("select[class=wid60]").select("option");
            int num_pages = page_options.size() - 1;

            chapter.images = new Image[num_pages];
        }

        String url = document.selectFirst("img#image").attr("src");
        return imageFromURL(url);
    }
}
