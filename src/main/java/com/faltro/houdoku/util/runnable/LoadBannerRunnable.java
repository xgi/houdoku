package com.faltro.houdoku.util.runnable;

import com.faltro.houdoku.controller.SeriesController;
import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.util.ContentLoader;
import com.faltro.houdoku.util.InfoSource;
import javafx.scene.image.Image;

import java.io.IOException;

public class LoadBannerRunnable extends LoaderRunnable {
    private final InfoSource infoSource;
    private final Series series;
    private final SeriesController seriesController;

    /**
     * Runnable for loading a chapter page.
     *
     * @param contentSource     the ContentSource to load from
     * @param chapter           the Chapter the page is from
     * @param page              the 0-indexed page number
     * @param readerController  the ReaderController to update before/after
     *                          the page is loaded
     * @param preloading        whether the page is being preloaded or not
     *                          (loaded before the user gets to the page)
     * @param preloading_amount the number of subsequent pages to preload, or
     *                          -1 for infinite
     */
    public LoadBannerRunnable(String name, ContentLoader contentLoader, InfoSource infoSource,
                              Series series, SeriesController seriesController) {
        super(contentLoader, name);
        this.infoSource = infoSource;
        this.series = series;
        this.seriesController = seriesController;
    }

    @Override
    public void run() {
        Image banner = null;
        try {
            banner = infoSource.banner(series);
        } catch (IOException | NotImplementedException e) {
            e.printStackTrace();
        }

        if (banner != null) {
            series.setBanner(banner);
            seriesController.refreshContent();
        }

        finish();
    }
}
