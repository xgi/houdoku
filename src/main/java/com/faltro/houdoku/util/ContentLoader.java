package com.faltro.houdoku.util;

import com.faltro.houdoku.controller.*;
import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.model.Track;
import com.faltro.houdoku.plugins.content.ContentSource;
import com.faltro.houdoku.plugins.info.InfoSource;
import com.faltro.houdoku.plugins.tracker.Tracker;
import com.faltro.houdoku.plugins.tracker.TrackerOAuth;
import com.faltro.houdoku.util.runnable.*;
import java.util.ArrayList;
import java.util.stream.Collectors;

public class ContentLoader {
    public static final String PREFIX_LOAD_PAGE = "loadPage_";
    public static final String PREFIX_RELOAD_SERIES = "reloadSeries_";
    public static final String PREFIX_SEARCH = "search_";
    private static final String PREFIX_LOAD_SERIES = "loadSeries_";
    private static final String PREFIX_LOAD_BANNER = "loadBanner_";
    private static final String PREFIX_GENERATE_OAUTH_TOKEN = "generateOAuthToken_";
    private static final String PREFIX_UPDATE_SERIES_TRACKER = "updateSeriesTracker_";
    private static final String PREFIX_LOAD_SERIES_TRACKER = "loadSeriesTracker_";
    private final ArrayList<LoaderRunnable> runnables;

    public ContentLoader() {
        this.runnables = new ArrayList<>();
    }

    /**
     * Create a LoaderRunnable for loading a chapter page.
     *
     * @param contentSource     the ContentSource to load from
     * @param chapter           the Chapter the page is from
     * @param page              the 0-indexed page number
     * @param readerController  the ReaderController to update before/after the page is loaded
     * @param preloading        whether the page is being preloaded or not (loaded before the user
     *                          gets to the page)
     * @param preloading_amount the number of subsequent pages to preload, or -1 for infinite
     * @see LoadPageRunnable
     */
    public void loadPage(ContentSource contentSource, Chapter chapter, int page,
            ReaderController readerController, boolean preloading, int preloading_amount) {
        String name = PREFIX_LOAD_PAGE + contentSource.toString() + "_" + chapter.getSource()
                + Integer.toString(page);
        LoaderRunnable runnable = new LoadPageRunnable(name, this, contentSource, chapter, page,
                readerController, preloading, preloading_amount);
        startThreadSafely(name, runnable);
    }

    /**
     * Create a LoaderRunnable for loading a series.
     *
     * @param contentSource          the ContentSource to load from
     * @param source                 the source for the series, relative to the ContentSource domain
     * @param searchSeriesController the SearchSeriesController to report errors to
     * @param libraryController      the LibraryController to update before/after the series is
     *                               loaded
     * @see LoadSeriesRunnable
     */
    public void loadSeries(ContentSource contentSource, String source,
            SearchSeriesController searchSeriesController, LibraryController libraryController) {
        String name = PREFIX_LOAD_SERIES + contentSource.toString() + "_" + source;
        LoaderRunnable runnable = new LoadSeriesRunnable(name, this, contentSource, source,
                searchSeriesController, libraryController);
        startThreadSafely(name, runnable);
    }

    /**
     * Create a LoaderRunnable for reloading an existing series.
     *
     * @param contentSource    the ContentSource to load from
     * @param series           the series to reload
     * @param quick            whether the list of chapters should be "quickly" reloaded, which
     *                         ensures that only one total HTTP request is made, but does not
     *                         guarantee that all chapters are loaded
     * @param seriesController the SeriesController to update before/after the series is reloaded
     * @see ReloadSeriesRunnable
     */
    public void reloadSeries(ContentSource contentSource, Series series, boolean quick,
            SeriesController seriesController) {
        String name = PREFIX_RELOAD_SERIES + contentSource.toString() + "_" + series.getSource();
        LoaderRunnable runnable = new ReloadSeriesRunnable(name, this, contentSource, series, quick,
                seriesController);
        startThreadSafely(name, runnable);
    }

