package com.faltro.houdoku.util;

import com.faltro.houdoku.controller.Controller;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.IOException;
import java.net.URL;
import java.util.HashMap;

public class SceneManager {
    // changes to this MUST also be changed in default.css
    public static final int VSCROLLBAR_WIDTH = 20;

    private Stage stage;
    private Stage popup_stage;
    private HashMap<Integer, Parent> roots;
    private HashMap<Parent, Controller> controllers;
    private PluginManager pluginManager;

    public SceneManager(Stage stage) {
        this.stage = stage;
        this.popup_stage = new Stage();
        this.roots = new HashMap<>();
        this.controllers = new HashMap<>();
        this.pluginManager = new PluginManager();
    }

    public void initScene(int id, Controller controller, URL source) throws IOException {
        FXMLLoader loader = new FXMLLoader();
        loader.setLocation(source);
        loader.setController(controller);
        Parent root = loader.load();
        roots.put(id, root);
        controllers.put(root, controller);
    }

    public void changeToRoot(int id) {
        changeStageRoot(stage, roots.get(id));
    }

    public void changeToPopupStage(int id) {
        Parent root = roots.get(id);
        changeStageRoot(popup_stage, root);
        popup_stage.getScene().getWindow().sizeToScene();
        popup_stage.setTitle(stage.getTitle());
        getController(root).setStage(popup_stage);
        popup_stage.show();
    }

    /**
     * Change the given stage's scene's root to the given root.
     *
     * @param stg  the stage to change the root of
     * @param root the new root
     */
    private void changeStageRoot(Stage stg, Parent root) {
        if (stg.getScene() != null) {
            Scene scene = stg.getScene();
            controllers.get(scene.getRoot()).onMadeInactive();
            scene.setRoot(root);
            controllers.get(root).onMadeActive();
        } else {
            Scene scene = new Scene(root);
            stg.setScene(scene);
            scene.getWindow().sizeToScene();
            controllers.get(root).onMadeActive();
        }
    }

    public Parent getRoot(int id) {
        return roots.get(id);
    }

    public Controller getController(Parent root) {
        return controllers.get(root);
    }

    public Controller getController(int id) {
        Parent root = getRoot(id);
        return controllers.get(root);
    }

    public Stage getStage() {
        return stage;
    }

    public PluginManager getPluginManager() {
        return pluginManager;
    }
}
