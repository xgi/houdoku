package com.faltro.houdoku.util;

import com.faltro.houdoku.controller.ConfigController;
import com.faltro.houdoku.controller.Controller;
import javafx.collections.ObservableList;
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
    /**
     * The width of all vertical scrollbars. Changes to this must also be
     * changed in /style/main.css
     */
    public static final int VSCROLLBAR_WIDTH = 20;
    /**
     * The stylesheet of colors for the "light" theme.
     */
    private static final String STYLESHEET_LIGHT = "/style/light.css";
    /**
     * The stylesheet of colors for the "night" theme.
     */
    private static final String STYLESHEET_NIGHT = "/style/night.css";
    private Stage stage;
    private Stage stage_config;
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
        this.stage_config = new Stage();
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
     * Show the config stage, which is on a separate window.
     */
    public void showConfigStage() {
        Parent root = roots.get(ConfigController.ID);
        changeStageRoot(stage_config, root);
        stage_config.getScene().getWindow().sizeToScene();
        stage_config.setTitle(stage.getTitle());
        getController(root).setStage(stage_config);
        stage_config.show();
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

    /**
     * Toggles the color stylesheet for ALL roots between light and night mode.
     *
     * @return whether the night theme is enabled
     */
    public boolean toggleTheme() {
        boolean result = false;

        for (Parent root : roots.values()) {
            ObservableList<String> stylesheets = root.getStylesheets();
            if (stylesheets.contains(STYLESHEET_LIGHT)) {
                stylesheets.remove(STYLESHEET_LIGHT);
                stylesheets.add(STYLESHEET_NIGHT);
            } else if (stylesheets.contains(STYLESHEET_NIGHT)) {
                stylesheets.remove(STYLESHEET_NIGHT);
                stylesheets.add(STYLESHEET_LIGHT);
            }
            result = stylesheets.contains(STYLESHEET_NIGHT);
        }
        return result;
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

    public HashMap<Parent, Controller> getControllers() {
        return controllers;
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
