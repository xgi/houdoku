package com.faltro.houdoku.controller;

import com.faltro.houdoku.util.SceneManager;
import javafx.fxml.FXML;
import javafx.scene.layout.VBox;

/**
 * The controller for the config page.
 * <p>
 * The FXML file for this view is at resources/fxml/config.fxml
 *
 * @see Controller
 */
public class ConfigController extends Controller {
    public static final int ID = 4;
    @FXML
    private VBox container;

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
}