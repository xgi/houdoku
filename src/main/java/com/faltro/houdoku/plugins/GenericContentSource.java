package com.faltro.houdoku.plugins;

import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.util.ContentSource;
import javafx.scene.image.Image;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.HashMap;

public class GenericContentSource implements ContentSource {
    public static final int ID = -1;
    public static final String NAME = "GenericContentSource";
    public static final String DOMAIN = "example.com";

    @Override
    public Document getURL(String url) throws IOException {
        return Jsoup.connect(url).get();
    }

    @Override
    public Image imageFromURL(String url) throws IOException {
        URLConnection connection = new URL(url).openConnection();
        connection.setRequestProperty("User-Agent", "Houdoku");
        try (InputStream inputStream = connection.getInputStream()) {
            return new Image(inputStream);
        }
    }

    @Override
    public ArrayList<HashMap<String, Object>> search(String query) throws IOException {
        return null;
    }

    @Override
    public ArrayList<Chapter> chapters(Series series) throws IOException {
        return null;
    }

    @Override
    public ArrayList<Chapter> chapters(Series series, Document seriesDocument) {
        return null;
    }

    @Override
    public Series series(String source) throws IOException {
        return null;
    }

    @Override
    public Chapter chapter(Series series, String source) throws IOException {
        return null;
    }

    @Override
    public Chapter chapter(Series series, Document seriesDocument, String source) {
        return null;
    }

    @Override
    public Image image(Chapter chapter, int page) throws IOException {
        return null;
    }

    @Override
    public String toString() {
        String result = NAME + " <" + DOMAIN + ">";
        try {
            String name = this.getClass().getField("NAME").get(null).toString();
            String domain = this.getClass().getField("DOMAIN").get(null).toString();
            result = name + " <" + domain + ">";
        } catch (NoSuchFieldException | IllegalAccessException e) {
            e.printStackTrace();
        }
        return result;
    }
}
