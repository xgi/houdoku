package com.faltro.houdoku.util;

import com.faltro.houdoku.data.Data;
import com.faltro.houdoku.model.Config;
import com.faltro.houdoku.net.Requests;
import com.faltro.houdoku.plugins.content.*;
import com.faltro.houdoku.plugins.info.AniList;
import com.faltro.houdoku.plugins.info.InfoSource;
import com.faltro.houdoku.plugins.tracker.Kitsu;
import com.faltro.houdoku.plugins.tracker.Tracker;
import com.google.gson.JsonArray;
import com.google.gson.JsonParser;
import okhttp3.OkHttpClient;
import okhttp3.Response;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;

/**
 * Manager and container for client plugins, which currently solely consists of content sources.
 * Generally, the instance of this class primarily exists to hold and provide access to instances of
 * the available plugins so that multiple plugin instances are not necessary.
 */
public class PluginManager {
    /**
     * ClassLoader for loading plugin classes from the filesystem.
     */
    private static ClassLoader CLASSLOADER;
    /**
     * Remote URL for the plugin index file.
     */
    private static final String PLUGINS_BASE_URL = "https://storage.googleapis.com/houdoku-plugins";
    private final ArrayList<ContentSource> contentSources;
    private final InfoSource infoSource;
    private final ArrayList<Tracker> trackers;

    static {
        try {
            // ensure plugins path exists before depending on it
            Files.createDirectories(Data.PATH_PLUGINS);
            
            URL url = Data.PATH_PLUGINS.toFile().toURI().toURL();
            URL[] urls = new URL[] {url};
            CLASSLOADER = new URLClassLoader(urls);
        } catch (MalformedURLException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Create the PluginManager.
     * <p>
     * This constructor creates instances of the available plugins, which are manually defined here.
     * 
     * @param config the user Config to load initial plugin settings (not stored)
     */
    public PluginManager(Config config) {
        contentSources = new ArrayList<ContentSource>();
        this.reloadContentSources();

        infoSource = new AniList();

        boolean anilist_authenticated =
                (boolean) config.getValue(Config.Field.TRACKER_ANILIST_AUTHENTICATED);
        String anilist_token = (String) config.getValue(Config.Field.TRACKER_ANILIST_TOKEN);
        boolean kitsu_authenticated =
                (boolean) config.getValue(Config.Field.TRACKER_KITSU_AUTHENTICATED);
        String kitsu_token = (String) config.getValue(Config.Field.TRACKER_KITSU_TOKEN);

        // @formatter:off
        trackers = new ArrayList<>();
        trackers.addAll(Arrays.asList(
            anilist_authenticated
                ? new com.faltro.houdoku.plugins.tracker.AniList(anilist_token)
                : new com.faltro.houdoku.plugins.tracker.AniList(),
            kitsu_authenticated
                ? new Kitsu(kitsu_token)
                : new Kitsu()
            // add other trackers here
        ));
        // @formatter:on
    }

    /**
     * Gets the ID of a content source instance.
     *
     * @param contentSource the ContentSource to get the id of
     * @return the ID of the contentSource's class.
     */
    private int getSourceId(ContentSource contentSource) {
        int result = -1;
        try {
            result = contentSource.getClass().getField("ID").getInt(null);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            e.printStackTrace();
        }
        return result;
    }

    /**
     * Gets the ContentSource instance whose class has the given ID.
     *
     * @param id the ContentSource ID (the static ID field of the implementing plugin class)
     * @return the ContentSource instance whose class has the given ID.
     */
    public ContentSource getSource(int id) {
        return contentSources.stream().filter(contentSource -> getSourceId(contentSource) == id)
                .findFirst().orElse(null);
    }

    /**
     * Gets the ID of a tracker instance.
     *
     * @param tracker the Tracker to get the id of
     * @return the ID of the tracker's class.
     */
    private int getTrackerId(Tracker tracker) {
        int result = -1;
        try {
            result = tracker.getClass().getField("ID").getInt(null);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            e.printStackTrace();
        }
        return result;
    }

    public void reloadContentSources() {
        contentSources.clear();
        File contentDir = Data.PATH_PLUGINS_CONTENT.toFile();
        if (contentDir.exists()) {
            File[] contentFiles = contentDir.listFiles();
            if (contentFiles != null) {
                for (File file : contentFiles) {
                    if (file.isFile()) {
                        String[] fname_parts = file.getName().split("\\.(?=[^\\.]+$)");
                        if (fname_parts.length > 0) {
                            String basename = fname_parts[0];
                            try {
                                Class cls = CLASSLOADER.loadClass(
                                        "com.faltro.houdoku.plugins.content." + basename);
                                contentSources.add((ContentSource) cls.newInstance());
                            } catch (ClassNotFoundException e) {
                                e.printStackTrace();
                            } catch (InstantiationException | IllegalAccessException e) {
                                e.printStackTrace();
                            }
                        }
                    }
                }
            }
        }
    }

    public JsonArray downloadPluginIndex() throws IOException {
        String url = PLUGINS_BASE_URL + "/index.json";

        Response response = Requests.GET(new OkHttpClient(), url);
        if (response.isSuccessful()) {
            String text = response.body().string();
            return new JsonParser().parse(text).getAsJsonArray();
        } else {
            throw new IOException(String.valueOf(response.code()) + " " + response.message());
        }
    }

    public void downloadPlugin(String name) throws IOException {
        String url = PLUGINS_BASE_URL + "/content/" + name + ".class";

        Response response = Requests.GET(new OkHttpClient(), url);
        if (response.isSuccessful()) {
            Path output_path =
                    Paths.get(Data.PATH_PLUGINS_CONTENT + File.separator + name + ".class");
            Files.createDirectories(output_path.getParent());
            Files.write(output_path, response.body().bytes());
        } else {
            throw new IOException(String.valueOf(response.code()) + " " + response.message());
        }
    }

    public void deletePlugin(String name) throws IOException {
        Path path = Paths.get(Data.PATH_PLUGINS_CONTENT + File.separator + name + ".class");
        Files.deleteIfExists(path);
    }

    /**
     * Gets the Tracker instance whose class has the given ID.
     *
     * @param id the Tracker ID (the static ID field of the implementing plugin class)
     * @return the Tracker instance whose class has the given ID.
     */
    public Tracker getTracker(int id) {
        return trackers.stream().filter(tracker -> getTrackerId(tracker) == id).findFirst()
                .orElse(null);
    }

    public ArrayList<ContentSource> getContentSources() {
        return contentSources;
    }

    public ArrayList<Tracker> getTrackers() {
        return trackers;
    }

    public InfoSource getInfoSource() {
        return infoSource;
    }
}
