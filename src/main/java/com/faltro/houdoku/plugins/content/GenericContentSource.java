package com.faltro.houdoku.plugins.content;

import com.faltro.houdoku.exception.ContentUnavailableException;
import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.model.Chapter;
import com.faltro.houdoku.model.Series;
import javafx.scene.image.Image;
import okhttp3.OkHttpClient;
import org.jsoup.nodes.Document;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;

/**
 * This class contains implementations for some methods from ContentSource that are expected to be
 * common between most content source plugins.
 * <p>
 * For method and field documentation, please see the ContentSource class.
 *
 * @see ContentSource
 */
public class GenericContentSource implements ContentSource {
    public static final int ID = -1;
    public static final String NAME = "GenericContentSource";
    public static final String DOMAIN = "example.com";
    public static final String PROTOCOL = "https";
    final OkHttpClient client = new OkHttpClient();

    @Override
    public ArrayList<HashMap<String, Object>> search(String query)
            throws IOException, NotImplementedException {
        throw new NotImplementedException();
    }

    @Override
    public ArrayList<Chapter> chapters(Series series)
            throws IOException, NotImplementedException, ContentUnavailableException {
        throw new NotImplementedException();
    }

    @Override
    public ArrayList<Chapter> chapters(Series series, Document seriesDocument)
            throws NotImplementedException, ContentUnavailableException {
        throw new NotImplementedException();
    }

    @Override
    public Series series(String source, boolean quick)
            throws IOException, NotImplementedException, ContentUnavailableException {
        throw new NotImplementedException();
    }

    @Override
    public Image cover(String source) throws IOException, NotImplementedException {
        throw new NotImplementedException();
    }

    @Override
    public Image image(Chapter chapter, int page)
            throws IOException, ContentUnavailableException, NotImplementedException {
        throw new NotImplementedException();
    }

    @Override
    public OkHttpClient getClient() {
        return client;
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
