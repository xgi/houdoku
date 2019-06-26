package com.faltro.houdoku;

import com.faltro.houdoku.controller.*;
import com.faltro.houdoku.util.SceneManager;
import javafx.application.Application;
import javafx.stage.Stage;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class Houdoku extends Application {
    public static Properties PROJECT_PROPERTIES;
    public static Properties SECRET_PROPERTIES;

    static {
        // load properties files
        try {
            InputStream project_stream =
                    Houdoku.class.getClassLoader().getResourceAsStream("project.properties");
            InputStream secret_stream =
                    Houdoku.class.getClassLoader().getResourceAsStream("secret.properties");

            PROJECT_PROPERTIES = new Properties();
            PROJECT_PROPERTIES.load(project_stream);

            // secret.properties file is not required
            if (secret_stream != null) {
                SECRET_PROPERTIES = new Properties();
                SECRET_PROPERTIES.load(secret_stream);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private SceneManager sceneManager;

    public static void main(String[] args) {
        launch(args);
    }

    public static String getName() {
        return PROJECT_PROPERTIES.getProperty("name");
    }

    public static String getVersion() {
        return PROJECT_PROPERTIES.getProperty("version");
    }

    public static String getAniListId() {
        return SECRET_PROPERTIES == null ? null : SECRET_PROPERTIES.getProperty("aniListId");
    }

    public static String getAniListSecret() {
        return SECRET_PROPERTIES == null ? null : SECRET_PROPERTIES.getProperty("aniListSecret");
    }

    @Override
    public void start(Stage primary_stage) throws Exception {

        sceneManager = new SceneManager(primary_stage);

        LibraryController library_controller = new LibraryController(sceneManager);
        SeriesController series_controller = new SeriesController(sceneManager);
        ReaderController reader_controller = new ReaderController(sceneManager);
        SearchSeriesController search_series_controller = new SearchSeriesController(sceneManager);
        ConfigController config_controller = new ConfigController(sceneManager);

        sceneManager.initRoot(LibraryController.ID, library_controller,
                getClass().getResource("/fxml/library.fxml"));
        sceneManager.initRoot(SeriesController.ID, series_controller,
                getClass().getResource("/fxml/series.fxml"));
        sceneManager.initRoot(ReaderController.ID, reader_controller,
                getClass().getResource("/fxml/reader.fxml"));
        sceneManager.initRoot(SearchSeriesController.ID, search_series_controller,
                getClass().getResource("/fxml/searchseries.fxml"));
        sceneManager.initRoot(ConfigController.ID, config_controller,
                getClass().getResource("/fxml/config.fxml"));

        sceneManager.prepare();
        sceneManager.changeToRoot(LibraryController.ID);

        primary_stage.setTitle("Houdoku");
        primary_stage.show();
    }

    @Override
    public void stop() {
        sceneManager.getContentLoader().stopAllThreads();
    }
}
