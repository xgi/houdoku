package com.faltro.houdoku.model;

import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

import static org.junit.Assert.*;
import static org.mockito.Mockito.mock;

public class SeriesTest {
    private Series series1;
    private Chapter chapter1;
    private Chapter chapter2;
    private Chapter chapter3;
    private Chapter chapter4;

    @Before
    public void setUp() {
        series1 = new Series("series1", "series1_source", null, -1);
        chapter1 = mock(Chapter.class);
        chapter1.chapterNum = 1;
        chapter1.language = "language1";
        chapter2 = mock(Chapter.class);
        chapter2.chapterNum = 2;
        chapter2.language = "language1";
        chapter3 = mock(Chapter.class);
        chapter3.chapterNum = 2;
        chapter3.language = "language2";
        chapter4 = mock(Chapter.class);
        chapter4.chapterNum = 3;
        chapter4.language = "language1";
        ArrayList<Chapter> chapters = new ArrayList<>(
                Arrays.asList(chapter1, chapter2, chapter3, chapter4));
        series1.setChapters(chapters);
    }

    @Test
    public void metadata() {
        String language = "english";
        String author = "author";
        String artist = "artist";
        String status = "status";
        String[] altNames = new String[]{"altName1", "altName2", "altName3"};
        String description = "description";
        int views = 101;
        int follows = 102;
        double rating = 4.56;
        int ratings = 103;
        String[] genres = new String[]{"genre1", "genre2"};

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

        Series series = new Series("series", "series_source", null, -1, metadata);
        assertEquals(language, series.language);
        assertEquals(author, series.author);
        assertEquals(artist, series.artist);
        assertEquals(status, series.status);
        assertArrayEquals(altNames, series.altNames);
        assertEquals(description, series.description);
        assertEquals(views, series.views, 0);
        assertEquals(follows, series.follows, 0);
        assertEquals(rating, series.rating, 0);
        assertEquals(ratings, series.ratings, 0);
        assertArrayEquals(genres, series.genres);
    }

    @Test
    public void smartNextChapter1() {
        assertEquals(chapter2, series1.smartNextChapter(chapter1));
    }

    @Test
    public void smartNextChapter2() {
        assertEquals(chapter4, series1.smartNextChapter(chapter2));
    }

    @Test
    public void smartNextChapter3() {
        assertNull(series1.smartNextChapter(chapter3));
    }

    @Test
    public void smartPreviousChapter1() {
        assertEquals(chapter1, series1.smartPreviousChapter(chapter2));
    }

    @Test
    public void smartPreviousChapter2() {
        assertEquals(chapter2, series1.smartPreviousChapter(chapter4));
    }

    @Test
    public void smartPreviousChapter3() {
        assertNull(series1.smartPreviousChapter(chapter1));
    }
}