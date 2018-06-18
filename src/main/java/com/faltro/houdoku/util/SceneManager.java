package com.faltro.houdoku.util;

import com.faltro.houdoku.controller.Controller;
import com.faltro.houdoku.util.loader.ContentLoader;
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
    private HashMap<Integer, Parent> roots;
    private HashMap<Parent, Controller> controllers;
    private PluginManager pluginManager;
    private ContentLoader contentLoader;

    public SceneManager(Stage stage) {
        this.stage = stage;
        this.roots = new HashMap<>();
        this.controllers = new HashMap<>();
        this.pluginManager = new PluginManager();
        this.contentLoader = new ContentLoader();
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
        if (stage.getScene() != null) {
            Scene scene = stage.getScene();
            controllers.get(scene.getRoot()).onMadeInactive();
            Parent newRoot = roots.get(id);
            scene.setRoot(newRoot);
            controllers.get(newRoot).onMadeActive();
        } else {
            Parent root = roots.get(id);
            Scene scene = new Scene(root);
            stage.setScene(scene);
            scene.getWindow().sizeToScene();
            controllers.get(root).onMadeActive();
        }
    }

    public void createSceneNewWindow(int id) {
        Stage temp_stage = new Stage();
        temp_stage.setTitle(stage.getTitle());
        Parent root = roots.get(id);
        Scene scene = new Scene(root);
        temp_stage.setScene(scene);
        temp_stage.sizeToScene();
        temp_stage.show();
        Controller controller = controllers.get(root);
        controller.setStage(temp_stage);
        controller.onMadeActive();
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

    public ContentLoader getContentLoader() {
        return contentLoader;
    }
}
