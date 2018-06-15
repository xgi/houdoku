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
    public void start(Stage primaryStage) throws Exception {
        SceneManager sceneManager = new SceneManager(primaryStage);

        LibraryController libraryController = new LibraryController(sceneManager);
        SeriesController seriesController = new SeriesController(sceneManager);
        ReaderController readerController = new ReaderController(sceneManager);
        SearchSeriesController addSeriesController = new SearchSeriesController(sceneManager);

        sceneManager.initScene(LibraryController.ID, libraryController, getClass().getResource("/fxml/library.fxml"));
        sceneManager.initScene(SeriesController.ID, seriesController, getClass().getResource("/fxml/series.fxml"));
        sceneManager.initScene(ReaderController.ID, readerController, getClass().getResource("/fxml/reader.fxml"));
        sceneManager.initScene(SearchSeriesController.ID, addSeriesController, getClass().getResource("/fxml/search_series.fxml"));

        double screen_width = Screen.getPrimary().getBounds().getWidth();
        double screen_height = Screen.getPrimary().getBounds().getHeight();
        primaryStage.setWidth(screen_width * DEFAULT_WIDTH >= MIN_DEFAULT_WIDTH ?
                (int) (screen_width * DEFAULT_WIDTH) : MIN_DEFAULT_WIDTH);
        primaryStage.setHeight(screen_height * DEFAULT_HEIGHT >= MIN_DEFAULT_HEIGHT ?
                (int) (screen_height * DEFAULT_HEIGHT) : MIN_DEFAULT_HEIGHT);

        sceneManager.changeToScene(LibraryController.ID);

        primaryStage.setTitle("Houdoku");
        primaryStage.show();
    }
}
