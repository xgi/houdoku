package com.faltro.houdoku.model;

import com.faltro.houdoku.controller.ReaderController;
import com.faltro.houdoku.util.ContentLoader;
import com.faltro.houdoku.util.ContentSource;
import javafx.scene.image.Image;

import java.time.LocalDateTime;
import java.util.HashMap;

public class Chapter {
    public double chapterNum;
    public int volumeNum;
    public String language;
    public String group;
    public int views;
    public LocalDateTime localDateTime;
    public transient Image[] images;
    private transient Series series;
    private String title;
    private String source;
    private int currentPageNum;

    private Chapter(Series series, String title, String source) {
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
        if (this.currentPageNum < 0) {
            this.currentPageNum = 0;
        } else if (this.currentPageNum >= this.images.length) {
            this.currentPageNum = this.images.length - 1;
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

    public void loadCurrentImage(ContentLoader contentLoader, ContentSource contentSource,
                                 ReaderController readerController) {
        if (images[currentPageNum] == null) {
            contentLoader.loadPage(contentSource, this, currentPageNum, readerController, false);
        } else {
            readerController.imageView.setImage(images[currentPageNum]);
            readerController.refreshPage();
            preloadImages(contentLoader, contentSource, readerController, currentPageNum + 1);
        }
    }

    /**
     * @param contentSource
     * @param readerController
     * @param page             the 0-indexed first page to reload
     */
    public void preloadImages(ContentLoader contentLoader, ContentSource contentSource,
                              ReaderController readerController, int page) {
        for (int i = 0; i < 3; i++) {
            if (page + i < images.length) {
                // check if the image is already loaded
                if (images[page + i] == null) {
                    contentLoader.loadPage(contentSource, this, page + i, readerController, true);
                }
            }
        }
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

    public String getTitle() {
        return title;
    }

    public String getSource() {
        return source;
    }
}
