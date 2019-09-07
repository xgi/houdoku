package com.faltro.houdoku.controller;

import com.faltro.houdoku.Houdoku;
import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Config;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.model.Track;
import com.faltro.houdoku.plugins.content.ContentSource;
import com.faltro.houdoku.plugins.tracker.AniList;
import com.faltro.houdoku.plugins.tracker.Tracker;
import com.faltro.houdoku.util.ContentLoader;
import com.faltro.houdoku.util.SceneManager;
import javafx.application.Platform;
import javafx.beans.property.SimpleDoubleProperty;
import javafx.beans.value.ChangeListener;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.effect.ColorAdjust;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;

/**
 * The controller for the reader page.
 * <p>
 * The FXML file for this view is at resources/fxml/reader.fxml
 *
 * @see Controller
 */
public class ReaderController extends Controller {
    public static final int ID = 2;
    @FXML
    public ProgressIndicator imageProgressIndicator;
    @FXML
    public Text errorText;
    @FXML
    private ImageView imageViewSingle;
    @FXML
    private VBox container;
    @FXML
    private MenuBar menuBar;
    @FXML
    private ScrollPane imageScrollPane;
    @FXML
    private HBox navContainer;
    @FXML
    private TextField pageNumField;
    @FXML
    private TextField totalPagesField;
    @FXML
    private Button firstPageButton;
    @FXML
    private Button prevPageButton;
    @FXML
    private Button nextPageButton;
    @FXML
    private Button lastPageButton;
    @FXML
    private Button prevChapterButton;
    @FXML
    private Button nextChapterButton;
    @FXML
    private CheckMenuItem showNavBarItem;
    @FXML
    private CheckMenuItem nightModeItem;
    @FXML
    private RadioMenuItem fitAutoRadio;
    @FXML
    private RadioMenuItem fitHeightRadio;
    @FXML
    private RadioMenuItem fitWidthRadio;
    @FXML
    private RadioMenuItem actualSizeRadio;

    private Chapter chapter;
    private EventHandler<KeyEvent> keyEventHandler;
    private ChangeListener imageViewListener;

    public ReaderController(SceneManager sceneManager) {
        super(sceneManager);
    }

    /**
     * Initialize the components of the controller's view.
     * <p>
     * This method binds the size and position of components as appropriate, relative to the stage.
     * It also initializes keyEventHandler which is enabled when the page is made active.
     *
     * @see Controller#initialize()
     */
    @Override
    @FXML
    public void initialize() {
        super.initialize();

        // Position imageView in the center of imageScrollPane
        // Ideally, we would set the imageView's x position like so:
        // @formatter:off
        //
        //   imageViewSingle.translateXProperty().bind(
        //     imageScrollPane.widthProperty()
        //       .subtract(imageView.fitWidthProperty())
        //       .divide(2)
        //   );
        //
        // @formatter:on
        // However, since the image width is set automatically with
        // preserveAspectRatio, the imageView width is always 0.
        //
        // To get around this, I first considered getting the imageView's
        // boundsInParent. This allowed me to get the "real" width of the
        // imageView. However, since imageViewSingle.boundsInParentProperty is a
        // <Bounds> property and not a <Double> property, I could not bind it
        // to the imageView's translateX property.
        //
        // Instead, we add a listener to the imageScrollPane's width property
        // (which is the container of imageView) which "manually" sets the
        // imageView position to the proper ratio.
        imageScrollPane.boundsInParentProperty()
                .addListener((o, oldVal, newVal) -> centerImageView());

        // fit the imageScrollPane width to the width of the stage
        imageScrollPane.minWidthProperty().bind(stage.widthProperty());

        // increase scroll distance on image
        imageViewSingle.setOnScroll(e -> {
            // adapted from https://stackoverflow.com/a/40993755
            double deltaY = e.getDeltaY();
            double width = imageScrollPane.getContent().getBoundsInLocal().getWidth();
            double vvalue = imageScrollPane.getVvalue();
            imageScrollPane.setVvalue(vvalue + -deltaY / width);
        });

        // properly size the ImageView based on default fit setting
        updateImageViewFit();
    }

