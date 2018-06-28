package com.faltro.houdoku.util.runnable;

import com.faltro.houdoku.controller.ReaderController;
import com.faltro.houdoku.exception.ContentUnavailableException;
import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.util.ContentLoader;
import com.faltro.houdoku.util.ContentSource;
import javafx.scene.image.Image;

import java.io.IOException;

public class LoadPageRunnable extends LoaderRunnable {
    private ContentSource contentSource;
    private Chapter chapter;
    private int page;
    private ReaderController readerController;
    private boolean preloading;

    /**
     * Runnable for loading a chapter page.
     *
     * @param contentSource    the ContentSource to load from
     * @param chapter          the Chapter the page is from
     * @param page             the 0-indexed page number
     * @param readerController the ReaderController to update before/after
     *                         the page is loaded
     * @param preloading       whether the page is being preloaded or not (loaded
     *                         before the user actually gets to the page)
     */
    public LoadPageRunnable(String name, ContentLoader contentLoader, ContentSource contentSource,
                            Chapter chapter, int page, ReaderController readerController,
                            boolean preloading) {
        super(contentLoader, name);
        this.contentSource = contentSource;
        this.chapter = chapter;
        this.page = page;
        this.readerController = readerController;
        this.preloading = preloading;
    }

    @Override
    public void run() {
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
                chapter.preloadImages(contentLoader, contentSource, readerController, page + 1);
            }
        }

        finish();
    }
}
