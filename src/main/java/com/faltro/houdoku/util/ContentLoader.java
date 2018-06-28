package com.faltro.houdoku.util;

import com.faltro.houdoku.controller.LibraryController;
import com.faltro.houdoku.controller.ReaderController;
import com.faltro.houdoku.controller.SearchSeriesController;
import com.faltro.houdoku.controller.SeriesController;
import com.faltro.houdoku.data.Data;
import com.faltro.houdoku.exception.ContentUnavailableException;
import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Library;
import com.faltro.houdoku.model.Series;
import javafx.collections.FXCollections;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.stream.Collectors;

public class ContentLoader {
    /**
     * Start a thread for loading a chapter page.
     *
     * @param contentSource    the ContentSource to load from
     * @param chapter          the Chapter the page is from
     * @param page             the 0-indexed page number
     * @param readerController the ReaderController to update before/after
     *                         the page is loaded
     * @param preloading       whether the page is being preloaded or not (loaded
     *                         before the user actually gets to the page)
     */
    public static void loadPage(ContentSource contentSource, Chapter chapter, int page,
                                ReaderController readerController, boolean preloading) {
        Runnable runnableLoadPage = () -> {
            if (!preloading) {
                readerController.imageView.setImage(null);
                readerController.imageProgressIndicator.setVisible(true);
            }

            Image image = null;
            try {
                image = contentSource.image(chapter, page + 1);
            } catch (IOException | NotImplementedException e) {
                e.printStackTrace();
            } catch (ContentUnavailableException e) {
                readerController.imageProgressIndicator.setVisible(false);
                readerController.errorText.getParent().setVisible(true);
                readerController.errorText.getParent().setManaged(true);
                readerController.errorText.setText(e.getMessage() +
                        "\n(" + e.getClass().getSimpleName() + ")");
            }

            // ensure that our chapter is still the active one in the reader
            if (chapter == readerController.getChapter()) {
                chapter.images[page] = image;
                if (image != null && chapter.getCurrentPageNum() == page) {
                    readerController.imageView.setImage(image);
                    readerController.imageProgressIndicator.setVisible(false);
                    readerController.errorText.getParent().setVisible(false);
                    readerController.errorText.getParent().setManaged(false);
                    readerController.refreshPage();
                }

                // preload any additional images
                if (!preloading) {
                    chapter.preloadImages(contentSource, readerController, page + 1);
                }
            }
        };

        String thread_name = "loadPage_" + contentSource.toString() + "_" + chapter.getSource() +
                Integer.toString(page);
        startThreadSafely(thread_name, runnableLoadPage);
    }

    /**
     * Start a thread for loading a series.
     *
     * @param contentSource     the ContentSource to load from
     * @param source            the source for the series, relative to the
     *                          ContentSource domain
     * @param libraryController the LibraryController to update before/after
     *                          the series is loaded
     */
    public static void loadSeries(ContentSource contentSource, String source,
                                  LibraryController libraryController) {
        Runnable runnableLoadSeries = () -> {
            libraryController.reloadProgressIndicator.setVisible(true);

            Series series = null;
            try {
                series = contentSource.series(source);
            } catch (IOException | NotImplementedException e) {
                e.printStackTrace();
            }

            if (series != null) {
                Library library = libraryController.getLibrary();
                library.addSeries(series);
                Data.saveLibrary(library);
                libraryController.updateContent();
            }

            libraryController.reloadProgressIndicator.setVisible(false);
        };

        String thread_name = "loadSeries_" + contentSource.toString() + "_" + source;
        startThreadSafely(thread_name, runnableLoadSeries);
    }

    /**
     * Start a thread for reloading an existing series.
     *
     * @param contentSource    the ContentSource to load from
     * @param series           the series to reload
     * @param seriesController the SeriesController to update before/after the
     *                         series is reloaded
     */
    public static void reloadSeries(ContentSource contentSource, Series series,
                                    SeriesController seriesController) {
        Runnable runnableReloadSeries = () -> {
            seriesController.reloadProgressIndicator.setVisible(true);

            Series new_series = null;
            try {
                new_series = contentSource.series(series.getSource());
            } catch (IOException | NotImplementedException e) {
                e.printStackTrace();
            }

            if (new_series != null) {
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
        };

        String thread_name = "reloadSeries_" + contentSource.toString() + "_" + series.getSource();
        startThreadSafely(thread_name, runnableReloadSeries);
    }

    /**
     * Start a thread for searching for series'.
     *
     * @param contentSource          the ContentSource to load from
     * @param query                  the text to search for
     * @param searchSeriesController the SearchSeriesController to update
     *                               before/after the results are loaded
     */
    public static void search(ContentSource contentSource, String query,
                              SearchSeriesController searchSeriesController) {
        Runnable runnableSearch = () -> {
            ArrayList<HashMap<String, Object>> items = null;
            try {
                items = contentSource.search(query);
            } catch (IOException | NotImplementedException e) {
                e.printStackTrace();
            }

            if (items != null) {
                // temporarily set the image property of all series to a
                // blank placeholder
                Image blank_cover_image = new Image(
                        ContentLoader.class.getResource("/img/blank_cover.png").toString());
                for (HashMap<String, Object> item : items) {
                    ImageView imageView = new ImageView();
                    imageView.setImage(blank_cover_image);
                    item.put("cover", imageView);
                }

                searchSeriesController.results.setAll(FXCollections.observableArrayList(items));
                // update page content now since loading covers will take
                // some time
                searchSeriesController.updateContent();

                for (HashMap<String, Object> item : items) {
                    Image cover = null;
                    try {
                        if (item.containsKey("coverSrc")) {
                            // load cover using direct image source
                            cover = contentSource.imageFromURL((String) item.get("coverSrc"));
                        } else {
                            // load cover by passing series url and finding the
                            // image url on that page, then loading the image
                            cover = contentSource.cover((String) item.get("source"));
                        }
                    } catch (IOException | NotImplementedException e) {
                        e.printStackTrace(); // TODO: change to "image load error" placeholder
                    }
                    if (cover != null) {
                        ImageView coverView = (ImageView) item.get("cover");
                        coverView.setImage(cover);
                    }
                }
            }
        };

        String thread_name = "search_" + contentSource.toString() + "_" + query;
        startThreadSafely(thread_name, runnableSearch);
    }

    /**
     * Start a thread for loading a series' cover image.
     *
     * @param contentSource the ContentSource to load from
     * @param source        the absolute source for the image
     * @param imageView     the ImageView to update before/after the cover is
     *                      loaded
     */
    public static void loadCover(ContentSource contentSource, String source,
                                 ImageView imageView) {
        Runnable runnableLoadCover = () -> {
            Image cover = null;
            try {
                cover = contentSource.cover(source);
            } catch (IOException | NotImplementedException e) {
                e.printStackTrace();
            }

            if (cover != null) {
                imageView.setImage(cover);
            }
        };

        String thread_name = "loadCover_" + source;
        startThreadSafely(thread_name, runnableLoadCover);
    }

    /**
     * Start a Runnable in a new Thread while ensuring that the name does not
     * overlap with pre-existing threads.
     *
     * @param name     the name of the Thread to create
     * @param runnable the Runnable to run in the Thread
     */
    private static void startThreadSafely(String name, Runnable runnable) {
        boolean threadExists = Thread.getAllStackTraces().keySet().stream().anyMatch(
                thread -> thread.getName().equals(name)
        );
        if (!threadExists) {
            Thread thread = new Thread(runnable);
            thread.setName(name);
            thread.start();
        }
    }
}
