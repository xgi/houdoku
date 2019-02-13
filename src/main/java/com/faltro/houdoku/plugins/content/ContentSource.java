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
 * A content source is a website which contains series information and provides
 * a list of chapters for series', from which pages can be downloaded as images.
 * <p>
 * The client maintains numerous ContentSource's, and the user can choose to use
 * a different ContentSource for each series in their library.
 *
 * @see com.faltro.houdoku.plugins.content
 */
public interface ContentSource {
    /**
     * The unique identifier for the ContentSource.
     */
    int ID = -1;
    /**
     * The user-friendly name of the ContentSource.
     */
    String NAME = "UnimplementedContentSource";
    /**
     * The domain of the ContentSource.
     */
    String DOMAIN = "example.com";
    /**
     * The protocol for the ContentSource, which is likely either http or https.
     */
    String PROTOCOL = "https";

    /**
     * Searches the source using a provided query.
     * <p>
     * This method does NOT load Series objects, since the amount of series
     * information provided by the search page is often limited. Instead, the
     * following data about each result is retrieved:
     * <ul>
     * <li>contentSourceId (int) - the ContentSource's ID field</li>
     * <li>source (String) - the URL to the series page</li>
     * <li>coverSrc (optional) (String) - a URL to an image of the series'
     * cover</li>
     * <li>title (String) - the title of the series</li>
     * <li>details (String) - a generally multiline string which contains the
     * information about the series that will appear in the client's table of
     * search results</li>
     * </ul>
     *
     * @param query the text to search for
     * @return an ArrayList of HashMap's where keys are the field names listed
     * above as Strings and values of the matching type
     * @throws IOException             an IOException occurred when searching
     * @throws NotImplementedException the operation has not yet been
     *                                 implemented for this content source
     */
    ArrayList<HashMap<String, Object>> search(String query) throws IOException,
            NotImplementedException;

    /**
     * Parse all of the chapters of the given series.
     * <p>
     * This method may choose to call
     * chapters(Series series, Document document) if the list of chapters
     * includes a pager that can only be navigated by loading multiple
     * documents.
     *
     * @param series the series that the chapters are from
     * @return an ArrayList of Chapter's using data from the provided document
     * @throws IOException             an IOException occurred when loading the
     *                                 series page
     * @throws NotImplementedException the operation has not yet been
     *                                 implemented for this content source
     * @throws ContentUnavailableException the retrieval of the chapters was
     *                                     blocked by the ContentSource's
     *                                     website itself
     */
    ArrayList<Chapter> chapters(Series series) throws IOException, NotImplementedException,
            ContentUnavailableException;

    /**
     * Parse all of the chapters on the given Document.
     * <p>
     * This method is NOT guaranteed to return all chapters of a given
     * series -- use chapters(Series series) for that.
     *
     * @param series   the series that the chapters are from
     * @param document the document to find chapters on
     * @return an ArrayList of Chapter's using data from the provided document
     * @throws NotImplementedException     the operation has not yet been
     *                                     implemented for this content source
     * @throws ContentUnavailableException the retrieval of the chapters was
     *                                     blocked by the ContentSource's
     *                                     website itself
     */
    ArrayList<Chapter> chapters(Series series, Document document) throws NotImplementedException,
            ContentUnavailableException;

    /**
     * Parses the given source as a Series.
     * <p>
     * The given source is generally a URL fragment relative to the domain, but
     * this is not explicitly required. The fragment also generally contains
     * a preceding forward slash, but including one is not explicitly required
     * and may depend the source URL's retrieved from search results.
     *
     * @param source the source of the series page
     * @param quick  whether the list of chapters should be "quickly" reloaded,
     *               which ensures that only one total HTTP request is made, but
     *               does not guarantee that all chapters are loaded
     * @return a Series using the data on the series page
     * @throws IOException                 an IOException occurred when loading
     *                                     the series page
     * @throws NotImplementedException     the operation has not yet been
     *                                     implemented for this content source
     * @throws ContentUnavailableException the retrieval of the series was
     *                                     blocked by the ContentSource's
     *                                     website itself
     */
    Series series(String source, boolean quick) throws IOException, NotImplementedException,
            ContentUnavailableException;

    /**
     * Retrieves a series' cover image from the given URL.
     * <p>
     * This method does not always need to be implemented. It is primarily
     * used when the ContentSource's search results page does not present series
     * covers.
     * <p>
     * This method generally goes to the given source, which is probably a
     * series page, and finds the cover image on that page.
     *
     * @param source the source of the page which contains the cover image
     * @return the cover Image for the series at the given source page
     * @throws IOException             an IOException occurred when loading the
     *                                 image
     * @throws NotImplementedException the operation has not yet been
     *                                 implemented for this content source
     */
    Image cover(String source) throws IOException, NotImplementedException;

    /**
     * Retrieves an Image of a chapter page.
     * <p>
     * This method generally uses the source property of the given Chapter
     * (via chapter.getSource()), which is almost certainly a "reader" page,
     * where specific pages can often be loaded by appending a page number to
     * the URL in some fashion.
     * <p>
     * This method almost certainly has to make two requests: one to load the
     * proper page of the reader, and another to load the direct image URL by
     * processing the reader page's contents.
     * <p>
     * When this method is called, chapter.images may not be initialized, since
     * sources almost never provide the number of pages in a chapter before
     * going to the reader itself (which is only loaded by this method). Thus,
     * this method should check whether chapter.images is initialized and, if it
     * is not, this method should determine the number of pages in the chapter
     * and initialize chapter.images with the appropriate size.
     *
     * @param chapter the chapter that contains the desired image
     * @param page    the page number to retrieve, starting at 1
     * @return the Image of the requested page of the given chapter
     * @throws IOException                 an IOException occurred when loading
     *                                     the image
     * @throws ContentUnavailableException the retrieval of the image was
     *                                     blocked by the ContentSource's
     *                                     website itself
     * @throws NotImplementedException     the operation has not yet been
     *                                     implemented for this content source
     */
    Image image(Chapter chapter, int page) throws IOException, ContentUnavailableException,
            NotImplementedException;

    /**
     * Retrieve the client for making HTTP requests, which may be built with
     * applicable interceptors.
     *
     * @return an OkHttpClient for making requests to this ContentSource
     */
    OkHttpClient getClient();

    /**
     * Represents this ContentSource as a string.
     *
     * @return the user-friendly representation of this ContentSource
     */
    String toString();
}
