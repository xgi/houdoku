package com.faltro.houdoku.model;

import javafx.scene.image.Image;
import org.junit.Before;
import org.junit.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;

import static org.junit.Assert.assertEquals;

public class ChapterTest {
    private Series series;
    private Chapter chapter1;

    @Before
    public void setUp() throws Exception {
        series = new Series("series", "series_source", null, -1);
        chapter1 = new Chapter(series, "chapter1", "chapter1_source");
        chapter1.images = new Image[10];
    }

    @Test
    public void metadata() {
        double chapterNum = 2;
        int volumeNum = 3;
        String language = "english";
        String group = "some_group";
        int views = 101;
        LocalDateTime localDateTime = LocalDate.now().atStartOfDay();

        HashMap<String, Object> metadata = new HashMap<>();
        metadata.put("chapterNum", chapterNum);
        metadata.put("volumeNum", volumeNum);
        metadata.put("language", language);
        metadata.put("group", group);
        metadata.put("views", views);
        metadata.put("localDateTime", localDateTime);

        Chapter chapter = new Chapter(series, "chapter", "chapter_source", metadata);
        assertEquals(chapterNum, chapter.chapterNum, 0);
        assertEquals(volumeNum, chapter.volumeNum, 0);
        assertEquals(language, chapter.language);
        assertEquals(group, chapter.group);
        assertEquals(views, chapter.views, 0);
        assertEquals(localDateTime, chapter.localDateTime);
    }

    @Test
    public void specificPage1() {
        chapter1.specificPage(3);
        assertEquals(3, chapter1.getCurrentPageNum() + 1);
    }

    @Test
    public void specificPage2() {
        chapter1.specificPage(11);
        assertEquals(10, chapter1.getCurrentPageNum() + 1);
    }

    @Test
    public void specificPage3() {
        chapter1.specificPage(-1);
        assertEquals(1, chapter1.getCurrentPageNum() + 1);
    }

    @Test
    public void deltaPage1() {
        chapter1.deltaPage(1);
        assertEquals(2, chapter1.getCurrentPageNum() + 1);
    }

    @Test
    public void deltaPage2() {
        chapter1.deltaPage(-1);
        assertEquals(1, chapter1.getCurrentPageNum() + 1);
    }

    @Test
    public void deltaPage3() {
        chapter1.deltaPage(11);
        assertEquals(10, chapter1.getCurrentPageNum() + 1);
    }

    @Test
    public void clearImage() {
        chapter1.clearImages();
        assertEquals(1, chapter1.images.length);
        assertEquals(0, chapter1.getCurrentPageNum());
    }
}