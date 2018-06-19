package com.faltro.houdoku.plugins;

import com.faltro.houdoku.exception.ContentUnavailableException;
import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.util.ContentSource;
import javafx.scene.image.Image;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;

public class GenericContentSource implements ContentSource {
    public static final int ID = -1;
    public static final String NAME = "GenericContentSource";
    public static final String DOMAIN = "example.com";

    @Override
    public Response get(String url) throws IOException {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url(url)
                .build();
        return client.newCall(request).execute();
    }

    @Override
    public Response post(String url, RequestBody body) throws IOException {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .build();
        return client.newCall(request).execute();
    }

    @Override
    public Document parse(Response response) throws IOException {
        return Jsoup.parse(response.body().string());
    }

    @Override
    public Image imageFromURL(String url) throws IOException {
        Response response = get(url);
        return new Image(response.body().byteStream());
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
    public Image cover(String source) throws IOException {
        return null;
    }

    @Override
    public Image image(Chapter chapter, int page) throws IOException, ContentUnavailableException {
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
