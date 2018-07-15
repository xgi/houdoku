package com.faltro.houdoku.controller;

import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Config;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.util.ContentLoader;
import com.faltro.houdoku.util.ContentSource;
import com.faltro.houdoku.util.SceneManager;
import javafx.beans.property.SimpleDoubleProperty;
import javafx.beans.value.ChangeListener;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.effect.ColorAdjust;
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
    public ImageView imageView;
    @FXML
    public ProgressIndicator imageProgressIndicator;
    @FXML
    public Text errorText;
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

    public ReaderController(SceneManager sceneManager) {
        super(sceneManager);
    }

    /**
     * Initialize the components of the controller's view.
     * <p>
     * This method binds the size and position of components as appropriate,
     * relative to the stage. It also initializes keyEventHandler which is
     * enabled when the page is made active.
     *
     * @see Controller#initialize()
     */
    @Override
    @FXML
    public void initialize() {
        super.initialize();

        // Position imageView in the center of imageScrollPane
        // Ideally, we would set the imageView's x position like so:
        //   imageView.translateXProperty().bind(
        //     imageScrollPane.widthProperty()
        //       .subtract(imageView.fitWidthProperty())
        //       .divide(2)
        //   );
        // However, since the image width is set automatically with
        // preserveAspectRatio, the imageView width is always 0.
        //
        // To get around this, I first considered getting the imageView's
        // boundsInParent. This allowed me to get the "real" width of the
        // imageView. However, since imageView.boundsInParentProperty is a
        // <Bounds> property and not a <Double> property, I could not bind it
        // to the imageView's translateX property.
        //
        // Instead, we add a listener to the imageScrollPane's width property
        // (which is the container of imageView) which "manually" sets the
        // imageView position to the proper ratio.
        imageScrollPane.boundsInParentProperty().addListener((o, oldVal, newVal) ->
                centerImageView()
        );

        // fit the imageScrollPane width to the width of the stage
        imageScrollPane.minWidthProperty().bind(stage.widthProperty());
        imageScrollPane.minHeightProperty().bind(stage.heightProperty());

        // properly size the ImageView based on default fit setting
        updateImageViewFit();
    }

    /**
     * This method enables the keyEventHandler and begins loading the first page
     * of the set chapter.
     *
     * @see Controller#onMadeActive()
     */
    @Override
    public void onMadeActive() {
        keyEventHandler = newKeyEventHandler();
        sceneManager.getStage().getScene().addEventHandler(KeyEvent.ANY, keyEventHandler);
        applyImageFilter();
        imageView.requestFocus();
        loadCurrentPage();
    }

    /**
     * This method disables the keyEventHandler and resets components.
     *
     * @see Controller#onMadeInactive()
     */
    @Override
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
     * Normally it would be sufficient to simply create the handler in
     * initialize(), but the config with key bindings may change before the
     * client is restarted, so we instead make a new event handler at every
     * onMadeActive() using the current config.
     * <p>
     * We also could have put Config.getValue's in the event itself, but that
     * would be very inefficient.
     *
     * @return a complete KeyEvent EventHandler for the reader page
     */
    private EventHandler<KeyEvent> newKeyEventHandler() {
        Config config = sceneManager.getConfig();
        KeyCode keyPrevPage = KeyCode.valueOf(
                (String) config.getValue(Config.Field.READER_KEY_PREV_PAGE));
        KeyCode keyNextPage = KeyCode.valueOf(
                (String) config.getValue(Config.Field.READER_KEY_NEXT_PAGE));
        KeyCode keyFirstPage = KeyCode.valueOf(
                (String) config.getValue(Config.Field.READER_KEY_FIRST_PAGE));
        KeyCode keyLastPage = KeyCode.valueOf(
                (String) config.getValue(Config.Field.READER_KEY_LAST_PAGE));
        KeyCode keyToSeries = KeyCode.valueOf(
                (String) config.getValue(Config.Field.READER_KEY_TO_SERIES));

        return event -> {
            // only handle KeyEvent.KEY_RELEASE -- not ideal, since this may
            // make the client appear slower to respond, but most non-letter
            // keys are not picked up by KEY_PRESSED
            if (event.getEventType() == KeyEvent.KEY_RELEASED) {
                // only perform actions if the user is not in the page num textfield
                if (!pageNumField.isFocused()) {
                    if (event.getCode() == keyPrevPage) {
                        if (chapter.getCurrentPageNum() == 0 && !prevChapterButton.isDisabled()) {
                            previousChapter();
                        } else {
                            previousPage();
                        }
                    } else if (event.getCode() == keyNextPage) {
                        if (chapter.getCurrentPageNum() >= chapter.getTotalPages() - 1 &&
                                !nextChapterButton.isDisabled()) {
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
     * @see com.faltro.houdoku.util.ContentLoader#loadPage(ContentSource,
     * Chapter, int, ReaderController, boolean, int)
     */
    private void loadCurrentPage() {
        int currentPageNum = chapter.getCurrentPageNum();

        // set text field to current page number
        pageNumField.setText(Integer.toString(currentPageNum + 1));

        ContentSource contentSource = sceneManager.getPluginManager().getSource(
                chapter.getSeries().getContentSourceId()
        );

        // determine how many pages to preload, if any
        Config config = sceneManager.getConfig();
        boolean restrict_preload_pages =
                (boolean) config.getValue(Config.Field.RESTRICT_PRELOAD_PAGES);
        int preloading_amount = restrict_preload_pages ?
                (int) config.getValue(Config.Field.PRELOAD_PAGES_AMOUNT) : -1;

        // start the thread to load the page, will will subsequently begin
        // preloading pages if necessary
        sceneManager.getContentLoader().loadPage(
                contentSource, chapter, currentPageNum, this, false, preloading_amount);
    }

    /**
     * Update components using fields from the set chapter.
     */
    public void refreshPage() {
        int page_num = chapter.getCurrentPageNum();
        // enable/disable appropriate navigation buttons
        prevPageButton.setDisable(page_num < 1);
        firstPageButton.setDisable(prevPageButton.isDisable());
        nextPageButton.setDisable(page_num + 1 >= chapter.getTotalPages());
        lastPageButton.setDisable(nextPageButton.isDisable());

        // update the number of total pages
        totalPagesField.setText(Integer.toString(chapter.getTotalPages()));

        centerImageView();
    }

    /**
     * Center the imageView on the stage.
     */
    private void centerImageView() {
        imageView.setTranslateX(
                (imageScrollPane.getWidth() - imageView.getBoundsInParent().getWidth()) / 2
        );
        if (imageView.getTranslateX() < 0 || fitWidthRadio.isSelected()) {
            imageView.setTranslateX(0);
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
    public void firstPage() {
        chapter.specificPage(0);
        loadCurrentPage();
    }

    /**
     * Go to, and load, the next page.
     */
    @FXML
    public void nextPage() {
        chapter.deltaPage(1);
        loadCurrentPage();
    }

    /**
     * Go to, and load, the previous page.
     */
    @FXML
    public void previousPage() {
        chapter.deltaPage(-1);
        loadCurrentPage();
    }

    /**
     * Go to, and load, the last page.
     */
    @FXML
    public void lastPage() {
        chapter.specificPage(chapter.getTotalPages());
        loadCurrentPage();
    }

    /**
     * Go to the previous chapter and load the first page.
     * <p>
     * This function does not validate whether a previous chapter is actually
     * available - that should be enforced by disabling the prev chapter button.
     */
    @FXML
    public void previousChapter() {
        setChapter(chapter.getSeries().smartPreviousChapter(chapter));

        // reset the number of total pages
        totalPagesField.setText("??");

        firstPage();
    }

    /**
     * Go to the next chapter and load the first page.
     */
    @FXML
    public void nextChapter() {
        setChapter(chapter.getSeries().smartNextChapter(chapter));

        // reset the number of total pages
        totalPagesField.setText("??");

        firstPage();
    }

    /**
     * Toggle whether the navigation bar is visible.
     * <p>
     * The navigation bar is the top bar which contains the page number display
     * and forward/back buttons. Users who hide the bar can still navigate
     * the display using the key shortcuts defined in keyEventHandler.
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
        Config config = sceneManager.getConfig();
        ColorAdjust filter_adjust = null;
        if ((boolean) config.getValue(Config.Field.NIGHT_MODE_ENABLED)) {
            String filter_type = (String) config.getValue(Config.Field.PAGE_FILTER_TYPE);
            switch (filter_type) {
                case "color": {
                    filter_adjust = new ColorAdjust();
                    filter_adjust.setHue(
                            (double) config.getValue(Config.Field.PAGE_FILTER_COLOR_HUE));
                    filter_adjust.setSaturation(
                            (double) config.getValue(Config.Field.PAGE_FILTER_COLOR_SATURATION));
                    break;
                }
                case "brightness": {
                    filter_adjust = new ColorAdjust();
                    filter_adjust.setBrightness(
                            (double) config.getValue(Config.Field.PAGE_FILTER_BRIGHTNESS));
                    break;
                }
            }
        }
        imageView.setEffect(filter_adjust);
    }

    /**
     * Update the imageView fit properties corresponding to the selected style.
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
            imageView.fitWidthProperty().unbind();
            imageView.fitHeightProperty().unbind();
            ChangeListener listener = (o, oldValue, newValue) -> {
                imageView.fitHeightProperty().bind(
                        stage.heightProperty()
                                .subtract(menuBar.heightProperty())
                                .subtract(navContainer.minHeightProperty())
                                .subtract(SceneManager.VSCROLLBAR_WIDTH)
                );
                if (imageView.getBoundsInParent().getWidth() > stage.getWidth()) {
                    imageView.fitHeightProperty().unbind();
                    imageView.fitWidthProperty().bind(
                            stage.widthProperty()
                    );
                }
            };
            stage.heightProperty().addListener(listener);
            imageView.imageProperty().addListener(listener);
            // hack to force listener operation to run
            // we wouldn't be able to do this if the listener function depended
            // on the given arguments
            listener.changed(new SimpleDoubleProperty(0), 0, 0);
        } else if (fitHeightRadio.isSelected()) {
            imageView.fitWidthProperty().unbind();
            imageView.setFitWidth(-1);
            imageView.fitHeightProperty().bind(
                    stage.heightProperty()
                            .subtract(menuBar.heightProperty())
                            .subtract(navContainer.minHeightProperty())
                            .subtract(SceneManager.VSCROLLBAR_WIDTH)
            );
        } else if (fitWidthRadio.isSelected()) {
            imageView.fitHeightProperty().unbind();
            imageView.setPreserveRatio(false);
            imageView.setFitHeight(-1);
            imageView.setPreserveRatio(true);
            imageView.fitWidthProperty().bind(
                    imageScrollPane.widthProperty()
                            .subtract(SceneManager.VSCROLLBAR_WIDTH)
            );
        } else if (actualSizeRadio.isSelected()) {
            imageView.fitHeightProperty().unbind();
            imageView.fitWidthProperty().unbind();
            imageView.setFitHeight(-1);
            imageView.fitWidthProperty().bind(imageView.getImage().widthProperty());
        }

        centerImageView();
    }

    /**
     * Go to the series page.
     * <p>
     * This method does not explicitly ensure that the series page contains the
     * information for the expected series (that is, the series which contains
     * the current chapter). It is expected that the components of the series
     * page are not cleared when the reader is opened, and also that the series
     * page has been loaded prior to opening the reader.
     *
     * @see SeriesController
     */
    @FXML
    public void goToSeries() {
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
    }
}
