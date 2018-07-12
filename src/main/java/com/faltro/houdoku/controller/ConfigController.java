package com.faltro.houdoku.controller;

import com.faltro.houdoku.util.SceneManager;
import javafx.beans.property.SimpleStringProperty;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.scene.Node;
import javafx.scene.control.*;
import javafx.scene.input.MouseButton;
import javafx.scene.input.MouseEvent;
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
    private TreeTableView<String> treeView;
    @FXML
    private TreeTableColumn<String, String> topicsColumn;
    @FXML
    private VBox configContentContainer;

    public ConfigController(SceneManager sceneManager) {
        super(sceneManager);
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

        // create cell/value factories for the tree
        topicsColumn.setCellFactory(tc -> {
            TreeTableCell<String, String> cell = new TreeTableCell<>();
            Text text = new Text();
            cell.setGraphic(text);
            text.textProperty().bind(cell.itemProperty());
            cell.setOnMouseClicked(newTopicClickHandler());
            return cell;
        });
        topicsColumn.setCellValueFactory(p ->
                new SimpleStringProperty(p.getValue().getValue())
        );

        // populate the treeView with topics
        TreeItem<String> topic_root = new TreeItem<>("root"); // dummy root
        for (Node node : configContentContainer.getChildren()) {
            TreeItem<String> topic_item = new TreeItem<>(node.getUserData().toString());
            topic_root.getChildren().add(topic_item);
        }

        treeView.setRoot(topic_root);
        treeView.setShowRoot(false);
        treeView.getSelectionModel().selectFirst();
    }

    /**
     * @see Controller#onMadeActive()
     */
    @Override
    public void onMadeActive() {
    }

    /**
     * @see Controller#onMadeInactive() ()
     */
    @Override
    public void onMadeInactive() {
    }

    /**
     * Creates a MouseEvent handler for a topic in the topics tree.
     *
     * @return a complete MouseEvent EventHandler for a topic in the tree
     */
    private EventHandler<MouseEvent> newTopicClickHandler() {
        return mouseEvent -> {
            if (mouseEvent.getButton().equals(MouseButton.PRIMARY)) {
                String topic_string = treeView.getSelectionModel().getSelectedItem().getValue();
                for (Node node : configContentContainer.getChildren()) {
                    boolean matches_clicked = node.getUserData().toString().equals(topic_string);
                    node.setVisible(matches_clicked);
                    node.setManaged(matches_clicked);
                }
            }
        };
    }
}