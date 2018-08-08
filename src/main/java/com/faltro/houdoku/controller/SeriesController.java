package com.faltro.houdoku.controller;

import com.faltro.houdoku.Houdoku;
import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Config;
import com.faltro.houdoku.model.Library;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.util.*;
import javafx.beans.property.ReadOnlyDoubleProperty;
import javafx.beans.property.SimpleDoubleProperty;
import javafx.beans.property.SimpleIntegerProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.transformation.FilteredList;
import javafx.collections.transformation.SortedList;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.geometry.Rectangle2D;
import javafx.scene.Parent;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyEvent;
import javafx.scene.input.MouseButton;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;
import javafx.scene.text.TextAlignment;
import javafx.util.Callback;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * The controller for the series page.
 * <p>
 * The FXML file for this view is at resources/fxml/series.fxml
 *
 * @see Controller
 */
public class SeriesController extends Controller {
    public static final int ID = 1;
    private static final double INFO_WIDTH = 0.7;
    private static final double[] COL_WIDTHS = {
            0.30, // title
            0.07, // volume
            0.07, // chapter
            0.10, // language
            0.16, // group
            0.10, // views
            0.20, // date
    };
    /**
     * The height of the banner image.
     */
    private static final int BANNER_HEIGHT = 220;
    /**
     * The height of the cover image.
     */
    private static final int COVER_HEIGHT = 176;
    /**
     * The offset of the cover from the left of the container.
     */
    private static final int COVER_OFFSET_X = 80;
    /**
     * The offset of the cover from the top of the container.
     */
    private static final int COVER_OFFSET_Y = 30;
    /**
     * The maximum number of characters to display of the title.
     */
    private static final int TITLE_MAX_CHARS = 30;
    /**
     * The offset of the title from the left of the container.
     */
    private static final int TITLE_OFFSET_X = 230;
    /**
     * The offset of the title from the bottom of the banner image.
     */
    private static final int TITLE_OFFSET_Y = -15;
    @FXML
    public ProgressIndicator reloadProgressIndicator;
    @FXML
    private VBox container;
    @FXML
    private MenuBar menuBar;
    @FXML
    private StackPane bannerContainer;
    @FXML
    private ImageView bannerImageView;
    @FXML
    private VBox metadataContainer;
    @FXML
    private ScrollPane metadataScrollPane;
    @FXML
    private ImageView coverImageView;
    @FXML
    private Button toLibraryButton;
    @FXML
    private Text textTitle;
    @FXML
    private Text textAltNames;
    @FXML
    private Text textAuthor;
    @FXML
    private Text textArtist;
    @FXML
    private Text textRating;
    @FXML
    private Text textViews;
    @FXML
    private Text textFollows;
    @FXML
    private Text textGenres;
    @FXML
    private Text textStatus;
    @FXML
    private Text textNumChapters;
    @FXML
    private Text textContentSource;
    @FXML
    private Text textDescription;
    @FXML
    private TableView<Chapter> tableView;
    @FXML
    private TableColumn<Chapter, String> titleColumn;
    @FXML
    private TableColumn<Chapter, String> volumeColumn;
    @FXML
    private TableColumn<Chapter, String> chapterColumn;
    @FXML
    private TableColumn<Chapter, String> languageColumn;
    @FXML
    private TableColumn<Chapter, String> groupColumn;
    @FXML
    private TableColumn<Chapter, String> viewsColumn;
    @FXML
    private TableColumn<Chapter, String> dateColumn;
    @FXML
    private HBox filterBar;
    @FXML
    private TextField filterTextField;

    private Series series;
    private Library library;
    private FilteredList<Chapter> filteredData;

    public SeriesController(SceneManager sceneManager) {
        super(sceneManager);
    }

