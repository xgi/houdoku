package com.faltro.houdoku.util.runnable;

import com.faltro.houdoku.controller.SeriesController;
import com.faltro.houdoku.data.Data;
import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.util.ContentLoader;
import com.faltro.houdoku.util.ContentSource;

import java.io.IOException;
import java.util.ArrayList;

public class ReloadSeriesRunnable extends LoaderRunnable {
    private final ContentSource contentSource;
    private final Series series;
    private final boolean quick;
    private final SeriesController seriesController;

    /**
     * Runnable for reloading an existing series.
     *
     * @param contentSource    the ContentSource to load from
     * @param series           the series to reload
     * @param quick            whether the list of chapters should be "quickly"
     *                         reloaded, which ensures that only one total HTTP
     *                         request is made, but does not guarantee that all
     *                         chapters are loaded
     * @param seriesController the SeriesController to update before/after the
     *                         series is reloaded
     */
    public ReloadSeriesRunnable(String name, ContentLoader contentLoader,
                                ContentSource contentSource, Series series, boolean quick,
                                SeriesController seriesController) {
        super(contentLoader, name);
        this.contentSource = contentSource;
        this.series = series;
        this.quick = quick;
        this.seriesController = seriesController;
    }

    @Override
    public void run() {
        seriesController.reloadProgressIndicator.setVisible(true);

        Series new_series = null;
        try {
            new_series = contentSource.series(series.getSource(), quick);
        } catch (IOException | NotImplementedException e) {
            e.printStackTrace();
        }

        if (new_series != null && running) {
            // overwrite specific fields of original series object
            // Maybe better to make function in Series class to handle
            // this better? Especially since theses fields are hardcoded
            // here in a rather obtuse location.
            series.setCover(new_series.getCover());
            series.language = new_series.language;
            series.author = new_series.author;
            series.artist = new_series.artist;
            series.status = new_series.status;
            series.altNames = new_series.altNames;
            series.description = new_series.description;
            series.views = new_series.views;
            series.follows = new_series.follows;
            series.rating = new_series.rating;
            series.ratings = new_series.ratings;
            series.genres = new_series.genres;

            // safely replace chapters as necessary
            ArrayList<Chapter> new_chapters = new_series.getChapters();
            if (!quick) {
                series.setChapters(new_series.getChapters());
            } else {
                ArrayList<Chapter> old_chapters = series.getChapters();
                for (Chapter new_chapter : new_chapters) {
                    boolean found_match = false;
                    for (Chapter old_chapter : old_chapters) {
                        if (new_chapter.chapterNum == old_chapter.chapterNum
                                && ((new_chapter.language == null && old_chapter.language == null)
                                || new_chapter.language.equalsIgnoreCase(old_chapter.language))
                                && ((new_chapter.group == null && old_chapter.group == null)
                                || new_chapter.group.equalsIgnoreCase(old_chapter.group))) {
                            old_chapter.setTitle(new_chapter.getTitle());
                            old_chapter.setSource(new_chapter.getSource());
                            old_chapter.chapterNum = new_chapter.chapterNum;
                            old_chapter.volumeNum = new_chapter.volumeNum;
                            old_chapter.views = new_chapter.views;
                            old_chapter.localDateTime = new_chapter.localDateTime;
                            found_match = true;
                        }
                    }
                    if (!found_match) {
                        old_chapters.add(new_chapter);
                    }
                }
                // hack to ensure that the chapter array is sorted
                series.setChapters(series.getChapters());
            }

            Data.saveLibrary(seriesController.getLibrary());
            seriesController.refreshContent();
        }

        seriesController.reloadProgressIndicator.setVisible(false);

        finish();
    }
}
