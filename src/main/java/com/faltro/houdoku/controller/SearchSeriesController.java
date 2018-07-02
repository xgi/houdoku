package com.faltro.houdoku.controller;

import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.util.ContentLoader;
import com.faltro.houdoku.util.ContentSource;
import com.faltro.houdoku.util.LayoutHelpers;
import com.faltro.houdoku.util.SceneManager;
import javafx.application.Platform;
import javafx.beans.property.SimpleDoubleProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.beans.value.ChangeListener;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.MouseButton;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.FlowPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;
import javafx.scene.text.TextAlignment;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * The controller for the search series page, where users search for and add
 * series' to their library from content sources.
 * <p>
 * The FXML file for this view is at resources/fxml/searchseries.fxml
 *
 * @see Controller
 * @see ContentSource
 */
public class SearchSeriesController extends Controller {
    public static final int ID = 3;
    private static final double COL_COVER_WIDTH = 0.15;
    private static final double COL_TITLE_WIDTH = 0.85;
    private static final double FLOW_RESULTS_ROWS = 5;
    public ObservableList<HashMap<String, Object>> results;
    @FXML
    private FlowPane flowPane;
    @FXML
    private TableView<HashMap<String, Object>> tableView;
    @FXML
    private ScrollPane coversContainer;
    @FXML
    private RadioButton layoutTableButton;
    @FXML
    private RadioButton layoutCoversButton;
    @FXML
    private VBox searchSeriesContainer;
    @FXML
    private MenuBar menuBar;
    @FXML
    private ComboBox<ContentSource> contentSourcesBox;
    @FXML
    private HBox searchSeriesHeader;
    @FXML
    private HBox searchBar;
    @FXML
    private TextField searchTextField;
    @FXML
    private TableColumn<HashMap<String, Object>, Image> coverColumn;
    @FXML
    private TableColumn<HashMap<String, Object>, String> titleColumn;
    @FXML
    public ProgressIndicator searchProgressIndicator;

    public SearchSeriesController(SceneManager sceneManager) {
        super(sceneManager);
        this.results = FXCollections.observableArrayList(new ArrayList<>());
    }

    /**
     * Initialize the components of the controller's view.
     * <p>
     * This method binds the size of components as appropriate using this class'
     * static variables. It creates and sets the cell factory and cell value
     * factory for the columns in the results table.
     *
     * @see Controller#initialize()
     */
    @FXML
    public void initialize() {
        coverColumn.prefWidthProperty().bind(
                tableView.widthProperty()
                        .multiply(COL_COVER_WIDTH)
        );
        titleColumn.prefWidthProperty().bind(
                tableView.widthProperty()
                        .multiply(COL_TITLE_WIDTH)
                        .subtract(SceneManager.VSCROLLBAR_WIDTH)
        );

        // create a right-click context menu for results
        // onAction events are set by newCellClickHandler()
        ContextMenu contextMenu = new ContextMenu();
        MenuItem itemAddSeries = new MenuItem("Add Series");
        contextMenu.getItems().add(itemAddSeries);

        coverColumn.setCellFactory(tc -> {
            TableCell<HashMap<String, Object>, Image> cell = new TableCell<>();
            cell.getStyleClass().add("tableCell");
            ImageView imageView = new ImageView();
            imageView.imageProperty().bind(cell.itemProperty());
            imageView.fitWidthProperty().bind(coverColumn.widthProperty());
            imageView.setPreserveRatio(true);
            cell.setGraphic(imageView);
            cell.setOnMouseClicked(newCellClickHandler(contextMenu));
            return cell;
        });
        titleColumn.setCellFactory(tc -> {
            TableCell<HashMap<String, Object>, String> cell = new TableCell<>();
            cell.getStyleClass().add("tableCell");
            Text text = new Text();
            text.getStyleClass().add("tableText");
            text.setTextAlignment(TextAlignment.LEFT);
            text.wrappingWidthProperty().bind(titleColumn.widthProperty());
            text.textProperty().bind(cell.itemProperty());
            text.setLineSpacing(7);
            cell.setGraphic(text);
            cell.setOnMouseClicked(newCellClickHandler(contextMenu));
            return cell;
        });

        coverColumn.setCellValueFactory(p -> {
            ImageView imageView = (ImageView) p.getValue().get("cover");
            return imageView.imageProperty();
        });
        titleColumn.setCellValueFactory(p -> new SimpleStringProperty(
                (String) p.getValue().get("details")
        ));

        // search with a blank query when changing content sources in order
        // to populate the window
        ChangeListener listener = (o, oldValue, newValue) -> {
            search();
        };
        contentSourcesBox.valueProperty().addListener(listener);
    }

    /**
     * This method updates the size of the page and updates the list of
     * available content sources from the plugin manager.
     *
     * @see Controller#onMadeActive()
     * @see com.faltro.houdoku.util.PluginManager
     * @see ContentSource
     */
    @Override
    public void onMadeActive() {
        // check available content sources
        ObservableList<ContentSource> contentSources = FXCollections.observableArrayList(
                sceneManager.getPluginManager().getContentSources());
        contentSourcesBox.setItems(contentSources);
        contentSourcesBox.getSelectionModel().select(0);
    }

    /**
     * @see Controller#onMadeInactive()
     */
    @Override
    public void onMadeInactive() {
        // clear current content
        searchTextField.setText("");
        tableView.setItems(FXCollections.emptyObservableList());
        tableView.refresh();
        flowPane.getChildren().clear();
    }

