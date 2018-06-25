package com.faltro.houdoku.controller;

import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Series;
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

import java.util.ArrayList;

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

        // create the keyEventHandler for controlling reader with key commands
        keyEventHandler = event -> {
            // only perform actions if the user is not in the page num textfield
            if (!pageNumField.isFocused()) {
                if (event.getCode() == KeyCode.RIGHT || event.getCode() == KeyCode.PAGE_DOWN) {
                    nextPage();
                } else if (event.getCode() == KeyCode.LEFT || event.getCode() == KeyCode.PAGE_UP) {
                    previousPage();
                } else if (event.getCode() == KeyCode.HOME) {
                    firstPage();
                } else if (event.getCode() == KeyCode.END) {
                    lastPage();
                }
            }
            event.consume();
        };

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
        sceneManager.getStage().getScene().addEventHandler(KeyEvent.ANY, keyEventHandler);

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
        sceneManager.getStage().getScene().removeEventHandler(KeyEvent.ANY, keyEventHandler);
        imageProgressIndicator.setVisible(false);
        errorText.getParent().setVisible(false);
        errorText.getParent().setManaged(false);
    }

    /**
     * Begin loading the image for the current page.
     * <p>
     * Updating this view's components (primarily the loading spinner and the
     * image view itself) is done by the ContentLoader.
     *
     * @see com.faltro.houdoku.util.ContentLoader#loadPage(ContentSource,
     * Chapter, int, ReaderController, boolean)
     */
    private void loadCurrentPage() {
        // by default set the load indicated to invisible, which may be
        // reverted if we start downloading the image later
        imageProgressIndicator.setVisible(false);

        // set text field to current page number
        pageNumField.setText(Integer.toString(chapter.getCurrentPageNum() + 1));

        // chapter.loadCurrentImage will call this.refreshPage after the
        // image is loaded
        ContentSource contentSource = sceneManager.getPluginManager().getSource(
                chapter.getSeries().getContentSourceId()
        );
        chapter.loadCurrentImage(contentSource, this);
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
     * Toggle whether night mode is enabled.
     * <p>
     * When night mode is enabled, this method currently only applies a color
     * filter to the image view. In the future, we may want to also alter the
     * style of the client as a whole.
     *
     * @see #nightModeItem
     */
    @FXML
    private void toggleNightMode() {
        if (nightModeItem.isSelected()) {
            ColorAdjust nightModeAdjust = new ColorAdjust();
            nightModeAdjust.setHue(0.25);
            nightModeAdjust.setSaturation(0.33);
            imageView.setEffect(nightModeAdjust);
        } else {
            imageView.setEffect(null);
        }
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
        chapter.specificPage(1);
        loadCurrentPage();
        chapter.clearImages();
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
