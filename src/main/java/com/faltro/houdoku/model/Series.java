package com.faltro.houdoku.model;

import com.faltro.houdoku.controller.SeriesController;
import com.faltro.houdoku.util.ContentLoader;
import com.faltro.houdoku.util.ContentSource;
import javafx.scene.image.Image;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

public class Series {
    public String language;
    public String author;
    public String artist;
    public String status;
    public String[] altNames;
    public String description;
    public int views;
    public int follows;
    public double rating;
    public int ratings;
    public String[] genres;
    private String title;
    private String source;
    private transient Image cover;
    private int contentSourceId;
    private int numChapters;
    private int numHighestChapter;
    private ArrayList<String> stringCategories;
    private ArrayList<Chapter> chapters;

    public Series(String title, String source, Image cover, int contentSourceId) {
        this.title = title;
        this.source = source;
        this.cover = cover;
        this.stringCategories = new ArrayList<>();
        this.chapters = new ArrayList<>();
        this.contentSourceId = contentSourceId;
    }

    public Series(String title, String source, Image cover,
                  int contentSourceId, HashMap<String, Object> metadata) {
        this(title, source, cover, contentSourceId);
        setMetadata(metadata);
    }

    /**
     * Sets the "metadata" content of this object.
     * <p>
     * The following fields are stored:
     * language (String), author (String)
     * artist (String), status (String)
     * altNames (String[]), description (String)
     * views (int), follows (int)
     * rating (double), ratings (int)
     * genres (String[])
     *
     * @param metadata a HashMap where keys are the field names listed above
     *                 as Strings and values of the matching type
     */
    public void setMetadata(HashMap<String, Object> metadata) {
        for (String key : metadata.keySet()) {
            switch (key) {
                case "language":
                    language = (String) metadata.get(key);
                    break;
                case "author":
                    author = (String) metadata.get(key);
                    break;
                case "artist":
                    artist = (String) metadata.get(key);
                    break;
                case "status":
                    status = (String) metadata.get(key);
                    break;
                case "altNames":
                    altNames = (String[]) metadata.get(key);
                    break;
                case "description":
                    description = (String) metadata.get(key);
                    break;
                case "views":
                    views = (int) metadata.get(key);
                    break;
                case "follows":
                    follows = (int) metadata.get(key);
                    break;
                case "rating":
                    rating = (double) metadata.get(key);
                    break;
                case "ratings":
                    ratings = (int) metadata.get(key);
                    break;
                case "genres":
                    genres = (String[]) metadata.get(key);
                    stringCategories.addAll(Arrays.asList(genres));
                    break;
            }
        }
    }

    public void addCategory(Category category) {
        stringCategories.add(category.getName());
    }

    public void reloadFromSource(ContentLoader contentLoader, ContentSource contentSource,
                                 SeriesController seriesController) {
        contentLoader.reloadSeries(contentSource, this, seriesController);
    }

    public String getTitle() {
        return title;
    }

    public Image getCover() {
        return cover;
    }

    public int getNumHighestChapter() {
        return numHighestChapter;
    }

    public int getNumChapters() {
        return numChapters;
    }

    public ArrayList<String> getStringCategories() {
        return stringCategories;
    }

    public void setStringCategories(ArrayList<String> stringCategories) {
        this.stringCategories = stringCategories;
    }

    public String getSource() {
        return source;
    }

    public ArrayList<Chapter> getChapters() {
        return chapters;
    }

    /**
     * Sets the chapters field using a provided ArrayList.
     * <p>
     * Since many series have multiple scanlations, the number of chapters in
     * the ArrayList will often exceed the number of "actual" chapters that
     * a series has. This is because a Chapter object is used for each
     * individual release, even if multiple may actually refer to the same
     * "real chapter."
     * <p>
     * The ArrayList is sorted by descending chapter number. This function will
     * also set numHighestChapter (effectively the predicted "most recent
     * real chapter") by getting the chapterNum of the first chapter in the
     * sorted list. If this series does not have any chapters,
     * numHighestChapter is simply set to 0.
     *
     * @param chapters an ArrayList of Chapter's
     */
    public void setChapters(ArrayList<Chapter> chapters) {
        this.chapters = chapters;

        this.chapters.sort((o1, o2) -> {
            if (o1.chapterNum == o2.chapterNum)
                return 0;
            return o1.chapterNum > o2.chapterNum ? -1 : 1;
        });
        numHighestChapter = chapters.size() > 0 ? (int) chapters.get(0).chapterNum : 0;
        numChapters = chapters.size();
    }

    public int getContentSourceId() {
        return contentSourceId;
    }
}