    /**
     * This method enables the keyEventHandler and begins loading the first page of the set chapter.
     *
     * @see Controller#onMadeActive()
     */
    public void onMadeActive() {
        keyEventHandler = newKeyEventHandler();
        sceneManager.getStage().getScene().addEventHandler(KeyEvent.ANY, keyEventHandler);
        applyImageFilter();
        imageViewSingle.requestFocus();
        loadCurrentPage();
    }

    /**
     * This method disables the keyEventHandler and resets components.
     *
     * @see Controller#onMadeInactive()
     */
    public void onMadeInactive() {
        // stop active page loads
        sceneManager.getContentLoader().stopThreads(ContentLoader.PREFIX_LOAD_PAGE);

        sceneManager.getStage().getScene().removeEventHandler(KeyEvent.ANY, keyEventHandler);
        imageProgressIndicator.setVisible(false);
        errorText.getParent().setVisible(false);
        errorText.getParent().setManaged(false);

        totalPagesField.setText("??");
        chapter.clearImages();
    }

    /**
     * Create a new KeyEvent EventHandler for controlling the page.
     * <p>
     * Normally it would be sufficient to simply create the handler in initialize(), but the config
     * with key bindings may change before the client is restarted, so we instead make a new event
     * handler at every onMadeActive() using the current config.
     * <p>
     * We also could have put Config.getValue's in the event itself, but that would be very
     * inefficient. We also take account for the invert reading style checkbox user config, if it
     * has been ticked we invert the keys for keyprevious and keynext.
     *
     * @return a complete KeyEvent EventHandler for the reader page
     */
    private EventHandler<KeyEvent> newKeyEventHandler() {
        Config config = sceneManager.getConfig();

        // We account for whether the invert reading style checkbox has been checked by the user
        boolean invertReadingStyle = (boolean) config.getValue(Config.Field.INVERT_READING_STYLE);

        KeyCode keyPrevPage =
                KeyCode.valueOf((String) config.getValue(Config.Field.READER_KEY_PREV_PAGE));
        KeyCode keyNextPage =
                KeyCode.valueOf((String) config.getValue(Config.Field.READER_KEY_NEXT_PAGE));
        KeyCode keyFirstPage =
                KeyCode.valueOf((String) config.getValue(Config.Field.READER_KEY_FIRST_PAGE));
        KeyCode keyLastPage =
                KeyCode.valueOf((String) config.getValue(Config.Field.READER_KEY_LAST_PAGE));
        KeyCode keyToSeries =
                KeyCode.valueOf((String) config.getValue(Config.Field.READER_KEY_TO_SERIES));



        return event -> {
            // only handle KeyEvent.KEY_RELEASE -- not ideal, since this may
            // make the client appear slower to respond, but most non-letter
            // keys are not picked up by KEY_PRESSED
            if (event.getEventType() == KeyEvent.KEY_RELEASED) {
                // only perform actions if the user is not in the page num textfield

                if (!pageNumField.isFocused()) {

                    KeyCode keyPrev = keyPrevPage;
                    KeyCode keyNext = keyNextPage;
                    // Check if invert reading style setting is active.
                    if (invertReadingStyle) {
                        keyPrev = keyNextPage;
                        keyNext = keyPrevPage;
                    }

                    if (event.getCode() == keyPrev) {
                        if (chapter.getCurrentPageNum() == 0 && !prevChapterButton.isDisabled()) {
                            previousChapter();
                        } else {
                            previousPage();
                        }
                    } else if (event.getCode() == keyNext) {
                        if (chapter.getCurrentPageNum() >= chapter.getTotalPages() - 1
                                && !nextChapterButton.isDisabled()) {
                            nextChapter();
                        } else {
                            nextPage();
                        }
                    } else if (event.getCode() == keyFirstPage) {
                        firstPage();
                    } else if (event.getCode() == keyLastPage) {
                        lastPage();
                    } else if (event.getCode() == keyToSeries) {
                        goToSeries();
                    }
                }
                event.consume();
            }
        };
    }

    /**
     * @see Controller#toggleNightMode()
     */
    @Override
    public void toggleNightMode() {
        super.toggleNightMode();
        applyImageFilter();
    }

