package com.faltro.houdoku.util.runnable;

import com.faltro.houdoku.controller.SearchSeriesController;
import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.util.ContentLoader;
import com.faltro.houdoku.util.ContentSource;
import com.faltro.houdoku.util.ParseHelpers;
import javafx.collections.FXCollections;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;

public class SearchRunnable extends LoaderRunnable {
    private ContentSource contentSource;
    private String query;
    private SearchSeriesController searchSeriesController;

    /**
     * Start a thread for searching for series'.
     *
     * @param contentSource          the ContentSource to load from
     * @param query                  the text to search for
     * @param searchSeriesController the SearchSeriesController to update
     *                               before/after the results are loaded
     */
    public SearchRunnable(String name, ContentLoader contentLoader, ContentSource contentSource,
                          String query, SearchSeriesController searchSeriesController) {
        super(contentLoader, name);
        this.contentSource = contentSource;
        this.query = query;
        this.searchSeriesController = searchSeriesController;
    }

    @Override
    public void run() {
        searchSeriesController.searchProgressIndicator.setVisible(true);

        ArrayList<HashMap<String, Object>> items = null;
        try {
            items = contentSource.search(query);
        } catch (IOException | NotImplementedException e) {
            e.printStackTrace();
        }

        searchSeriesController.searchProgressIndicator.setVisible(false);

        if (items != null) {
            // truncate items to at most 20 results
            items = new ArrayList<>(items.subList(0, items.size() < 20 ? items.size() : 20));

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
            // update page content now since loading covers will take some time
            searchSeriesController.updateContent();

            for (HashMap<String, Object> item : items) {
                if (running) {
                    Image cover = null;
                    try {
                        if (item.containsKey("coverSrc")) {
                            // load cover using direct image source
                            cover = contentSource.imageFromURL(
                                    (String) item.get("coverSrc"), ParseHelpers.COVER_MAX_WIDTH);
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
        }

        finish();
    }
}