    /**
     * Initialize the components of the controller's view.
     * <p>
     * This method binds the size of components as appropriate using this class'
     * static variables. It creates and sets the cell factory and cell value
     * factory for the columns in the chapters table.
     *
     * @see Controller#initialize()
     */
    @Override
    @FXML
    public void initialize() {
        super.initialize();

        metadataContainer.maxWidthProperty().bind(
                metadataScrollPane.widthProperty()
                        .subtract(new SimpleIntegerProperty(SceneManager.VSCROLLBAR_WIDTH))
                        .subtract(new SimpleDoubleProperty(metadataScrollPane.getPadding().getLeft()))
                        .subtract(new SimpleDoubleProperty(metadataScrollPane.getPadding().getRight()))
        );

        // create an array of the columns for easier bulk operations
        List<TableColumn<Chapter, String>> columns = Arrays.asList(
                titleColumn, volumeColumn, chapterColumn, languageColumn,
                groupColumn, viewsColumn, dateColumn
        );
        assert COL_WIDTHS.length == columns.size() : "Number of specified " +
                "chapter table columns does not match number of specified " +
                "column widths (implementation error)";

        // perform operations common to each column
        for (TableColumn<Chapter, String> column : columns) {
            // bind column widths to a percentage of the table width
            // manually resizing columns (by user) is disabled in the fxml
            column.prefWidthProperty().bind(
                    tableView.widthProperty()
                            .multiply(COL_WIDTHS[columns.indexOf(column)])
            );

            // create column cell factories which simply display strings as
            // Text objects in each cell
            column.setCellFactory(newStringCellFactory(column.widthProperty()));
        }

        // set the last column's width to subtract the scrollbar width
        columns.get(columns.size() - 1).prefWidthProperty().bind(
                tableView.widthProperty()
                        .multiply(COL_WIDTHS[columns.size() - 1])
                        .subtract(SceneManager.VSCROLLBAR_WIDTH)
        );

        // create column cell value factories with appropriate field
        titleColumn.setCellValueFactory(p -> {
            String title = p.getValue().getTitle();
            return new SimpleStringProperty(title);
        });
        volumeColumn.setCellValueFactory(p -> {
            int volumeNum = p.getValue().volumeNum;
            return new SimpleStringProperty(volumeNum == 0 ? "?" :
                    Integer.toString(volumeNum));
        });
        chapterColumn.setCellValueFactory(p -> {
            double chapterNum = p.getValue().chapterNum;
            return new SimpleStringProperty(OutputHelpers.doubleToString(chapterNum));
        });
        languageColumn.setCellValueFactory(p -> {
            String language = p.getValue().language;
            return new SimpleStringProperty(language == null ? "?" : language);
        });
        groupColumn.setCellValueFactory(p -> {
            String group = p.getValue().group;
            return new SimpleStringProperty(group == null ? "?" : group);
        });
        viewsColumn.setCellValueFactory(p -> {
            int views = p.getValue().views;
            return new SimpleStringProperty(views == 0 ? "?" :
                    Integer.toString(views));
        });
        dateColumn.setCellValueFactory(p -> {
            LocalDateTime localDateTime = p.getValue().localDateTime;
            return new SimpleStringProperty(localDateTime == null ? "?" :
                    localDateTime.format(OutputHelpers.dateTimeFormatter));
        });

        // create blank FilteredList with predicate based on filterTextField
        this.filteredData = new FilteredList<>(FXCollections.emptyObservableList());
        filterTextField.textProperty().addListener(
                (observable, oldValue, newValue) ->
                        this.filteredData.setPredicate(chapter -> {
                            // We allow the user to specify multiple filter
                            // strings, separated by a comma. For a series to
                            // match the filter, ALL sections must be present
                            // in at least one of the title, group, language,
                            // or chapterNum
                            String[] filters = filterTextField.getText().toLowerCase().split(",");
                            boolean matches_all = true;
                            for (String filter : filters) {
                                boolean titleMatches = chapter.getTitle()
                                        .toLowerCase().contains(filter);
                                boolean groupMatches = chapter.group != null &&
                                        chapter.group.toLowerCase().contains(filter);
                                boolean languageMatches = chapter.language != null &&
                                        chapter.language.toLowerCase().contains(filter);
                                boolean chapterNumMatches = Double.toString(chapter.chapterNum)
                                        .toLowerCase().contains(filter);

                                matches_all = matches_all && (
                                        titleMatches || groupMatches ||
                                                languageMatches || chapterNumMatches
                                );
                            }
                            return matches_all;
                        })
        );

        // apply adjustments to the banner and its contents
        bannerContainer.setMinHeight(BANNER_HEIGHT + COVER_OFFSET_Y);

        bannerImageView.setEffect(LayoutHelpers.BANNER_ADJUST);
        container.widthProperty().addListener((observableValue, oldValue, newValue) ->
                updateBannerSize()
        );

        coverImageView.setFitHeight(COVER_HEIGHT);
        coverImageView.setTranslateX(COVER_OFFSET_X);
        textTitle.setTranslateX(TITLE_OFFSET_X);
        textTitle.setTranslateY(-COVER_OFFSET_Y + TITLE_OFFSET_Y);

        coverImageView.setEffect(LayoutHelpers.COVER_ADJUST_DEFAULT);

        // add KeyEvent handlers for navigation
        container.setOnKeyPressed(keyEvent -> {
            if (keyEvent.getEventType() == KeyEvent.KEY_PRESSED) {
                if (keyEvent.getCode() == KeyCode.BACK_SPACE) {
                    goToLibrary();
                }
            }
        });
        tableView.setOnKeyPressed(keyEvent -> {
            if (keyEvent.getEventType() == KeyEvent.KEY_PRESSED) {
                if (keyEvent.getCode() == KeyCode.ENTER) {
                    goToSelectedChapter();
                }
            }
        });
    }

