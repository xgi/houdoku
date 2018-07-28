package com.faltro.houdoku.net;

import com.faltro.houdoku.Houdoku;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
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
     * Parse the given okhttp3.Response as a Jsoup.Document.
     *
     * @param response the Response to parse
     * @return a Document from the text of the given response
     * @throws IOException an IOException occurred when handling the Response
     */
    public static Document parse(Response response) throws IOException {
        return response.body() == null ? null : Jsoup.parse(response.body().string());
    }
}
