package com.faltro.houdoku;

import com.faltro.houdoku.controller.*;
import com.faltro.houdoku.util.SceneManager;
import javafx.application.Application;
import javafx.stage.Stage;

import java.io.IOException;
import java.util.Properties;

public class Houdoku extends Application {
    private static final Properties properties = new Properties();
    private SceneManager sceneManager;

    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage primary_stage) throws Exception {
        // load project properties
        try {
            properties.load(getClass().getClassLoader().getResourceAsStream("project.properties"));
        } catch (IOException e) {
            e.printStackTrace();
        }

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

    public static String getName() {
        return properties.getProperty("name");
    }

    public static String getVersion() {
        return properties.getProperty("version");
    }
}
