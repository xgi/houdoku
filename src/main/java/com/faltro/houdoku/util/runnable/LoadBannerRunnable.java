package com.faltro.houdoku.util.runnable;

import com.faltro.houdoku.controller.SeriesController;
import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.plugins.info.InfoSource;
import com.faltro.houdoku.util.ContentLoader;
import javafx.scene.image.Image;
import java.io.IOException;

public class LoadBannerRunnable extends LoaderRunnable {
    private final InfoSource infoSource;
    private final Series series;
    private final SeriesController seriesController;

    /**
     * Runnable for loading a chapter page.
     *
     * @param name             the name of the thread
     * @param contentLoader    the ContentLoader which created this instance
     * @param infoSource       the InfoSource to load from
     * @param series           the Series the banner is from
     * @param seriesController the SeriesController to update after the banner is loaded
     */
    public LoadBannerRunnable(String name, ContentLoader contentLoader, InfoSource infoSource,
            Series series, SeriesController seriesController) {
        super(name, contentLoader);
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
