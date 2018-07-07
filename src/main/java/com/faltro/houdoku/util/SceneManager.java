package com.faltro.houdoku.util;

import com.faltro.houdoku.controller.Controller;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

import java.io.IOException;
import java.net.URL;
import java.util.HashMap;

/**
 * Manager and container for scene-related class instances. The instance of this
 * class is the primary resource for controllers to interact with each other and
 * access instances of non-controller-specific classes.
 *
 * @see PluginManager
 * @see ContentLoader
 */
public class SceneManager {
    // changes to this MUST also be changed in main.css
    public static final int VSCROLLBAR_WIDTH = 20;

    private Stage stage;
    private Stage popup_stage;
    private HashMap<Integer, Parent> roots;
    private HashMap<Parent, Controller> controllers;
    private PluginManager pluginManager;
    private ContentLoader contentLoader;

    /**
     * Create the SceneManager.
     * <p>
     * This constructor creates instances of the non-controller-specific classes
     * used by ths class.
     *
     * @param stage the stage of the main application window
     */
    public SceneManager(Stage stage) {
        this.stage = stage;
        this.popup_stage = new Stage();
        this.roots = new HashMap<>();
        this.controllers = new HashMap<>();
        this.pluginManager = new PluginManager();
        this.contentLoader = new ContentLoader();
    }

    /**
     * Initialize the root (a Parent node) for a scene.
     * <p>
     * The root is usually an individual page, i.e. the library page or the
     * reader page. Technically, it can be anything with an FXML source and a
     * controller.
     *
     * @param id         the unique id to give this root; probably the controller's
     *                   unique id
     * @param controller the controller for the root
     * @param source     the FXML file for the root
     * @throws IOException an IOException occurred when loading the FXML file
     */
    public void initRoot(int id, Controller controller, URL source) throws IOException {
        FXMLLoader loader = new FXMLLoader();
        loader.setLocation(source);
        loader.setController(controller);
        Parent root = loader.load();
        roots.put(id, root);
        controllers.put(root, controller);
    }

    /**
     * Change to the root with the given id.
     * <p>
     * The root should have already been initialized with
     * {@link #initRoot(int, Controller, URL)}.
     *
     * @param id the id of the root to change to
     */
    public void changeToRoot(int id) {
        changeStageRoot(stage, roots.get(id));
    }

    /**
     * Show the popup stage, which is on a separate window, with the root with
     * the given id.
     *
     * @param id the id of the root to show
     */
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

    public ContentLoader getContentLoader() {
        return contentLoader;
    }
}
