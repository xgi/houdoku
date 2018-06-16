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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;

public class MangaDex extends GenericContentSource {
    public static final int ID = 0;
    public static final String NAME = "MangaDex";
    public static final String DOMAIN = "mangadex.org";
    public static final String PROTOCOL = "https";

    @Override
    public ArrayList<HashMap<String, Object>> search(String query) throws IOException {
        Document doc = getURL(PROTOCOL + "://" + DOMAIN + "/?page=search" + "&title=" + query);

        ArrayList<HashMap<String, Object>> data_arr = new ArrayList<>();
        Elements links = doc.select("a[class=manga_title]");
        for (Element link : links) {
            String linkHref = link.attr("href");
            String source = linkHref.substring(0, linkHref.lastIndexOf("/"));
            String title = link.text();
            Element parentDiv = link.parent().parent();
            String coverSrc = parentDiv.selectFirst("div[class=large_logo]").selectFirst("img")
                    .attr("abs:src");
            String rating = parentDiv.selectFirst("span[title=Rating]").parent().text();
            String follows = parentDiv.selectFirst("span[title=Follows]").parent().text();
            String views = parentDiv.selectFirst("span[title=Views]").parent().text();

            String details = title + "\n★" + rating + "/10\n" + views + " views, " + follows +
                    " follows";

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
    public ArrayList<Chapter> chapters(Series series) throws IOException {
        ArrayList<Document> documents = new ArrayList<>();
        documents.add(getURL(PROTOCOL + "://" + DOMAIN + series.getSource()));

        // Determine if there is a pager. If there is, we will need to make
        // multiple requests to get all chapters.
        Element pager = documents.get(0).selectFirst("ul[class=pagination]");
        if (pager != null) {
            // we will avoid navigating using the pager and simply predict
            // the url for each page, checking whether the link is present
            // on the most recent document before trying to access it
            String first_url = pager.selectFirst("li[class=paging]")
                    .selectFirst("a").attr("href");
            String url_base = first_url.substring(0, first_url.length() - 2);

            boolean running = true;
            for (int i = 2; running; i++) {
                String url_fragment = url_base + Integer.toString(i);
                if (documents.get(documents.size() - 1)
                        .selectFirst("a[href*=" + url_fragment + "]") != null) {
                    documents.add(getURL(PROTOCOL + "://" + DOMAIN + url_fragment));
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

    /**
     * Parse all of the chapters on the given Document.
     * <p>
     * This method is NOT guaranteed to return all chapters of a given
     * series -- use chapters(Series series) for that.
     *
     * @param seriesDocument
     * @return an ArrayList of Chapter's using data from the provided document
     */
    @Override
    public ArrayList<Chapter> chapters(Series series, Document seriesDocument) {
        Element tbody = seriesDocument.select("tbody").get(1);

        ArrayList<Chapter> chapters = new ArrayList<>();
        for (Element row : tbody.select("tr")) {
            Elements cells = row.select("td");

            Element link = cells.get(1).selectFirst("a");
            String title = link.attr("title");
            String source = link.attr("href");
            double chapterNum = ParseHelpers.parseDouble(link.attr("data-chapter-num"));
            int volumeNum = ParseHelpers.parseInt(link.attr("data-volume-num"));
            String language = cells.get(3).selectFirst("img").attr("title");
            String group = cells.get(4).selectFirst("a").text();
            int views = ParseHelpers.parseInt(cells.get(6).text());
            String dateString = cells.get(7).attr("title");
            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern(
                    "yyyy-MM-dd HH:mm:ss z", Locale.ENGLISH
            );
            LocalDateTime localDateTime = LocalDateTime.parse(dateString, dateTimeFormatter);

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
    public Series series(String source) throws IOException {
        Document seriesDocument = getURL(PROTOCOL + "://" + DOMAIN + source);

        Element titlePanel = seriesDocument.selectFirst("h3");
        String title = titlePanel.text();
        String language = titlePanel.selectFirst("img").attr("title");

        String imageSource = seriesDocument.selectFirst("img[title='Manga image']").attr("src");
        Image cover = imageFromURL(PROTOCOL + "://" + DOMAIN + imageSource);

        Element tbody = seriesDocument.selectFirst("tbody");
        Element rowAltNames = ParseHelpers.tdWithHeader(tbody, "Alt name(s):");
        Element rowAuthor = ParseHelpers.tdWithHeader(tbody, "Author:");
        Element rowArtist = ParseHelpers.tdWithHeader(tbody, "Artist:");
        Element rowGenres = ParseHelpers.tdWithHeader(tbody, "Genres:");
        Element rowRating = ParseHelpers.tdWithHeader(tbody, "Rating:");
        Element rowStatus = ParseHelpers.tdWithHeader(tbody, "Pub. status:");
        Element rowStats = ParseHelpers.tdWithHeader(tbody, "Stats:");
        Element rowDescription = ParseHelpers.tdWithHeader(tbody, "Description:");

        String[] altNames = ParseHelpers.htmlListToStringArray(rowAltNames.selectFirst("ul"));
        String author = rowAuthor.selectFirst("a").text();
        String artist = rowArtist.selectFirst("a").text();
        String[] genres = ParseHelpers.htmlListToStringArray(rowGenres.selectFirst("td"), "span");
        double rating = ParseHelpers.parseDouble(ParseHelpers.tdWithHeader(tbody, "Rating:")
                .selectFirst("span[title=Rating]").parent().text());
        int ratings = ParseHelpers.parseInt(rowRating.selectFirst("span[title=Users]")
                .parent().text());
        String status = rowStatus.selectFirst("td").text();
        int views = ParseHelpers.parseInt(rowStats.selectFirst("span[title=Views]")
                .parent().text());
        int follows = ParseHelpers.parseInt(rowStats.selectFirst("span[title=Follows]")
                .parent().text());
        String description = rowDescription.selectFirst("td").text();

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
    public Image image(Chapter chapter, int page) throws IOException {
        Document document = getURL(PROTOCOL + "://" + DOMAIN + chapter.getSource() + "/" +
                Integer.toString(page));

        // we may not have determined the number of pages yet, so do that here
        if (chapter.images.length == 1) {
            Elements page_options = document.selectFirst("select#jump_page")
                    .select("option");
            int last_page = Integer.parseInt(page_options.last().attr("value"));

            chapter.images = new Image[last_page];
        }

        String img_src = document.selectFirst("img#current_page").attr("src");
        String url = img_src;
        if (!img_src.contains(DOMAIN)) {
            url = PROTOCOL + "://" + DOMAIN + img_src;
        }

        return imageFromURL(url);
    }
}
