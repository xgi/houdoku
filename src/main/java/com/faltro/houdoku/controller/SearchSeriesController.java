package com.faltro.houdoku.controller;

import com.faltro.houdoku.util.ContentSource;
import com.faltro.houdoku.util.SceneManager;
import javafx.beans.property.SimpleObjectProperty;
import javafx.beans.property.SimpleStringProperty;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.MouseButton;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;
import javafx.scene.text.TextAlignment;

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
    @FXML
    public TableView<HashMap<String, Object>> tableView;
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

    public SearchSeriesController(SceneManager sceneManager) {
        super(sceneManager);
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

        coverColumn.setCellValueFactory(p -> new SimpleObjectProperty<>(
                (Image) p.getValue().get("cover")
        ));
        titleColumn.setCellValueFactory(p -> new SimpleStringProperty(
                (String) p.getValue().get("details")
        ));
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
        // Bind the height of the table to the available space on the stage.
        // Since the stage is manually changed when the window for this scene
        // is created, we could not put this in initialize() because 'stage'
        // would then refer to the primaryStage
        tableView.prefHeightProperty().bind(
                stage.heightProperty()
                        .subtract(menuBar.heightProperty())
                        .subtract(searchSeriesHeader.heightProperty())
        );

        // clear current content
        searchTextField.setText("");
        tableView.setItems(FXCollections.emptyObservableList());

        // check available content sources
        ObservableList<ContentSource> contentSources = FXCollections.observableArrayList(
                sceneManager.getPluginManager().getContentSources());
        contentSourcesBox.setItems(contentSources);
        contentSourcesBox.getSelectionModel().select(0);
    }

    /**
     * @see Controller#onMadeActive()
     */
    @Override
    public void onMadeInactive() {
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
        sceneManager.getContentLoader().loadSeries(contentSource, source,
                libraryController);
        stage.hide();
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
        ContentSource contentSource = contentSourcesBox.getSelectionModel()
                .getSelectedItem();
        String query = searchTextField.getText();
        sceneManager.getContentLoader().search(contentSource, query, this);
    }
}