    /**
     * Create a LoaderRunnable for searching for series'.
     *
     * @param contentSource          the ContentSource to load from
     * @param query                  the text to search for
     * @param searchSeriesController the SearchSeriesController to update before/after the results
     *                               are loaded
     * @see SearchRunnable
     */
    public void search(ContentSource contentSource, String query,
            SearchSeriesController searchSeriesController) {
        // stop running search threads, since if they exist they are probably
        // loading covers that we don't need anymore
        stopThreads(PREFIX_SEARCH);

        String name = PREFIX_SEARCH + contentSource.toString() + "_" + query;
        LoaderRunnable runnable =
                new SearchRunnable(name, this, contentSource, query, searchSeriesController);
        startThreadSafely(name, runnable);
    }

    /**
     * Create a LoaderRunnable for loading a series banner.
     *
     * @param infoSource       the InfoSource to load from
     * @param series           the Series the banner is from
     * @param seriesController the SeriesController to update after the banner is loaded
     * @see LoadBannerRunnable
     */
    public void loadBanner(InfoSource infoSource, Series series,
            SeriesController seriesController) {
        String name = PREFIX_LOAD_BANNER + infoSource.toString() + "_" + series.getTitle();
        LoaderRunnable runnable =
                new LoadBannerRunnable(name, this, infoSource, series, seriesController);
        startThreadSafely(name, runnable);
    }

    /**
     * Generate an OAuth token using a verification code.
     *
     * @param tracker          the TrackerOAuth to load from
     * @param code             a verification code given by the user after authorization
     * @param configController the ConfigController to update after the token is generated
     * @see GenerateOAuthTokenRunnable
     */
    public void generateOAuthToken(TrackerOAuth tracker, String code,
            ConfigController configController) {
        String name = PREFIX_GENERATE_OAUTH_TOKEN + tracker.toString() + "_" + code;
        LoaderRunnable runnable =
                new GenerateOAuthTokenRunnable(name, this, tracker, code, configController);
        startThreadSafely(name, runnable);
    }

    /**
     * Update the number of chapters read on a tracker.
     *
     * @param tracker the Tracker to update
     * @param id      the series id
     * @param track   a Track instance with the desired fields to modify
     * @param safe    whether to avoid decreasing number from the tracker
     * @param can_add whether to add the series to the user's list if not already in it
     */
    public void updateSeriesTracker(Tracker tracker, String id, Track track, boolean safe,
            boolean can_add) {
        String name = PREFIX_UPDATE_SERIES_TRACKER + tracker.toString() + "_" + id;
        LoaderRunnable runnable =
                new UpdateSeriesTrackerRunnable(name, this, tracker, id, track, safe, can_add);
        startThreadSafely(name, runnable);
    }

    /**
     * Load details from a series in the user's list on a tracker.
     * 
     * @param tracker          the Tracker to load from
     * @param series           the Series to get data for
     * @param seriesController the SeriesController to update after loading details on tracker
     */
    public void loadSeriesTracker(Tracker tracker, Series series,
            SeriesController seriesController) {
        String name = PREFIX_LOAD_SERIES_TRACKER + tracker.toString() + "_" + series.getTitle();
        LoaderRunnable runnable =
                new LoadSeriesTrackerRunnable(name, this, tracker, series, seriesController);
        startThreadSafely(name, runnable);
    }

    /**
     * Start a Runnable in a new Thread while ensuring that the name does not overlap with
     * pre-existing threads.
     *
     * @param name     the name of the Thread to create
     * @param runnable the Runnable to run in the Thread
     */
    private void startThreadSafely(String name, LoaderRunnable runnable) {
        boolean threadExists = Thread.getAllStackTraces().keySet().stream()
                .anyMatch(thread -> thread.getName().equals(name));
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
     * This method does not guarantee the threads to immediately stop -- it simply calls
     * requestStop() on all matching running LoaderRunnable's.
     *
     * @param prefix the prefix of the thread names to stop
     */
    public void stopThreads(String prefix) {
        ArrayList<LoaderRunnable> matching =
                runnables.stream().filter(runnable -> runnable.getName().startsWith(prefix))
                        .collect(Collectors.toCollection(ArrayList::new));

        for (LoaderRunnable runnable : matching) {
            runnable.requestStop();
        }
    }

    /**
     * Request all threads to stop.
     * <p>
     * This method does not guarantee the threads to immediately stop -- it simply calls
     * requestStop() on all matching running LoaderRunnable's.
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