    /**
     * Begin loading the image for the current page.
     *
     * @see com.faltro.houdoku.util.ContentLoader#loadPage(ContentSource, Chapter, int,
     *      ReaderController, boolean, int)
     */
    private void loadCurrentPage() {
        // clear current page and show progress indicator so the user
        // clearly understands that the new page is being loaded
        setImage(null);
        imageProgressIndicator.setVisible(true);

        // set text field to current page number
        int currentPageNum = chapter.getCurrentPageNum();
        pageNumField.setText(Integer.toString(currentPageNum + 1));

        // determine how many pages to preload, if any
        Config config = sceneManager.getConfig();
        boolean restrict_preload_pages =
                (boolean) config.getValue(Config.Field.RESTRICT_PRELOAD_PAGES);
        int preloading_amount =
                restrict_preload_pages ? (int) config.getValue(Config.Field.PRELOAD_PAGES_AMOUNT)
                        : -1;

        // start the thread to load the page, which will subsequently begin
        // preloading pages if necessary
        ContentSource contentSource =
                sceneManager.getPluginManager().getSource(chapter.getSeries().getContentSourceId());
        sceneManager.getContentLoader().loadPage(contentSource, chapter, currentPageNum, this,
                false, preloading_amount);
    }

    /**
     * Set the image of the reader's ImageView.
     * <p>
     * This method ensures that the image is set when the FX thread is available.
     *
     * @param image the Image to display in the ImageView
     * @see #imageView
     */
    public void setImage(Image image) {
        Platform.runLater(() -> imageViewSingle.setImage(image));
    }

    /**
     * Update components using fields from the set chapter. Taking account of whether invert reading
     * style setting is active.
     */
    public void refreshPage() {
        int page_num = chapter.getCurrentPageNum();
        // enable/disable appropriate navigation buttons

        Config config = sceneManager.getConfig();

        // We account for whether the invert reading style checkbox has been checked by the user
        boolean invertReadingStyle = (boolean) config.getValue(Config.Field.INVERT_READING_STYLE);

        // When invert reading style setting is active, user reads from left to right.
        // Meaning left/prev would go to the next page
        // And right/next would go to the previous page
        if (invertReadingStyle) {
            prevPageButton.setDisable(page_num + 1 >= chapter.getTotalPages());
            nextPageButton.setDisable(page_num < 1);
        } else {
            prevPageButton.setDisable(page_num < 1);
            nextPageButton.setDisable(page_num + 1 >= chapter.getTotalPages());
        }
        firstPageButton.setDisable(prevPageButton.isDisable());
        lastPageButton.setDisable(nextPageButton.isDisable());

        // update the number of total pages
        totalPagesField.setText(Integer.toString(chapter.getTotalPages()));

        centerImageView();
    }

    /**
     * Center the imageView on the stage.
     */
    private void centerImageView() {
        imageViewSingle.setTranslateX(
                (imageScrollPane.getWidth() - imageViewSingle.getBoundsInParent().getWidth()) / 2);
        if (imageViewSingle.getTranslateX() < 0 || fitWidthRadio.isSelected()) {
            imageViewSingle.setTranslateX(0);
        }
    }

    /**
     * Go to, and load, the page represented by the contents of pageNumField.
     *
     * @see #pageNumField
     */
    @FXML
    private void specificPage() {
        chapter.specificPage(Integer.parseInt(pageNumField.getText()));
        loadCurrentPage();
    }

    /**
     * Go to, and load, the first page.
     */
    @FXML
    private void firstPage() {
        chapter.specificPage(0);
        loadCurrentPage();
    }

    /**
     * Go to, and load, the next page.
     */
    @FXML
    private void nextPage() {
        chapter.deltaPage(1);
        loadCurrentPage();
    }

    /**
     * Go to, and load, the previous page.
     */
    @FXML
    private void previousPage() {
        chapter.deltaPage(-1);
        loadCurrentPage();
    }

    /**
     * The left page function is called by the previous page button on the UI. Default action is to
     * go to the previous page however if the invert reading style is active, then it will go to the
     * next page.
     */
    @FXML
    private void leftPage() {
        // Get the current configuration settings
        Config config = sceneManager.getConfig();

        // We account for whether the invert reading style checkbox has been checked by the user
        boolean invertReadingStyle = (boolean) config.getValue(Config.Field.INVERT_READING_STYLE);

        // If invert reading style setting is active instead of previous page we go to the next page
        if (invertReadingStyle)
            nextPage();
        else
            previousPage();
    }