    /**
     * @see Controller#onMadeActive()
     */
    public void onMadeActive() {
        stage.setTitle(Houdoku.getName() + " - " + series.getTitle());

        refreshContent();

        // reload the series from the content source
        ContentSource contentSource = sceneManager.getPluginManager().getSource(
                series.getContentSourceId()
        );
        sceneManager.getContentLoader().reloadSeries(contentSource, series,
                (boolean) sceneManager.getConfig().getValue(Config.Field.QUICK_RELOAD_SERIES),
                this);

        // load the banner for the series
        InfoSource infoSource = sceneManager.getPluginManager().getInfoSource();
        sceneManager.getContentLoader().loadBanner(infoSource, series, this);
    }

    /**
     * @see Controller#onMadeInactive() ()
     */
    public void onMadeInactive() {
        filterTextField.setText("");
    }

    /**
     * Update the size/viewport of the banner to fill the container width.
     */
    private void updateBannerSize() {
        Image image = series.getBanner();

        if (bannerImageView.getImage() != null) {
            double image_width = image.getWidth();
            double image_height = image.getHeight();
            double max_width = container.getWidth();
            double max_height = BANNER_HEIGHT;
            double image_aspect_ratio = image_width / image_height;
            double max_aspect_ratio = max_width / max_height;

            if (max_aspect_ratio >= image_aspect_ratio) {
                double width = image_width;
                double height = width * max_height / max_width;
                double start_x = (image_width - width) / 2;
                double start_y = (image_height - height) / 2;

                Rectangle2D banner_viewport = new Rectangle2D(
                        start_x, start_y, width, height
                );

                bannerImageView.setViewport(banner_viewport);
                bannerImageView.setFitWidth(max_width);
            } else {
                double height = image_height;
                double width = height * max_width / max_height;
                double start_x = (image_width - width) / 2;
                double start_y = (image_height - height) / 2;

                Rectangle2D banner_viewport = new Rectangle2D(
                        start_x, start_y, width, height
                );

                bannerImageView.setViewport(banner_viewport);
                bannerImageView.setFitHeight(max_height);
            }
        }
    }

