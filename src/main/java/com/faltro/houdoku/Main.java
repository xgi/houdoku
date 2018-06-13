package com.faltro.houdoku;

import com.faltro.houdoku.controller.LibraryController;
import com.faltro.houdoku.controller.ReaderController;
import com.faltro.houdoku.controller.SearchSeriesController;
import com.faltro.houdoku.controller.SeriesController;
import com.faltro.houdoku.util.SceneManager;
import javafx.application.Application;
import javafx.stage.Stage;

public class Main extends Application {

    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void start(Stage primaryStage) throws Exception {
        //ContentSource mangadex = new MangaDex();
        //Series series = mangadex.series("/manga/2334");
        //Chapter chapter = mangadex.chapter(series, "/chapter/20900");
        //mangadex.image("/chapter/321880", 3);
        //mangadex.image("/chapter/290267", 2);
        //mangadex.chapters(series);
        //mangadex.chapter(series, "/chapter/99997");


        SceneManager sceneManager = new SceneManager(primaryStage);

        LibraryController libraryController = new LibraryController(sceneManager);
        SeriesController seriesController = new SeriesController(sceneManager);
        ReaderController readerController = new ReaderController(sceneManager);
        SearchSeriesController addSeriesController = new SearchSeriesController(sceneManager);

        sceneManager.initScene(LibraryController.ID, libraryController, getClass().getResource("/fxml/library.fxml"));
        sceneManager.initScene(SeriesController.ID, seriesController, getClass().getResource("/fxml/series.fxml"));
        sceneManager.initScene(ReaderController.ID, readerController, getClass().getResource("/fxml/reader.fxml"));
        sceneManager.initScene(SearchSeriesController.ID, addSeriesController, getClass().getResource("/fxml/search_series.fxml"));

        sceneManager.changeToScene(LibraryController.ID);
        sceneManager.getStage().getScene().getWindow().sizeToScene();


        primaryStage.setTitle("Houdoku");
        primaryStage.show();
    }
}