    /**
     * The right page function is called by the next page button on the UI. Default action is to go
     * to the next page however if the invert reading style is active, then it will go to the
     * previous page.
     */
    @FXML
    private void rightPage() {
        // Get the current configuration settings
        Config config = sceneManager.getConfig();

        // We account for whether the invert reading style checkbox has been checked by the user
        boolean invertReadingStyle = (boolean) config.getValue(Config.Field.INVERT_READING_STYLE);

        // If invert reading style setting is active instead of next page we go to previous page
        if (invertReadingStyle)
            previousPage();
        else
            nextPage();
    }


    /**
     * Go to, and load, the last page.
     */
    @FXML
    private void lastPage() {
        chapter.specificPage(chapter.getTotalPages());
        loadCurrentPage();
    }

    /**
     * Go to the previous chapter and load the first page.
     * <p>
     * This function does not validate whether a previous chapter is actually available - that
     * should be enforced by disabling the prev chapter button.
     */
    @FXML
    private void previousChapter() {
        setChapter(chapter.getSeries().smartPreviousChapter(chapter));

        // reset the number of total pages
        totalPagesField.setText("??");

        firstPage();
    }

    /**
     * Go to the next chapter and load the first page.
     */
    @FXML
    private void nextChapter() {
        setChapter(chapter.getSeries().smartNextChapter(chapter));

        // reset the number of total pages
        totalPagesField.setText("??");

        firstPage();
    }

    /**
     * Toggle whether the navigation bar is visible.
     * <p>
     * The navigation bar is the top bar which contains the page number display and forward/back
     * buttons. Users who hide the bar can still navigate the display using the key shortcuts
     * defined in keyEventHandler.
     *
     * @see #showNavBarItem
     * @see #navContainer
     * @see #keyEventHandler
     */
    @FXML
    private void toggleNavBar() {
        navContainer.setVisible(showNavBarItem.isSelected());
        if (showNavBarItem.isSelected()) {
            navContainer.setMinHeight(navContainer.getPrefHeight());
            navContainer.setMaxHeight(navContainer.getPrefHeight());
        } else {
            navContainer.setMinHeight(0);
            navContainer.setMaxHeight(0);
        }

        // ensure the page image is sized appropriately
        updateImageViewFit();
    }

    /**
     * Apply the appropriate filter to the page ImageView, if necessary.
     */
    private void applyImageFilter() {
        ColorAdjust filter_adjust = null;
        Config config = sceneManager.getConfig();

        boolean night_mode_enabled = (boolean) config.getValue(Config.Field.NIGHT_MODE_ENABLED);
        boolean night_mode_only =
                (boolean) config.getValue(Config.Field.PAGE_FILTER_NIGHT_MODE_ONLY);

        if (night_mode_enabled || !night_mode_only) {
            filter_adjust = new ColorAdjust();
            // apply color filter
            if ((boolean) config.getValue(Config.Field.PAGE_FILTER_COLOR_ENABLED)) {
                filter_adjust.setHue((double) config.getValue(Config.Field.PAGE_FILTER_COLOR_HUE));
                filter_adjust.setSaturation(
                        (double) config.getValue(Config.Field.PAGE_FILTER_COLOR_SATURATION));
            }
            // apply brightness filter
            if ((boolean) config.getValue(Config.Field.PAGE_FILTER_BRIGHTNESS_ENABLED)) {
                filter_adjust = new ColorAdjust();
                filter_adjust.setBrightness(
                        (double) config.getValue(Config.Field.PAGE_FILTER_BRIGHTNESS));
            }
        }
        imageViewSingle.setEffect(filter_adjust);
    }

