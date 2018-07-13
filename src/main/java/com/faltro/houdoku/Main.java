package com.faltro.houdoku;

import com.faltro.houdoku.controller.*;
import com.faltro.houdoku.util.SceneManager;
import javafx.application.Application;
import javafx.stage.Stage;

public class Main extends Application {
    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage primary_stage) throws Exception {
        SceneManager scene_manager = new SceneManager(primary_stage);

        LibraryController library_controller = new LibraryController(scene_manager);
        SeriesController series_controller = new SeriesController(scene_manager);
        ReaderController reader_controller = new ReaderController(scene_manager);
        SearchSeriesController search_series_controller = new SearchSeriesController(scene_manager);
        ConfigController config_controller = new ConfigController(scene_manager);

        scene_manager.initRoot(LibraryController.ID, library_controller,
                getClass().getResource("/fxml/library.fxml"));
        scene_manager.initRoot(SeriesController.ID, series_controller,
                getClass().getResource("/fxml/series.fxml"));
        scene_manager.initRoot(ReaderController.ID, reader_controller,
                getClass().getResource("/fxml/reader.fxml"));
        scene_manager.initRoot(SearchSeriesController.ID, search_series_controller,
                getClass().getResource("/fxml/searchseries.fxml"));
        scene_manager.initRoot(ConfigController.ID, config_controller,
                getClass().getResource("/fxml/config.fxml"));

        scene_manager.prepare();
        scene_manager.changeToRoot(LibraryController.ID);

        primary_stage.setTitle("Houdoku");
        primary_stage.show();
    }
}
