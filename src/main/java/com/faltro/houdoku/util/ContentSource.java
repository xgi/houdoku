package com.faltro.houdoku.util;

import com.faltro.houdoku.exception.ContentUnavailableException;
import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Series;
import javafx.scene.image.Image;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.jsoup.nodes.Document;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;

public interface ContentSource {
    int ID = -1;

    Response get(String url) throws IOException;

    Response post(String url, RequestBody body) throws IOException;

    Document parse(Response response) throws IOException;

    Image imageFromURL(String url) throws IOException;

    ArrayList<HashMap<String, Object>> search(String query) throws IOException;

    ArrayList<Chapter> chapters(Series series) throws IOException;

    ArrayList<Chapter> chapters(Series series, Document seriesDocument);

    Series series(String source) throws IOException;

    Image cover(String source) throws IOException;

    Image image(Chapter chapter, int page) throws IOException, ContentUnavailableException;

    String toString();
}
