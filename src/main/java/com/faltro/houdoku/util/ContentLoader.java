package com.faltro.houdoku.util;

import com.faltro.houdoku.controller.LibraryController;
import com.faltro.houdoku.controller.ReaderController;
import com.faltro.houdoku.controller.SearchSeriesController;
import com.faltro.houdoku.controller.SeriesController;
import com.faltro.houdoku.exception.ContentUnavailableException;
import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Library;
import com.faltro.houdoku.model.Series;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;

public class ContentLoader {
    public ContentLoader() {
    }

    public void loadPage(ContentSource contentSource, Chapter chapter, int page,
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
                    chapter.preloadImages(this, contentSource, readerController, page + 1);
                }
            }
        };

        String thread_name = "loadPage_" + contentSource.NAME + "_" + chapter.getSource() +
                Integer.toString(page);
        startThreadSafely(thread_name, runnableLoadPage);
    }

    public void loadSeries(ContentSource contentSource, String source,
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
                libraryController.updateContent();
            }

            libraryController.reloadProgressIndicator.setVisible(false);
        };

        String thread_name = "loadSeries_" + contentSource.NAME + "_" + source;
        startThreadSafely(thread_name, runnableLoadSeries);
    }

    /**
     * Creates a thread which reloads series information.
     * <p>
     * This method is notably distinctive from loadSeries, which is intended
     * to be used when initially creating a Series object.
     *
     * @param contentSource
     * @param series
     * @param seriesController
     */
    public void reloadSeries(ContentSource contentSource, Series series,
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

                seriesController.refreshContent();
            }

            seriesController.reloadProgressIndicator.setVisible(false);
        };

        String thread_name = "reloadSeries_" + contentSource.NAME + "_" + series.getSource();
        startThreadSafely(thread_name, runnableReloadSeries);
    }

    public void search(ContentSource contentSource, String query,
                       SearchSeriesController searchSeriesController) {
        Runnable runnableSearch = () -> {
//            searchSeriesController.reloadProgressIndicator.setVisible(true);

            ArrayList<HashMap<String, Object>> items = null;
            try {
                items = contentSource.search(query);
            } catch (IOException | NotImplementedException e) {
                e.printStackTrace();
            }

            if (items != null) {
                // temporarily set the image property of all series to a
                // blank placeholder
                Image blank_cover_image = new Image(getClass().getResource("/img/blank_cover.png")
                        .toString());
                for (HashMap<String, Object> item : items) {
                    item.put("cover", blank_cover_image);
                }

                ObservableList<HashMap<String, Object>> itemsObservableList = FXCollections
                        .observableArrayList
                                (items);
                searchSeriesController.tableView.setItems(itemsObservableList);

                for (HashMap<String, Object> item : items) {
                    Image cover = null;
                    try {
                        if (item.containsKey("coverSrc")) {
                            // load cover using direct image source
                            cover = contentSource.imageFromURL((String) item.get("coverSrc"));
                        } else {
                            // load cover by passing series url and finding the
                            // image url on that page, then loading the image
                            // load cover using direct image source
                            cover = contentSource.cover((String) item.get("source"));
                        }
                    } catch (IOException | NotImplementedException e) {
                        e.printStackTrace(); // TODO: change to "image load error" placeholder
                    }
                    if (cover != null) {
                        item.replace("cover", cover);
                        searchSeriesController.tableView.refresh();
                    }
                }
            }

//            seriesController.reloadProgressIndicator.setVisible(false);
        };

        String thread_name = "search_" + contentSource.NAME + "_" + query;
        startThreadSafely(thread_name, runnableSearch);
    }

    public void loadCover(ContentSource contentSource, String source,
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

    private void startThreadSafely(String name, Runnable runnable) {
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
