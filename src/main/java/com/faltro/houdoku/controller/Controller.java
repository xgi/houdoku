package com.faltro.houdoku.controller;

import com.faltro.houdoku.util.SceneManager;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.CheckMenuItem;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

/**
 * This class contains method declarations and/or implementations for operations that are generic
 * between most of the client's controllers.
 */
abstract public class Controller {
    /**
     * The unique identifier for the Controller.
     */
    public static int ID = -1;
    /**
     * The client's unique SceneManager.
     */
    final SceneManager sceneManager;
    /**
     * Toggle for whether night mode is active (optional).
     */
    @FXML
    public CheckMenuItem nightModeItem;
    /**
     * The stage which the controller's view resides on.
     */
    Stage stage;
    /**
     * The parent container of the view.
     */
    @FXML
    private VBox container;

    Controller(SceneManager sceneManager) {
        this.sceneManager = sceneManager;
        this.stage = sceneManager.getStage();
    }

    /**
     * Function that will be called by the scene manager when this controller is made active.
     */
    abstract public void onMadeActive();

    /**
     * Function that will be called by the scene manager when this controller is made inactive.
     */
    abstract public void onMadeInactive();

    /**
     * Initialize the components of the controller's view.
     */
    @FXML
    void initialize() {
        container.prefWidthProperty().bind(stage.widthProperty());
        container.prefHeightProperty().bind(stage.heightProperty());
    }

    /**
     * Reload/"restart" the page. Primarily expected to be run after changes have been made to
     * the @{@link com.faltro.houdoku.model.Config}.
     */
    void reload() {
        onMadeInactive();
        onMadeActive();
    }

    /**
     * Exit the application.
     */
    @FXML
    private void exit() {
        Platform.exit();
    }

    /**
     * Toggle whether night mode is enabled.
     */
    public void toggleNightMode() {
        sceneManager.toggleTheme();
    }

    /**
     * Show the config stage/window.
     */
    public void showConfigStage() {
        sceneManager.showConfigStage();
    }

    /**
     * Set the stage that the controller's view resides on.
     *
     * @param stage the new stage
     */
    public void setStage(Stage stage) {
        this.stage = stage;
    }
}
