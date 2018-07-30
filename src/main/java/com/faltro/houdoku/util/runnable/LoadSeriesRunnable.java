package com.faltro.houdoku.util.runnable;

import com.faltro.houdoku.controller.LibraryController;
import com.faltro.houdoku.controller.SearchSeriesController;
import com.faltro.houdoku.exception.ContentUnavailableException;
import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.model.Library;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.util.ContentLoader;
import com.faltro.houdoku.util.ContentSource;

import java.io.IOException;

public class LoadSeriesRunnable extends LoaderRunnable {
    private final ContentSource contentSource;
    private final String source;
    private final SearchSeriesController searchSeriesController;
    private final LibraryController libraryController;

    /**
     * Runnable for loading a series.
     *
     * @param contentSource     the ContentSource to load from
     * @param source            the source for the series, relative to the
     *                          ContentSource domain
     * @param libraryController the LibraryController to update before/after
     *                          the series is loaded
     */
    public LoadSeriesRunnable(String name, ContentLoader contentLoader, ContentSource contentSource,
                              String source, SearchSeriesController searchSeriesController,
                              LibraryController libraryController) {
        super(contentLoader, name);
        this.contentSource = contentSource;
        this.source = source;
        this.searchSeriesController = searchSeriesController;
        this.libraryController = libraryController;
    }

    @Override
    public void run() {
        libraryController.reloadProgressIndicator.setVisible(true);

        Series series = null;
        try {
            series = contentSource.series(source, false);
        } catch (ContentUnavailableException e) {
            searchSeriesController.promptError(
                    "An error occurred while adding the series:\n\n" + e.getMessage());
        } catch (IOException | NotImplementedException e) {
            e.printStackTrace();
        }

        if (series != null) {
            Library library = libraryController.getLibrary();
            library.addSeries(series);
            libraryController.updateContent();
        }

        libraryController.reloadProgressIndicator.setVisible(false);

        finish();
    }
}
