package com.faltro.houdoku.model;

import com.faltro.houdoku.model.Languages.Language;
import javafx.scene.image.Image;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * A series from a ContentSource, which contains an array of Chapter's that the user can read from.
 */
public class Series {
    private final String title;
    private final String source;
    private final int contentSourceId;
    public Language language;
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
    private transient Image cover;
    private transient Image banner;
    private int numChapters;
    private int numHighestChapter;
    private ArrayList<String> stringCategories;
    private ArrayList<Chapter> chapters;
    private String infoSourceId;
    private Map<Integer, String> trackerIds;

    public Series(String title, String source, Image cover, int contentSourceId) {
        this.title = title;
        this.source = source;
        this.cover = cover;
        this.stringCategories = new ArrayList<>();
        this.chapters = new ArrayList<>();
        this.contentSourceId = contentSourceId;
    }

    public Series(String title, String source, Image cover, int contentSourceId,
            HashMap<String, Object> metadata) {
        this(title, source, cover, contentSourceId);
        setMetadata(metadata);
    }

    /**
     * Sets the "metadata" content of this object.
     * <p>
     * The following fields are stored:
     * <ul>
     * <li>language (Language)</li>
     * <li>author (String)</li>
     * <li>artist (String)</li>
     * <li>status (String)</li>
     * <li>altNames (String[])</li>
     * <li>description (String)</li>
     * <li>views (int)</li>
     * <li>follows (int)</li>
     * <li>rating (double)</li>
     * <li>ratings (int)</li>
     * <li>genres (String[])</li>
     * </ul>
     *
     * @param metadata a HashMap where keys are the field names listed above as Strings and values
     *                 of the matching type
     */
    private void setMetadata(HashMap<String, Object> metadata) {
        for (String key : metadata.keySet()) {
            switch (key) {
                case "language":
                    language = (Language) metadata.get(key);
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

    /**
     * Smartly determine the next chapter after the given one.
     *
     * @param chapter the Chapter to find the next of
     * @return the ideal next chapter, or null
     */
    public Chapter smartNextChapter(Chapter chapter) {
        ArrayList<Chapter> possible = chapters.stream()
                .filter(c -> c.language == null || c.language.equals(chapter.language))
                .collect(Collectors.toCollection(ArrayList::new));

        int chapter_index = possible.indexOf(chapter);
        return (chapter_index == 0 || chapter_index == -1) ? null : possible.get(chapter_index - 1);
    }

    /**
     * Smartly determine the previous chapter before the given one.
     *
     * @param chapter the Chapter to find the previous of
     * @return the ideal previous chapter, or null
     */
    public Chapter smartPreviousChapter(Chapter chapter) {
        ArrayList<Chapter> possible = chapters.stream()
                .filter(c -> c.language == null || c.language.equals(chapter.language))
                .collect(Collectors.toCollection(ArrayList::new));

        int chapter_index = possible.indexOf(chapter);
        return chapter_index == possible.size() - 1 ? null : possible.get(chapter_index + 1);
    }

    /**
     * Update or add a tracker's series id.
     *
     * @param tracker_id the ID field of the Tracker class being used
     * @param series_id  the series' id on the Tracker website
     */
    public void updateTrackerId(int tracker_id, String series_id) {
        if (this.trackerIds.containsKey(tracker_id)) {
            this.trackerIds.replace(tracker_id, series_id);
        } else {
            this.trackerIds.put(tracker_id, series_id);
        }
    }

    public String getTitle() {
        return title;
    }

    public Image getCover() {
        return cover;
    }

    public void setCover(Image image) {
        cover = image;
    }

    public Image getBanner() {
        return banner;
    }

    public void setBanner(Image banner) {
        this.banner = banner;
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
     * Since many series have multiple scanlations, the number of chapters in the ArrayList will
     * often exceed the number of "actual" chapters that a series has. This is because a Chapter
     * object is used for each individual release, even if multiple may actually refer to the same
     * "real chapter."
     * <p>
     * The ArrayList is sorted by descending chapter number. This function will also set
     * numHighestChapter (effectively the predicted "most recent real chapter") by getting the
     * chapterNum of the first chapter in the sorted list. If this series does not have any
     * chapters, numHighestChapter is simply set to 0.
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

    public String getInfoSourceId() {
        return infoSourceId;
    }

    public void setInfoSourceId(String infoSourceId) {
        this.infoSourceId = infoSourceId;
    }
}
