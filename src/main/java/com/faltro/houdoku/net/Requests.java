package com.faltro.houdoku.net;

import com.faltro.houdoku.Houdoku;
import javafx.scene.image.Image;
import okhttp3.*;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import java.io.IOException;

public class Requests {
    /**
     * The generic User-Agent to use when making HTTP requests.
     */
    private static final String USER_AGENT = String.format("%s %s",
            Houdoku.getName(), Houdoku.getVersion());

    /**
     * Executes an HTTP GET request on the given URL.
     *
     * @param url the URL to request
     * @return the Response of the request
     * @throws IOException an IOException occurred when making the request
     */
    public static Response GET(String url) throws IOException {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url(url)
                .addHeader("User-Agent", USER_AGENT)
                .build();
        return client.newCall(request).execute();
    }

    /**
     * Executes an HTTP POST request on the given URL.
     *
     * @param url  the URL to request
     * @param body the body content of the POST request
     * @return the Response of the request
     * @throws IOException an IOException occurred when making the request
     */
    public static Response POST(String url, RequestBody body) throws IOException {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .addHeader("User-Agent", USER_AGENT)
                .build();
        return client.newCall(request).execute();
    }

    /**
     * Executes an HTTP POST request on the given URL with authorization.
     *
     * @param url           the URL to request
     * @param body          the body content of the POST request
     * @param authorization the content of the Authorization HTTP header.
     * @return the Response of the request
     * @throws IOException an IOException occurred when making the request
     */
    public static Response POST(String url, RequestBody body, String authorization) throws
            IOException {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url(url)
                .post(body)
                .addHeader("User-Agent", USER_AGENT)
                .addHeader("Authorization", authorization)
                .build();
        return client.newCall(request).execute();
    }

    /**
     * Executes an HTTP POST request on the given URL with a JSON body.
     *
     * @param url  the URL to request
     * @param json the json-formatted body of the request
     * @return the Response of the request
     * @throws IOException an IOException occurred when making the request
     */
    public static Response POST(String url, String json) throws IOException {
        RequestBody body = RequestBody.create(
                MediaType.parse("application/json; charset=utf-8"),
                json);
        return POST(url, body);
    }

    /**
     * Executes an HTTP POST request on the given URL with a JSON body with
     * authorization.
     *
     * @param url           the URL to request
     * @param json          the json-formatted body of the request
     * @param authorization the content of the Authorization HTTP header.
     * @return the Response of the request
     * @throws IOException an IOException occurred when making the request
     */
    public static Response POST(String url, String json, String authorization) throws IOException {
        RequestBody body = RequestBody.create(
                MediaType.parse("application/json; charset=utf-8"),
                json);
        return POST(url, body, authorization);
    }

    /**
     * Parse the given okhttp3.Response as a Jsoup.Document.
     *
     * @param response the Response to parse
     * @return a Document from the text of the given response
     * @throws IOException an IOException occurred when handling the Response
     */
    public static Document parse(Response response) throws IOException {
        return response.body() == null ? null : Jsoup.parse(response.body().string());
    }

    /**
     * Retrieves an Image from the given URL.
     *
     * @param url the URL for an image file
     * @return an Image retrieved from the given url
     * @throws IOException an IOException occurred when loading the image
     */
    public static Image imageFromURL(String url) throws IOException {
        Response response = GET(url);
        return response.body() == null ? null : new Image(response.body().byteStream());
    }

    /**
     * Retrieves an Image from the given URL with a strict width.
     * <p>
     * The aspect ratio of the original image is maintained.
     *
     * @param url   the URL for an image file
     * @param width the width of the retrieved image
     * @return an Image retrieved from the given url
     * @throws IOException an IOException occurred when loading the image
     */
    public static Image imageFromURL(String url, int width) throws IOException {
        Response response = GET(url);
        return response.body() == null ? null :
                new Image(response.body().byteStream(), width, 0, true, false);
    }
}
