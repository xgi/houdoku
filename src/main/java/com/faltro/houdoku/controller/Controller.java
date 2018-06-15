package com.faltro.houdoku.controller;

import com.faltro.houdoku.util.SceneManager;
import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

abstract public class Controller {
    static int ID = -1;
    SceneManager sceneManager;
    Stage stage;

    @FXML
    private VBox container;

    Controller(SceneManager sceneManager) {
        this.sceneManager = sceneManager;
        this.stage = sceneManager.getStage();
    }

    /**
     * Function that will be called by the scene manager when the scene is
     * made active.
     */
    public abstract void onMadeActive();

    @FXML
    public void initialize() {
        container.prefWidthProperty().bind(
                stage.widthProperty()
        );
        container.prefHeightProperty().bind(
                stage.heightProperty()
        );
    }


    @FXML
    private void exit() {
        Platform.exit();
    }

    public void setStage(Stage stage) {
        this.stage = stage;
    }

    public VBox getContainer() {
        return container;
    }
}
