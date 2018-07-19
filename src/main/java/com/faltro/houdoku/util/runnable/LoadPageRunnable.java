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
    private final ContentSource contentSource;
    private final Chapter chapter;
    private final int page;
    private final ReaderController readerController;
    private final boolean preloading;
    private final int preloading_amount;

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
    public LoadPageRunnable(String name, ContentLoader contentLoader, ContentSource contentSource,
                            Chapter chapter, int page, ReaderController readerController,
                            boolean preloading, int preloading_amount) {
        super(contentLoader, name);
        this.contentSource = contentSource;
        this.chapter = chapter;
        this.page = page;
        this.readerController = readerController;
        this.preloading = preloading;
        this.preloading_amount = preloading_amount;
    }

    @Override
    public void run() {
        if (!preloading) {
            readerController.setImage(null);
            readerController.imageProgressIndicator.setVisible(true);
        }

        if (page < chapter.images.length) {
            if (chapter.images[page] == null) {
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
                if (chapter == readerController.getChapter() && running) {
                    chapter.images[page] = image;
                    if (image != null && chapter.getCurrentPageNum() == page) {
                        readerController.setImage(image);
                        readerController.imageProgressIndicator.setVisible(false);
                        readerController.errorText.getParent().setVisible(false);
                        readerController.errorText.getParent().setManaged(false);
                        readerController.refreshPage();
                    }
                }
            } else {
                if (chapter.getCurrentPageNum() == page) {
                    readerController.setImage(chapter.images[page]);
                    readerController.imageProgressIndicator.setVisible(false);
                    readerController.errorText.getParent().setVisible(false);
                    readerController.errorText.getParent().setManaged(false);
                    readerController.refreshPage();
                }
            }

            // preload additional pages
            if (running && (preloading_amount > 0 || preloading_amount == -1)) {
                contentLoader.loadPage(
                        contentSource, chapter, page + 1, readerController, true,
                        preloading_amount == -1 ? -1 : preloading_amount - 1);
            }
        }

        finish();
    }
}