    /**
     * Updates the content of the results layouts.
     */
    public void updateContent() {
        // we update the content of both the TableView and GridPane since the
        // user can switch between the layouts at any time, and performance
        // isn't really an issue

        // update tableView
        tableView.setItems(results);
        tableView.refresh();

        // update gridPane when FX app thread is available
        Platform.runLater(() -> {
            LibraryController libraryController =
                    (LibraryController) sceneManager.getController(LibraryController.ID);

            flowPane.getChildren().clear();
            for (HashMap<String, Object> result : results) {
                String title = (String) result.get("title");
                ImageView cover = (ImageView) result.get("cover");
                Series series = libraryController.getLibrary().find(title);

                // create the result container
                StackPane result_pane = LayoutHelpers.createCoverContainer(flowPane, title, cover);

                // create the button shown when the cover is hovered to add the
                // series to the library, or to go to the series if it is
                // already in the library
                Button action_button = new Button();
                StackPane.setAlignment(action_button, Pos.CENTER);
                if (series != null) {
                    action_button.setText("Go to series");
                    action_button.setOnAction(event -> libraryController.goToSeries(series));
                } else {
                    action_button.setText("Add series");
                    action_button.setOnAction(event -> promptAddSeries(result));
                }
                result_pane.getChildren().add(action_button);

                // hide all buttons by default
                LayoutHelpers.setChildButtonVisible(result_pane, false);

                flowPane.getChildren().add(result_pane);
            }
        });

    }

    /**
     * Creates a MouseEvent handler for a cell in the results table.
     * <p>
     * This handler handles double clicking to prompt for adding a series, as
     * well as handling the actions of the given context menu if a series is
     * right clicked.
     *
     * @param contextMenu the context menu shown when right clicking
     * @return a complete MouseEvent EventHandler for a cell in the table
     */
    private EventHandler<MouseEvent> newCellClickHandler(ContextMenu contextMenu) {
        return mouseEvent -> {
            if (mouseEvent.getButton().equals(MouseButton.PRIMARY)) {
                if (mouseEvent.getClickCount() == 2) {
                    HashMap<String, Object> item = tableView.getSelectionModel().getSelectedItem();
                    // show confirmation prompt/alert before adding series to library
                    promptAddSeries(item);
                } else if (mouseEvent.getClickCount() == 1) {
                    contextMenu.hide();
                }
            } else if (mouseEvent.getButton().equals(MouseButton.SECONDARY)) {
                HashMap<String, Object> item = tableView.getSelectionModel().getSelectedItem();
                contextMenu.getItems().get(0).setOnAction(e -> addSeriesFromItem(item));
                contextMenu.show(tableView, mouseEvent.getScreenX(), mouseEvent.getScreenY());
            }
        };
    }

    /**
     * Prompt the user to add a series to the library from an item HashMap.
     * <p>
     * See {@link #addSeriesFromItem(HashMap)} for details what the HashMap
     * should contain.
     *
     * @param item a HashMap representing a series result
     */
    private void promptAddSeries(HashMap<String, Object> item) {
        Alert alert = new Alert(Alert.AlertType.CONFIRMATION, "", ButtonType.YES,
                ButtonType.NO, ButtonType.CANCEL);
        Label label = new Label("Add \"" + item.get("title") + "\" to your library?");
        label.setWrapText(true);
        alert.getDialogPane().setContent(label);
        alert.setTitle(stage.getTitle());
        alert.showAndWait();

        if (alert.getResult() == ButtonType.YES) {
            addSeriesFromItem(item);
        }
    }

    /**
     * Adds a series to the library from an item HashMap.
     * <p>
     * Since the data retrieved from content source search pages can vary, this
     * method does not rely heavily on the contents of the given HashMap. The
     * only fields used from the given item are "contentSourceId" and "source",
     * the URL for the series.
     * <p>
     * This method simply loads the series manually using the content loader,
     * and then hides this stage since we don't need it anymore.
     *
     * @param item a HashMap containing the fields described above
     * @see com.faltro.houdoku.util.ContentLoader#loadSeries(ContentSource, String,
     * LibraryController)
     */
    private void addSeriesFromItem(HashMap<String, Object> item) {
        // load full series details and add to library
        ContentSource contentSource = sceneManager.getPluginManager().getSource
                ((int) item.get("contentSourceId"));
        String source = (String) item.get("source");
        LibraryController libraryController = (LibraryController) sceneManager
                .getController(LibraryController.ID);
        sceneManager.getContentLoader().loadSeries(contentSource, source, libraryController);
        goToLibrary();
    }

    /**
     * Searches from the selected content source using the searchTextField.
     * <p>
     * The table of results is updated by the ContentLoader after loading.
     *
     * @see com.faltro.houdoku.util.ContentLoader
     * @see ContentSource
     * @see #searchTextField
     */
    @FXML
    public void search() {
        // clear current results
        tableView.setItems(FXCollections.emptyObservableList());
        tableView.refresh();
        flowPane.getChildren().clear();

        ContentSource contentSource = contentSourcesBox.getSelectionModel().getSelectedItem();
        String query = searchTextField.getText();
        sceneManager.getContentLoader().search(contentSource, query, this);
    }

    /**
     * Update the visible layout based on the selected option.
     */
    @FXML
    private void updateLayout() {
        tableView.setVisible(layoutTableButton.isSelected());
        coversContainer.setVisible(layoutCoversButton.isSelected());

        tableView.setManaged(tableView.isVisible());
        coversContainer.setManaged(coversContainer.isVisible());
    }

    /**
     * Change to the library page.
     */
    @FXML
    public void goToLibrary() {
        sceneManager.changeToRoot(LibraryController.ID);
    }
}