    /**
     * Refreshes the data of content fields using current this.series info.
     */
    public void refreshContent() {
        // set metadata/info fields using series info
        coverImageView.setImage(series.getCover());
        bannerImageView.setImage(series.getBanner());
        updateBannerSize();
        textTitle.setText(OutputHelpers.truncate(series.getTitle(), TITLE_MAX_CHARS));
        textAltNames.setText(String.join(", ", series.altNames));
        textAuthor.setText(series.author);
        textArtist.setText(series.artist);
        textRating.setText(Double.toString(series.rating) + " (" + Integer.toString(series.ratings)
                + " users)");
        textViews.setText(Integer.toString(series.views));
        textFollows.setText(Integer.toString(series.follows));
        textGenres.setText(String.join(", ", series.genres));
        textStatus.setText(series.status);
        textNumChapters.setText(Integer.toString(series.getNumHighestChapter()) + " (" +
                Integer.toString(series.getNumChapters()) + " releases)");
        textContentSource.setText(sceneManager.getPluginManager().getSource(
                series.getContentSourceId()).toString());
        textDescription.setText(series.description);

        // hide metadata field rows if the field is unset
        textAltNames.getParent().getParent().setVisible(series.altNames.length > 0);
        textAuthor.getParent().getParent().setVisible(!series.author.equals(""));
        textArtist.getParent().getParent().setVisible(!series.artist.equals(""));
        textRating.getParent().getParent().setVisible(series.rating != 0);
        textViews.getParent().getParent().setVisible(series.views != 0);
        textFollows.getParent().getParent().setVisible(series.follows != 0);
        textGenres.getParent().getParent().setVisible(series.genres.length > 0);
        textStatus.getParent().getParent().setVisible(!series.status.equals(""));

        for (Text text : Arrays.asList(
                textAltNames, textAuthor, textArtist, textRating,
                textViews, textFollows, textGenres, textStatus)) {
            Parent row = text.getParent().getParent();
            row.setManaged(row.isVisible());
        }

        // add filtered and sorted chapter list to table
        filteredData = new FilteredList<>(
                FXCollections.observableArrayList(series.getChapters())
        );
        SortedList<Chapter> sortedData = new SortedList<>(filteredData);
        sortedData.comparatorProperty().bind(tableView.comparatorProperty());
        tableView.setItems(sortedData);
    }

    /**
     * Creates a standard MouseEvent "click handler" for a table cell.
     * <p>
     * The event checks for a double left click. When it happens, it
     * identifies the chapter of the selected row and changes the scene
     * to the reader with the specified chapter.
     *
     * @return a standard MouseEvent EventHandler for a table cell
     */
    private EventHandler<MouseEvent> newCellClickHandler() {
        return mouseEvent -> {
            if (mouseEvent.getButton().equals(MouseButton.PRIMARY)) {
                if (mouseEvent.getClickCount() == 2) {
                    Chapter chapter = tableView.getSelectionModel().getSelectedItem();
                    goToReader(chapter);
                }
            }
        };
    }

    /**
     * Creates a Callback of a standard cell factory for a table cell.
     * <p>
     * The cell factory represents the String content as a JavaFX Text
     * object using the "tableText" style class. The cell is given a click
     * handler from newCellClickHandler().
     *
     * @param widthProperty the widthProperty of this cell's column
     * @return a Callback of a standard cell factory for a table cell
     */
    private Callback<TableColumn<Chapter, String>, TableCell<Chapter, String>> newStringCellFactory(
            ReadOnlyDoubleProperty widthProperty) {
        return tc -> {
            TableCell<Chapter, String> cell = new TableCell<>();
            cell.getStyleClass().add("tableCell");
            Text text = new Text();
            text.getStyleClass().add("tableText");
            text.setTextAlignment(TextAlignment.LEFT);
            cell.setGraphic(text);
            text.wrappingWidthProperty().bind(widthProperty);
            text.textProperty().bind(cell.itemProperty());
            cell.setOnMouseClicked(newCellClickHandler());
            return cell;
        };
    }

    /**
     * Change to the library page.
     * <p>
     * Called exclusively by toLibraryButton
     *
     * @see LibraryController
     * @see #toLibraryButton
     */
    @FXML
    public void goToLibrary() {
        sceneManager.changeToRoot(LibraryController.ID);
    }

    /**
     * Change to the reader page.
     *
     * @param chapter the chapter for the reader
     */
    private void goToReader(Chapter chapter) {
        // stop any active reload threads since they may interfere with how the
        // reader handles next/previous chapters
        sceneManager.getContentLoader().stopThreads(ContentLoader.PREFIX_RELOAD_SERIES);

        ReaderController readerController =
                (ReaderController) sceneManager.getController(ReaderController.ID);
        readerController.setChapter(chapter);
        sceneManager.changeToRoot(ReaderController.ID);
    }

    /**
     * Change to the reader page with the selected chapter.
     * <p>
     * If no chapter is selected, this function does nothing.
     */
    @FXML
    private void goToSelectedChapter() {
        Chapter chapter = tableView.getSelectionModel().getSelectedItem();
        if (series != null) {
            goToReader(chapter);
        }
    }

    public Library getLibrary() {
        return library;
    }

    public void setLibrary(Library library) {
        this.library = library;
    }

    public void setSeries(Series series) {
        this.series = series;
    }
}