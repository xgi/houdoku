package com.faltro.houdoku.model;

import com.faltro.houdoku.model.Languages.Language;
import java.time.LocalDateTime;
import java.util.HashMap;
import javafx.scene.image.Image;

/**
 * An individual release of a chapter for a Series.
 * 
 * <p>A series can have multiple chapters with the same number, since the content source may provide
 * multiple groups' scanlations for the chapter.
 */
public class Chapter {
    public double chapterNum;
    public int volumeNum;
    public Language language;
    public String group;
    public int views;
    public LocalDateTime localDateTime;
    public transient Image[] images;
    public transient String imageUrlTemplate;
    public transient String[] imageUrls;
    private String title;
    private String source;
    private transient Series series;
    private int currentPageNum;
    private boolean read;

    public Chapter(Series series, String title, String source) {
        this.series = series;
        this.title = title;
        this.source = source;
        this.images = new Image[1];
        this.currentPageNum = 0;
        this.language = Languages.Language.UNKNOWN;
        this.read = false;
    }

    public Chapter(Series series, String title, String source, HashMap<String, Object> metadata) {
        this(series, title, source);
        setMetadata(metadata);
    }

    /**
     * Ensures that currentPageNum is valid.
     * 
     * <p>Checks that the currentPageNum is neither less than 0 nor greater than the total number of
     * pages.
     */
    private void sanitizePageNumber() {
        if (currentPageNum < 0) {
            currentPageNum = 0;
        } else if (currentPageNum >= images.length) {
            currentPageNum = images.length - 1;
        }
    }

    /**
     * Sets the "metadata" content of this object.
     * 
     * <p>The following fields are stored:
     * <ul>
     * <li>chapterNum (double)</li>
     * <li>volumeNum (int)</li>
     * <li>language (Language)</li>
     * <li>group (String)</li>
     * <li>views (int)</li>
     * <li>localDateTime (LocalDateTime)</li>
     * </ul>
     *
     * @param metadata a HashMap where keys are the field names listed above as Strings and values
     *                 of the matching type
     */
    private void setMetadata(HashMap<String, Object> metadata) {
        for (String key : metadata.keySet()) {
            switch (key) {
                case "chapterNum":
                    chapterNum = (double) metadata.get(key);
                    break;
                case "volumeNum":
                    volumeNum = (int) metadata.get(key);
                    break;
                case "language":
                    language = (Language) metadata.get(key);
                    break;
                case "group":
                    group = (String) metadata.get(key);
                    break;
                case "views":
                    views = (int) metadata.get(key);
                    break;
                case "localDateTime":
                    localDateTime = (LocalDateTime) metadata.get(key);
                    break;
                default:
                    break;
            }
        }
    }

    /**
     * Changes currentPageNum to the requested page.
     * 
     * <p>This method by itself does not load the image on the new page.
     *
     * @param pageNum the page to change to, where 1 is the first page
     */
    public void specificPage(int pageNum) {
        this.currentPageNum = pageNum - 1;
        this.sanitizePageNumber();
    }

    /**
     * Changes currentPageNum by a specified delta.
     * 
     * <p>This method by itself does not load the image on the new page.
     *
     * @param delta the (positive or negative) number of pages to change by
     */
    public void deltaPage(int delta) {
        this.currentPageNum += delta;
        this.sanitizePageNumber();
    }

    /**
     * Determine whether the chapter matches a list of text filters.
     * 
     * @param filters an array of String's which all must be present in the chapter's fields
     * @return whether all filters are present
     */
    public boolean matchesFilters(String[] filters) {
        // We allow the user to specify multiple filter strings, separated by a comma. For a series
        // to match the filter, ALL sections must be present in at least one of the title,
        // group, language, or chapterNum
        boolean matches_all = true;
        if (filters.length > 0) {
            for (String filter : filters) {
                boolean titleMatches = this.getTitle().toLowerCase().contains(filter);
                boolean groupMatches =
                        this.group != null && this.group.toLowerCase().contains(filter);
                boolean languageMatches = this.language != null
                        && this.language.toString().toLowerCase().contains(filter);
                boolean chapterNumMatches =
                        Double.toString(this.chapterNum).toLowerCase().contains(filter);

                matches_all = matches_all
                        && (titleMatches || groupMatches || languageMatches || chapterNumMatches);
            }
        }

        return matches_all;
    }

    /**
     * Determine whether the chapter is in the given language.
     * 
     * @param language the Language to compare
     * @return whether the languages match, or this chapter's language is UNKNOWN
     */
    public boolean matchesLanguage(Languages.Language language) {
        return this.language == language || this.language == Languages.Language.UNKNOWN;
    }

    /**
     * Clears the array of images.
     * 
     * <p>Expected to be called when the user is not expected to continue viewing the images, in
     * order to free up memory when the image data is cleared from memory by the garbage collector.
     */
    public void clearImages() {
        images = new Image[1];
        imageUrls = null;
        imageUrlTemplate = null;
        currentPageNum = 0;
    }

    public int getCurrentPageNum() {
        return currentPageNum;
    }

    public int getTotalPages() {
        return images.length;
    }

    public Series getSeries() {
        return series;
    }

    public void setSeries(Series series) {
        this.series = series;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public boolean getRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public String toString() {
        return String.format("%s - %s", series.getTitle(),
                title.equals("") ? String.valueOf(chapterNum) : title);
    }
}
