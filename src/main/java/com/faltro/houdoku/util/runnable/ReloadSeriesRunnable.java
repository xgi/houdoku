package com.faltro.houdoku.util.runnable;

import com.faltro.houdoku.controller.SeriesController;
import com.faltro.houdoku.data.Data;
import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.util.ContentLoader;
import com.faltro.houdoku.util.ContentSource;

import java.io.IOException;

public class ReloadSeriesRunnable extends LoaderRunnable {
    private final ContentSource contentSource;
    private final Series series;
    private final SeriesController seriesController;

    /**
     * Runnable for reloading an existing series.
     *
     * @param contentSource    the ContentSource to load from
     * @param series           the series to reload
     * @param seriesController the SeriesController to update before/after the
     *                         series is reloaded
     */
    public ReloadSeriesRunnable(String name, ContentLoader contentLoader,
                                ContentSource contentSource, Series series,
                                SeriesController seriesController) {
        super(contentLoader, name);
        this.contentSource = contentSource;
        this.series = series;
        this.seriesController = seriesController;
    }

    @Override
    public void run() {
        seriesController.reloadProgressIndicator.setVisible(true);

        Series new_series = null;
        try {
            new_series = contentSource.series(series.getSource());
        } catch (IOException | NotImplementedException e) {
            e.printStackTrace();
        }

        if (new_series != null && running) {
            // overwrite specific fields of original series object
            // Maybe better to make function in Series class to handle
            // this better? Especially since theses fields are hardcoded
            // here in a rather obtuse location.
            series.setChapters(new_series.getChapters());
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

            Data.saveLibrary(seriesController.getLibrary());
            seriesController.refreshContent();
        }

        seriesController.reloadProgressIndicator.setVisible(false);

        finish();
    }
}
