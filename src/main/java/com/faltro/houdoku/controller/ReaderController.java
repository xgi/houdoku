package com.faltro.houdoku.controller;

import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.util.ContentSource;
import com.faltro.houdoku.util.SceneManager;
import javafx.fxml.FXML;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.effect.ColorAdjust;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;

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
    private Button toSeriesButton;
    @FXML
    private ScrollPane imageScrollPane;
    @FXML
    private StackPane navContainer;
    @FXML
    private HBox navBar;
    @FXML
    private TextField pageNumField;
    @FXML
    private Button firstPageButton;
    @FXML
    private Button prevPageButton;
    @FXML
    private Button nextPageButton;
    @FXML
    private Button lastPageButton;
    @FXML
    private CheckMenuItem showNavBarItem;
    @FXML
    private CheckMenuItem nightModeItem;
    @FXML
    private RadioMenuItem fitHeightRadio;
    @FXML
    private RadioMenuItem fitWidthRadio;
    @FXML
    private RadioMenuItem actualSizeRadio;

    private Chapter chapter;

    public ReaderController(SceneManager sceneManager) {
        super(sceneManager);
    }

    public void setChapter(Chapter chapter) {
        this.chapter = chapter;
    }

    public void registerEventHandler(Scene scene) {
        scene.addEventHandler(KeyEvent.ANY, event -> {
            if (event.getCode() == KeyCode.RIGHT || event.getCode() == KeyCode.PAGE_DOWN) {
                nextPage();
            } else if (event.getCode() == KeyCode.LEFT || event.getCode() == KeyCode.PAGE_UP) {
                previousPage();
            } else if (event.getCode() == KeyCode.HOME) {
                firstPage();
            } else if (event.getCode() == KeyCode.END) {
                lastPage();
            }
            event.consume();
        });
    }

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

        // align series button to the left side
        toSeriesButton.translateXProperty().bind(
                toSeriesButton.layoutXProperty()
                        .multiply(-1)
                        .add(15)
        );

        // set default page number display
        pageNumField.setText("1");

        // properly size the ImageView based on default fit setting
        updateImageViewFit();
    }

    @Override
    public void onMadeActive() {
        loadCurrentPage();
    }

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
        chapter.loadCurrentImage(sceneManager.getContentLoader(), contentSource, this);
    }

    public void refreshPage() {
        int pageNum = chapter.getCurrentPageNum();

        // enable/disable appropriate navigation buttons
        prevPageButton.setDisable(pageNum < 1);
        firstPageButton.setDisable(prevPageButton.isDisable());
        nextPageButton.setDisable(pageNum + 1 >= chapter.getTotalPages());
        lastPageButton.setDisable(nextPageButton.isDisable());

        centerImageView();
    }

    @FXML
    private void specificPage() {
        chapter.specificPage(Integer.parseInt(pageNumField.getText()));
        loadCurrentPage();
    }

    @FXML
    public void firstPage() {
        chapter.specificPage(0);
        loadCurrentPage();
    }

    @FXML
    public void nextPage() {
        chapter.deltaPage(1);
        loadCurrentPage();
    }

    @FXML
    public void previousPage() {
        chapter.deltaPage(-1);
        loadCurrentPage();
    }

    @FXML
    public void lastPage() {
        chapter.specificPage(chapter.getTotalPages());
        loadCurrentPage();
    }

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

    @FXML
    private void updateImageViewFit() {
        if (fitHeightRadio.isSelected()) {
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
        } else {
            imageView.fitHeightProperty().unbind();
            imageView.fitWidthProperty().unbind();
            imageView.setFitHeight(-1);
            imageView.fitWidthProperty().bind(imageView.getImage().widthProperty());
        }

        centerImageView();
    }

    public void centerImageView() {
        imageView.setTranslateX(
                (imageScrollPane.getWidth() - imageView.getBoundsInParent().getWidth()) / 2
        );
        if (imageView.getTranslateX() < 0 || fitWidthRadio.isSelected()) {
            imageView.setTranslateX(0);
        }
    }

    @FXML
    public void goToSeries() {
        chapter.specificPage(1);
        loadCurrentPage();
        chapter.clearImages();
        sceneManager.changeToRoot(SeriesController.ID);
    }

//    private double getVScrollBarWidth() {
//        double result = 0.0;
//        for (Node node : imageScrollPane.getChildrenUnmodifiable()) {
//            if (node instanceof ScrollBar) {
//                ScrollBar scrollBar = (ScrollBar) node;
//                if (scrollBar.getOrientation() == Orientation.VERTICAL) {
//                    if (scrollBar.isVisible()) {
//                        result = scrollBar.getWidth();
//                    }
//                }
//            }
//        }
//        return result;
//    }
}
