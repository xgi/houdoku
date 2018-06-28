package com.faltro.houdoku.controller;

import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Library;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.util.ContentSource;
import com.faltro.houdoku.util.OutputHelpers;
import com.faltro.houdoku.util.SceneManager;
import javafx.beans.property.ReadOnlyDoubleProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.transformation.FilteredList;
import javafx.collections.transformation.SortedList;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.scene.Parent;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
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
    private static final double COVER_WIDTH = 0.3;
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
    private static final int COVER_MAX_HEIGHT = 400;
    private static final int DESCRIPTION_MAX_LENGTH = 320;
    @FXML
    public ProgressIndicator reloadProgressIndicator;
    @FXML
    private VBox container;
    @FXML
    private MenuBar menuBar;
    @FXML
    private StackPane topContainer;
    @FXML
    private HBox infoContainer;
    @FXML
    private HBox descriptionContainer;
    @FXML
    private VBox metadataContainer;
    @FXML
    private VBox contentContainer;
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
    private Text textSource;
    @FXML
    private TextArea textAreaDescription;
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
    private Button toggleInfoButton;
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

        stage.widthProperty().addListener((o, oldValue, newValue) -> {
            updateCoverSize();
        });

        infoContainer.prefWidthProperty().bind(
                stage.widthProperty().multiply(INFO_WIDTH)
        );
        textAreaDescription.prefWidthProperty().bind(
                coverImageView.fitWidthProperty().add(metadataContainer.widthProperty())
        );
        toggleInfoButton.translateXProperty().bind(
                toggleInfoButton.layoutXProperty()
                        .multiply(-1)
                        .add(textAreaDescription.layoutXProperty())
                        .add(textAreaDescription.prefWidthProperty())
                        .subtract(toggleInfoButton.widthProperty())
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
            return new SimpleStringProperty(
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
                                boolean groupMatches = chapter.group
                                        .toLowerCase().contains(filter);
                                boolean languageMatches = chapter.language
                                        .toLowerCase().contains(filter);
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
    }

    /**
     * @see Controller#onMadeActive()
     */
    @Override
    public void onMadeActive() {
        refreshContent();
        updateCoverSize();

        // series.reloadFromSource will call this.refreshContent after the
        // series has been reloaded
        ContentSource contentSource = sceneManager.getPluginManager().getSource(
                series.getContentSourceId()
        );
        series.reloadFromSource(sceneManager.getContentLoader(), contentSource, this);
    }

    /**
     * @see Controller#onMadeInactive() ()
     */
    @Override
    public void onMadeInactive() {
    }

    /**
     * Set the cover image width a percentage of the stage while enforcing a
     * maximum height.
     */
    private void updateCoverSize() {
        coverImageView.setFitWidth(stage.getWidth() * COVER_WIDTH);
        if (coverImageView.getBoundsInParent().getHeight() > COVER_MAX_HEIGHT) {
            // we would like to simply use setFitHeight, but some later
            // binds require fitWidth to be appropriately set, which is
            // not done automatically
            Image image = coverImageView.getImage();
            double aspectRatio = image.getWidth() / image.getHeight();
            coverImageView.setFitWidth(aspectRatio * COVER_MAX_HEIGHT);
        }
    }

    /**
     * Refreshes the data of content fields using current this.series info.
     */
    public void refreshContent() {
        // set metadata/info fields using series info
        coverImageView.setImage(series.getCover());
        updateCoverSize();
        textTitle.setText(series.getTitle());
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
        textAreaDescription.setText(series.description);

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
                    ReaderController readerController =
                            (ReaderController) sceneManager.getController(ReaderController.ID);
                    readerController.setChapter(chapter);
                    sceneManager.changeToRoot(ReaderController.ID);
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
     * Toggles whether or not the info container is displayed.
     * <p>
     * This method also automatically forces the content to fill up the
     * available space, as appropriate based on whether the info
     * container is visible.
     * <p>
     * Called exclusively by toggleInfoButton
     */
    @FXML
    public void toggleInfo() {
        // hide/show top containers
        topContainer.setVisible(!topContainer.isVisible());
        descriptionContainer.setVisible(!descriptionContainer.isVisible());

        topContainer.setManaged(topContainer.isVisible());
        descriptionContainer.setManaged(descriptionContainer.isVisible());

        // set toggle button to the appropriate symbol
        toggleInfoButton.setText(topContainer.isVisible() ? "▲" : "▼");
    }

    /**
     * Change to the library scene.
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

    public Library getLibrary() {
        return library;
    }

    public void setSeries(Series series) {
        this.series = series;
    }

    public void setLibrary(Library library) {
        this.library = library;
    }
}