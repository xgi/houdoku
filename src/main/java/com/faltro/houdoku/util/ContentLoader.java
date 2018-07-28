package com.faltro.houdoku.util;

import com.faltro.houdoku.controller.LibraryController;
import com.faltro.houdoku.controller.ReaderController;
import com.faltro.houdoku.controller.SearchSeriesController;
import com.faltro.houdoku.controller.SeriesController;
import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.util.runnable.*;

import java.util.ArrayList;
import java.util.stream.Collectors;

public class ContentLoader {
    public static final String PREFIX_LOAD_PAGE = "loadPage_";
    public static final String PREFIX_RELOAD_SERIES = "reloadSeries_";
    public static final String PREFIX_SEARCH = "search_";
    private static final String PREFIX_LOAD_SERIES = "loadSeries_";
    private final ArrayList<LoaderRunnable> runnables;

    public ContentLoader() {
        this.runnables = new ArrayList<>();
    }

    /**
     * Create a LoaderRunnable for loading a chapter page.
     *
     * @see LoadPageRunnable
     */
    public void loadPage(ContentSource contentSource, Chapter chapter, int page,
                         ReaderController readerController, boolean preloading,
                         int preloading_amount) {
        String name = PREFIX_LOAD_PAGE + contentSource.toString() + "_" + chapter.getSource() +
                Integer.toString(page);
        LoaderRunnable runnable = new LoadPageRunnable(
                name, this, contentSource, chapter, page, readerController, preloading,
                preloading_amount
        );
        startThreadSafely(name, runnable);
    }

    /**
     * Create a LoaderRunnable for loading a series.
     *
     * @see LoadSeriesRunnable
     */
    public void loadSeries(ContentSource contentSource, String source,
                           LibraryController libraryController) {
        String name = PREFIX_LOAD_SERIES + contentSource.toString() + "_" + source;
        LoaderRunnable runnable = new LoadSeriesRunnable(
                name, this, contentSource, source, libraryController
        );
        startThreadSafely(name, runnable);
    }

    /**
     * Create a LoaderRunnable for reloading an existing series.
     *
     * @see ReloadSeriesRunnable
     */
    public void reloadSeries(ContentSource contentSource, Series series, boolean quick,
                             SeriesController seriesController) {
        String name = PREFIX_RELOAD_SERIES + contentSource.toString() + "_" + series.getSource();
        LoaderRunnable runnable = new ReloadSeriesRunnable(
                name, this, contentSource, series, quick, seriesController
        );
        startThreadSafely(name, runnable);
    }

    /**
     * Create a LoaderRunnable for searching for series'.
     *
     * @see SearchRunnable
     */
    public void search(ContentSource contentSource, String query,
                       SearchSeriesController searchSeriesController) {
        // stop running search threads, since if they exist they are probably
        // loading covers that we don't need anymore
        stopThreads(PREFIX_SEARCH);

        String name = PREFIX_SEARCH + contentSource.toString() + "_" + query;
        LoaderRunnable runnable = new SearchRunnable(
                name, this, contentSource, query, searchSeriesController
        );
        startThreadSafely(name, runnable);
    }

    /**
     * Start a Runnable in a new Thread while ensuring that the name does not
     * overlap with pre-existing threads.
     *
     * @param name     the name of the Thread to create
     * @param runnable the Runnable to run in the Thread
     */
    private void startThreadSafely(String name, LoaderRunnable runnable) {
        boolean threadExists = Thread.getAllStackTraces().keySet().stream().anyMatch(
                thread -> thread.getName().equals(name)
        );
        if (!threadExists) {
            Thread thread = new Thread(runnable);
            thread.setName(name);
            thread.start();
            runnables.add(runnable);
        }
    }

    /**
     * Request threads with names starting with the given prefix to stop.
     * <p>
     * This method does not guarantee the threads to immediately stop -- it
     * simply calls requestStop() on all matching running LoaderRunnable's.
     *
     * @param prefix the prefix of the thread names to stop
     */
    public void stopThreads(String prefix) {
        ArrayList<LoaderRunnable> matching = runnables.stream().filter(
                runnable -> runnable.getName().startsWith(prefix)
        ).collect(Collectors.toCollection(ArrayList::new));

        for (LoaderRunnable runnable : matching) {
            runnable.requestStop();
        }
    }

    /**
     * Request all threads to stop.
     * <p>
     * This method does not guarantee the threads to immediately stop -- it
     * simply calls requestStop() on all matching running LoaderRunnable's.
     */
    public void stopAllThreads() {
        for (LoaderRunnable runnable : runnables) {
            runnable.requestStop();
        }
    }

    public ArrayList<LoaderRunnable> getRunnables() {
        return runnables;
    }
}
