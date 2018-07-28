package com.faltro.houdoku.model;

import javafx.scene.image.Image;

import java.time.LocalDateTime;
import java.util.HashMap;

/**
 * An individual release of a chapter for a Series.
 * <p>
 * A series can have multiple chapters with the same number, since the content
 * source may provide multiple groups' scanlations for the chapter.
 */
public class Chapter {
    public double chapterNum;
    public int volumeNum;
    public String language;
    public String group;
    public int views;
    public LocalDateTime localDateTime;
    public transient Image[] images;
    private String title;
    private String source;
    private transient Series series;
    private int currentPageNum;

    public Chapter(Series series, String title, String source) {
        this.series = series;
        this.title = title;
        this.source = source;
        this.images = new Image[1];
        this.currentPageNum = 0;
    }

    public Chapter(Series series, String title, String source, HashMap<String, Object> metadata) {
        this(series, title, source);
        setMetadata(metadata);
    }

    /**
     * Ensures that currentPageNum is valid.
     * <p>
     * Checks that the currentPageNum is neither less than 0 nor greater
     * than the total number of pages.
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
     * <p>
     * The following fields are stored:
     * chapterNum (double), volumeNum (int)
     * language (String), group (String)
     * views (int), localDateTime (LocalDateTime)
     *
     * @param metadata a HashMap where keys are the field names listed above
     *                 as Strings and values of the matching type
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
                    language = (String) metadata.get(key);
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
            }
        }
    }

    /**
     * Changes currentPageNum to the requested page.
     * <p>
     * This method by itself does not load the image on the new page.
     *
     * @param pageNum the page to change to, where 1 is the first page
     */
    public void specificPage(int pageNum) {
        this.currentPageNum = pageNum - 1;
        this.sanitizePageNumber();
    }

    /**
     * Changes currentPageNum by a specified delta.
     * <p>
     * This method by itself does not load the image on the new page.
     *
     * @param delta the (positive or negative) number of pages to change by
     */
    public void deltaPage(int delta) {
        this.currentPageNum += delta;
        this.sanitizePageNumber();
    }

    /**
     * Clears the array of images.
     * <p>
     * Expected to be called when the user is not expected to continue viewing
     * the images, in order to free up memory when the image data is cleared
     * from memory by the garbage collector.
     */
    public void clearImages() {
        images = new Image[1];
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

    public String toString() {
        return String.format("%s - %s",
                series.getTitle(),
                title.equals("") ? String.valueOf(chapterNum) : title
        );
    }
}
