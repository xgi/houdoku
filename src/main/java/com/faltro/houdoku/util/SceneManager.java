package com.faltro.houdoku.util;

import com.faltro.houdoku.controller.ConfigController;
import com.faltro.houdoku.controller.Controller;
import com.faltro.houdoku.data.Data;
import com.faltro.houdoku.model.Config;
import javafx.collections.ObservableList;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Screen;
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
    /**
     * The default width of the window as a fraction of the screen width.
     */
    private static final double DEFAULT_WIDTH = 0.50;
    /**
     * The default height of the window as a fraction of the screen height.
     */
    private static final double DEFAULT_HEIGHT = 0.70;
    /**
     * The minimum default width of the window.
     */
    private static final double MIN_DEFAULT_WIDTH = 1024;
    /**
     * The minimum default height of the window.
     */
    private static final double MIN_DEFAULT_HEIGHT = 768;
    /**
     * The multiplier of the default width for the config window.
     */
    private static final double DEFAULT_CONFIG_WIDTH_MULTIPLIER = 0.70;
    /**
     * The multiplier of the default height for the config window.
     */
    private static final double DEFAULT_CONFIG_HEIGHT_MULTIPLIER = 0.85;

    private Stage stage;
    private Stage stage_config;
    private HashMap<Integer, Parent> roots;
    private HashMap<Parent, Controller> controllers;
    private PluginManager pluginManager;
    private ContentLoader contentLoader;
    private Config config;

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

        Config loaded_config = Data.loadConfig();
        this.config = loaded_config == null ? new Config() : loaded_config;
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
     * Prepare the initialized roots with preliminary operations.
     * <p>
     * This method should be executed only once: after all roots have been
     * initialized, and before changeToRoot/changeStageRoot has been called for
     * the first time.
     */
    public void prepare() {
        sizeStage(stage);

        if ((boolean) config.getField("night_mode_enabled")) {
            System.out.println("toggling");
            toggleTheme();
        }
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
        stage_config.setTitle(stage.getTitle());
        getController(root).setStage(stage_config);
        stage_config.show();
        sizeStage(stage_config, DEFAULT_CONFIG_WIDTH_MULTIPLIER, DEFAULT_CONFIG_HEIGHT_MULTIPLIER);
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
     */
    public void toggleTheme() {
        boolean pre_night_mode_enabled = false;

        for (Parent root : roots.values()) {
            ObservableList<String> stylesheets = root.getStylesheets();
            pre_night_mode_enabled = stylesheets.contains(STYLESHEET_NIGHT);

            // toggle the color stylesheet for the root
            if (pre_night_mode_enabled) {
                stylesheets.remove(STYLESHEET_NIGHT);
                stylesheets.add(STYLESHEET_LIGHT);
            } else {
                stylesheets.remove(STYLESHEET_LIGHT);
                stylesheets.add(STYLESHEET_NIGHT);
            }

            // toggle the CheckMenuItem
            Controller controller = controllers.get(root);
            if (controller.nightModeItem != null) {
                controller.nightModeItem.setSelected(!pre_night_mode_enabled);
            }
        }

        // update field in config and save it
        config.updateField("night_mode_enabled", !pre_night_mode_enabled);
        saveConfig();
    }

    /**
     * Set the size of a stage to the exact default variables.
     *
     * @param stg the stage to size
     * @see #DEFAULT_WIDTH
     * @see #DEFAULT_HEIGHT
     * @see #MIN_DEFAULT_WIDTH
     * @see #MIN_DEFAULT_HEIGHT
     */
    public void sizeStage(Stage stg) {
        sizeStage(stg, 1, 1);
    }

    /**
     * Set the size of a stage to the default variables times a multiplier.
     *
     * @param stg               the stage to size
     * @param width_multiplier  the width multiplier of the default values
     * @param height_multiplier the height multiplier of the default values
     * @see #DEFAULT_WIDTH
     * @see #DEFAULT_HEIGHT
     * @see #MIN_DEFAULT_WIDTH
     * @see #MIN_DEFAULT_HEIGHT
     */
    private void sizeStage(Stage stg, double width_multiplier, double height_multiplier) {
        double screen_width = Screen.getPrimary().getBounds().getWidth();
        double screen_height = Screen.getPrimary().getBounds().getHeight();
        double desired_width = screen_width * DEFAULT_WIDTH >= MIN_DEFAULT_WIDTH ?
                (int) (screen_width * DEFAULT_WIDTH) : MIN_DEFAULT_WIDTH;
        double desired_height = screen_height * DEFAULT_HEIGHT >= MIN_DEFAULT_HEIGHT ?
                (int) (screen_height * DEFAULT_HEIGHT) : MIN_DEFAULT_HEIGHT;
        stg.setWidth(desired_width * width_multiplier);
        stg.setHeight(desired_height * height_multiplier);
    }

    /**
     * Save the Config to the filesystem.
     */
    public void saveConfig() {
        Data.saveConfig(config);
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

    public Config getConfig() {
        return config;
    }
}
