package com.faltro.houdoku.controller;

import com.faltro.houdoku.data.Data;
import com.faltro.houdoku.model.Config;
import com.faltro.houdoku.util.SceneManager;
import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.Node;
import javafx.scene.control.*;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Text;

/**
 * The controller for the config page.
 * <p>
 * The FXML file for this view is at resources/fxml/config.fxml
 *
 * @see Controller
 */
public class ConfigController extends Controller {
    public static final int ID = 4;
    /**
     * The fixed position of the divider between the topics list and content.
     */
    private static final float FIXED_CONTENT_DIVIDER_POS = 0.3f;
    /**
     * The width of the content container as a multiplier of the root width.
     */
    private static final double CONTENT_WIDTH = 0.7;

    @FXML
    private VBox container;
    @FXML
    private SplitPane configSplitPane;
    @FXML
    private ListView<HBox> listView;
    @FXML
    private VBox configContentContainer;

    private Config config;

    public ConfigController(SceneManager sceneManager) {
        super(sceneManager);

        Config loaded_config = Data.loadConfig();
        this.config = loaded_config == null ? new Config() : loaded_config;
    }

    /**
     * Initialize the components of the controller's view.
     *
     * @see Controller#initialize()
     */
    @Override
    @FXML
    public void initialize() {
        super.initialize();

        // set the position of the divider
        configSplitPane.setDividerPosition(0, FIXED_CONTENT_DIVIDER_POS);

        // populate the listView with topics
        ObservableList<HBox> items = FXCollections.observableArrayList();
        for (Node node : configContentContainer.getChildren()) {
            HBox item_container = new HBox();
            item_container.getStyleClass().add("listItem");
            Text item_text = new Text(node.getUserData().toString());
            item_container.getChildren().add(item_text);
            items.add(item_container);
        }
        listView.setItems(items);

        // add listener to update the content panel when items are selected
        listView.getSelectionModel().selectedItemProperty().addListener(
                (observableValue, hBox, t1) -> updateContent()
        );
    }

    /**
     * @see Controller#onMadeActive()
     */
    @Override
    public void onMadeActive() {
        listView.getSelectionModel().selectFirst();
    }

    /**
     * @see Controller#onMadeInactive() ()
     */
    @Override
    public void onMadeInactive() {
    }

    /**
     * Update the content pane using the selected item in the list.
     */
    private void updateContent() {
        HBox selected_item = listView.getSelectionModel().getSelectedItem();
        Text selected_text = (Text) selected_item.getChildren().get(0);
        for (Node node : configContentContainer.getChildren()) {
            boolean matches_clicked = node.getUserData().toString().equals(selected_text.getText());
            node.setVisible(matches_clicked);
            node.setManaged(matches_clicked);
        }
    }

    /**
     * Hide the window (without saving anything).
     */
    @FXML
    private void hideWindow() {
        onMadeInactive();
        stage.hide();
    }

    /**
     * Prompt the user to restore the default config.
     */
    @FXML
    private void promptRestoreDefaults() {
        Alert alert = new Alert(Alert.AlertType.WARNING, "", ButtonType.YES,
                ButtonType.CANCEL);

        Label label = new Label("Are you sure you want to restore the default " +
                "configuration?\nThis will erase your current settings.");
        label.setWrapText(true);

        VBox alert_container = new VBox();
        alert_container.getChildren().add(label);

        alert.getDialogPane().setContent(alert_container);
        alert.setTitle(stage.getTitle());
        alert.showAndWait();

        if (alert.getResult() == ButtonType.YES) {
            config.restoreDefaults();
        }
    }
}