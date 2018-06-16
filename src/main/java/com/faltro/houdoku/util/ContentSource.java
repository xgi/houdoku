package com.faltro.houdoku.util;

import com.faltro.houdoku.exception.ContentUnavailableException;
import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Series;
import javafx.scene.image.Image;
import org.jsoup.nodes.Document;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;

public interface ContentSource {
    int ID = -1;

    Document getURL(String url) throws IOException;

    Image imageFromURL(String url) throws IOException;

    ArrayList<HashMap<String, Object>> search(String query) throws IOException;

    ArrayList<Chapter> chapters(Series series) throws IOException;

    ArrayList<Chapter> chapters(Series series, Document seriesDocument);

    Series series(String source) throws IOException;

    Chapter chapter(Series series, String source) throws IOException;

    Chapter chapter(Series series, Document seriesDocument, String source);

    Image image(Chapter chapter, int page) throws IOException, ContentUnavailableException;

    String toString();
}