    /**
     * Update the imageViewSingle fit properties corresponding to the selected style.
     *
     * @see #imageView
     * @see #fitAutoRadio
     * @see #fitHeightRadio
     * @see #fitWidthRadio
     * @see #actualSizeRadio
     */
    @FXML
    private void updateImageViewFit() {
        if (fitAutoRadio.isSelected()) {
            imageViewListener = (o, oldValue, newValue) -> {
                imageViewSingle.fitWidthProperty().unbind();
                imageViewSingle.fitHeightProperty().unbind();
                imageViewSingle.fitHeightProperty()
                        .bind(container.heightProperty().subtract(menuBar.heightProperty())
                                .subtract(navContainer.minHeightProperty()));
                if (imageViewSingle.getBoundsInParent().getWidth() > container.getWidth()) {
                    imageViewSingle.fitHeightProperty().unbind();
                    imageViewSingle.fitWidthProperty().bind(container.widthProperty());
                }

                centerImageView();
            };
        } else if (fitHeightRadio.isSelected()) {
            imageViewListener = (o, oldValue, newValue) -> {
                imageViewSingle.fitWidthProperty().unbind();
                imageViewSingle.setFitWidth(-1);
                imageViewSingle.fitHeightProperty()
                        .bind(container.heightProperty().subtract(menuBar.heightProperty())
                                .subtract(navContainer.minHeightProperty()));

                centerImageView();
            };
        } else if (fitWidthRadio.isSelected()) {
            imageViewListener = (o, oldValue, newValue) -> {
                imageViewSingle.fitHeightProperty().unbind();
                imageViewSingle.setPreserveRatio(false);
                imageViewSingle.setFitHeight(-1);
                imageViewSingle.setPreserveRatio(true);
                imageViewSingle.fitWidthProperty()
                        .bind(container.widthProperty().subtract(SceneManager.VSCROLLBAR_WIDTH));

                centerImageView();
            };
        } else if (actualSizeRadio.isSelected()) {
            imageViewListener = (o, oldValue, newValue) -> {
                imageViewSingle.fitHeightProperty().unbind();
                imageViewSingle.fitWidthProperty().unbind();
                imageViewSingle.setFitHeight(-1);
                imageViewSingle.fitWidthProperty()
                        .bind(imageViewSingle.getImage() == null ? new SimpleDoubleProperty(0)
                                : imageViewSingle.getImage().widthProperty());

                centerImageView();
            };
        }

        // add the listener to all meaningful properties -- the value of the
        // passed arguments don't matter
        container.heightProperty().addListener(imageViewListener);
        container.widthProperty().addListener(imageViewListener);
        imageViewSingle.imageProperty().addListener(imageViewListener);
        // hack to force listener operation to run
        // we wouldn't be able to do this if the listener function depended
        // on the given arguments
        imageViewListener.changed(new SimpleDoubleProperty(0), 0, 0);
    }

    /**
     * Go to the series page.
     * <p>
     * This method does not explicitly ensure that the series page contains the information for the
     * expected series (that is, the series which contains the current chapter). It is expected that
     * the components of the series page are not cleared when the reader is opened, and also that
     * the series page has been loaded prior to opening the reader.
     *
     * @see SeriesController
     */
    @FXML
    private void goToSeries() {
        sceneManager.changeToRoot(SeriesController.ID);
    }

    public Chapter getChapter() {
        return chapter;
    }

    public void setChapter(Chapter chapter) {
        // clear images from the previous chapter
        if (this.chapter != null) {
            this.chapter.clearImages();
        }

        this.chapter = chapter;

        // enable/disable next and previous chapter buttons
        Series series = chapter.getSeries();
        nextChapterButton.setDisable(series.smartNextChapter(chapter) == null);
        prevChapterButton.setDisable(series.smartPreviousChapter(chapter) == null);

        // update read status of new chapter
        chapter.setRead(true);

        // upload read count on tracker if enabled
        Config config = sceneManager.getConfig();
        String series_id = series.getTrackerId(AniList.ID);
        int chapter_num = (int) Math.round(chapter.chapterNum);
        if ((boolean) config.getValue(Config.Field.TRACKER_ANILIST_UPDATE_AUTO)) {
            Tracker tracker = sceneManager.getPluginManager().getTracker(AniList.ID);

            Track track = new Track(series_id, null, null, chapter_num, null, null);
            sceneManager.getContentLoader().updateSeriesTracker(tracker, series_id, track, true,
                    false);
        }

        stage.setTitle(Houdoku.getName() + " - " + chapter.toString());
    }
}
