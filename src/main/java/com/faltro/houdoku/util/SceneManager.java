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
    private HashMap<Integer, Scene> scenes;
    private HashMap<Scene, Controller> controllers;
    private PluginManager pluginManager;
    private ContentLoader contentLoader;

    public SceneManager(Stage stage) {
        this.stage = stage;
        this.scenes = new HashMap<>();
        this.controllers = new HashMap<>();
        this.pluginManager = new PluginManager();
        this.contentLoader = new ContentLoader();
    }

    public void initScene(int id, Controller controller, URL source) throws IOException {
        FXMLLoader loader = new FXMLLoader();
        loader.setLocation(source);
        loader.setController(controller);
        Parent root = loader.load();
        //Scene scene = new Scene(root, stage.getWidth(), stage.getHeight());
        Scene scene = new Scene(root);
        scenes.put(id, scene);
        controllers.put(scene, controller);
    }

    public void changeToScene(int id) {
        double previous_height = stage.getHeight();
        Scene scene = scenes.get(id);
        stage.setScene(scene);
        stage.setHeight(previous_height);
        controllers.get(scene).onMadeActive();
    }

    public void createSceneNewWindow(int id) {
        Stage temp_stage = new Stage();
        temp_stage.setTitle(stage.getTitle());
        Scene scene = scenes.get(id);
        temp_stage.setScene(scene);
        temp_stage.sizeToScene();
        temp_stage.show();
        controllers.get(scene).setStage(temp_stage);
        controllers.get(scene).onMadeActive();
    }

    public Controller getController(int id) {
        return controllers.get(scenes.get(id));
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
