package com.faltro.houdoku;

import com.faltro.houdoku.controller.LibraryController;
import com.faltro.houdoku.controller.ReaderController;
import com.faltro.houdoku.controller.SearchSeriesController;
import com.faltro.houdoku.controller.SeriesController;
import com.faltro.houdoku.util.SceneManager;
import javafx.application.Application;
import javafx.stage.Screen;
import javafx.stage.Stage;

public class Main extends Application {
    private static final double DEFAULT_WIDTH = 0.50;
    private static final double DEFAULT_HEIGHT = 0.70;
    private static final double MIN_DEFAULT_WIDTH = 1024;
    private static final double MIN_DEFAULT_HEIGHT = 768;


    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage primary_stage) throws Exception {
        SceneManager scene_manager = new SceneManager(primary_stage);

        LibraryController library_controller = new LibraryController(scene_manager);
        SeriesController series_controller = new SeriesController(scene_manager);
        ReaderController reader_controller = new ReaderController(scene_manager);
        SearchSeriesController add_series_controller = new SearchSeriesController(scene_manager);

        scene_manager.initRoot(LibraryController.ID, library_controller,
                getClass().getResource("/fxml/library.fxml"));
        scene_manager.initRoot(SeriesController.ID, series_controller,
                getClass().getResource("/fxml/series.fxml"));
        scene_manager.initRoot(ReaderController.ID, reader_controller,
                getClass().getResource("/fxml/reader.fxml"));
        scene_manager.initRoot(SearchSeriesController.ID, add_series_controller,
                getClass().getResource("/fxml/searchseries.fxml"));

        double screen_width = Screen.getPrimary().getBounds().getWidth();
        double screen_height = Screen.getPrimary().getBounds().getHeight();
        primary_stage.setWidth(screen_width * DEFAULT_WIDTH >= MIN_DEFAULT_WIDTH ?
                (int) (screen_width * DEFAULT_WIDTH) : MIN_DEFAULT_WIDTH);
        primary_stage.setHeight(screen_height * DEFAULT_HEIGHT >= MIN_DEFAULT_HEIGHT ?
                (int) (screen_height * DEFAULT_HEIGHT) : MIN_DEFAULT_HEIGHT);

        scene_manager.changeToRoot(LibraryController.ID);

        primary_stage.setTitle("Houdoku");
        primary_stage.show();
    }
}
