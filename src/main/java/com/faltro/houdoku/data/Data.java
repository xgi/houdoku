package com.faltro.houdoku.data;

import com.faltro.houdoku.model.Config;
import com.faltro.houdoku.model.Library;
import com.faltro.houdoku.model.Series;
import com.faltro.houdoku.util.OutputHelpers;
import javafx.embed.swing.SwingFXUtils;
import javafx.scene.image.Image;
import net.harawata.appdirs.AppDirs;
import net.harawata.appdirs.AppDirsFactory;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class Data {
    /**
     * The name of the encoding to use for all saved text.
     */
    private static final String CHAR_ENCODING = "UTF-8";
    /**
     * AppDirs instance for determining cross-platform application directories.
     */
    private static final AppDirs appDirs = AppDirsFactory.getInstance();
    /**
     * The base directory for storing application-specific user data.
     */
    private static final String USER_DATA_DIR = appDirs.getUserDataDir("houdoku", null, "faltro");
    /**
     * The Path for storing library data.
     */
    private static final Path PATH_LIBRARY =
            Paths.get(USER_DATA_DIR + File.separator + "library.json.gzip");
    /**
     * The Path for storing config data.
     */
    private static final Path PATH_CONFIG =
            Paths.get(USER_DATA_DIR + File.separator + "config.json.gzip");
    /**
     * The Path for storing series cover images.
     */
    private static final Path PATH_COVERS = Paths.get(USER_DATA_DIR + File.separator + "covers");
    /**
     * The Path for storing plugins.
     */
    public static final Path PATH_PLUGINS = Paths.get(USER_DATA_DIR + File.separator + "plugins");
    /**
     * The Path for storing ContentSource plugins.
     */
    public static final Path PATH_PLUGINS_CONTENT = Paths.get(USER_DATA_DIR + File.separator
            + "plugins" + File.separator + "com" + File.separator + "faltro" + File.separator
            + "houdoku" + File.separator + "plugins" + File.separator + "content");

    /**
     * Save the given Library to the filesystem.
     *
     * @param library the library to save
     * @see #loadLibrary()
     * @see Serializer#serializeLibrary(Library)
     */
    public static void saveLibrary(Library library) {
        String serialized = Serializer.serializeLibrary(library);
        try {
            write(serialized.getBytes(CHAR_ENCODING), PATH_LIBRARY);
        } catch (IOException e) {
            e.printStackTrace();
        }

        // save cover images
        for (Series series : library.getSerieses()) {
            if (series.getCover() != null) {
                try {
                    saveImage(series.getCover(), findCoverPath(series));
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * Load a saved Library from the filesystem.
     *
     * @return the saved library, or null if it is not available
     * @see #saveLibrary(Library)
     * @see Serializer#deserializeLibrary(String)
     */
    public static Library loadLibrary() {
        Library result = null;
        if (Files.exists(PATH_LIBRARY)) {
            try {
                String data = new String(read(PATH_LIBRARY), CHAR_ENCODING);
                result = Serializer.deserializeLibrary(data);

                // load cover images
                for (Series series : result.getSerieses()) {
                    series.setCover(loadImage(findCoverPath(series)));
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return result;
    }

    /**
     * Save the given Config to the filesystem.
     *
     * @param config the config to save
     * @see #loadConfig()
     * @see Serializer#serializeConfig(Config)
     */
    public static void saveConfig(Config config) {
        String serialized = Serializer.serializeConfig(config);
        try {
            write(serialized.getBytes(CHAR_ENCODING), PATH_CONFIG);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Load a saved Config from the filesystem.
     *
     * @return the saved config, or null if it is not available
     * @see #saveConfig(Config)
     * @see Serializer#deserializeConfig(String)
     */
    public static Config loadConfig() {
        Config result = null;
        if (Files.exists(PATH_CONFIG)) {
            try {
                String data = new String(read(PATH_CONFIG), CHAR_ENCODING);
                result = Serializer.deserializeConfig(data);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return result;
    }

    /**
     * Compress and write the given data to a file.
     *
     * @param bytes the data to write
     * @param path  the path of the file to write the data
     * @throws IOException an IOException occurred when writing to the file
     * @see Compressor#compress(byte[])
     */
    private static void write(byte[] bytes, Path path) throws IOException {
        // ensure path to file exists
        Files.createDirectories(path.getParent());
        // ensure file exists
        if (!Files.exists(path)) {
            Files.createFile(path);
        }
        Files.write(path, Compressor.compress(bytes));
    }

    /**
     * Read and decompress the data of the given file.
     *
     * @param path the path of the file to read the data
     * @return the decompressed content of the file
     * @throws IOException an IOException occurred when reading from the file
     * @see Compressor#decompress(byte[])
     */
    private static byte[] read(Path path) throws IOException {
        byte[] bytes = Files.readAllBytes(path);
        return Compressor.decompress(bytes);
    }

    /**
     * Save a JavaFX Image to the filesystem.
     *
     * @param image the Image to save
     * @param path  the Path to save the image
     * @throws IOException an IOException occurred when writing to the file
     */
    private static void saveImage(Image image, Path path) throws IOException {
        // ensure path to file exists
        Files.createDirectories(path.getParent());

        BufferedImage bufferedImage = SwingFXUtils.fromFXImage(image, null);
        // convert to BufferedImage.TYPE_INT_RGB
        BufferedImage convertedImg = new BufferedImage(bufferedImage.getWidth(),
                bufferedImage.getHeight(), BufferedImage.TYPE_INT_RGB);
        convertedImg.getGraphics().drawImage(bufferedImage, 0, 0, null);
        ImageIO.write(convertedImg, "jpg", path.toFile());
    }

    /**
     * Load a JavaFX Image from the filesystem.
     *
     * @param path the Path to load the image
     * @return the Image at the given path, or null if it doesn't exist
     * @throws IOException an IOException occurred when loading the file
     */
    private static Image loadImage(Path path) throws IOException {
        if (Files.exists(path)) {
            BufferedImage bufferedImage = ImageIO.read(path.toFile());
            return SwingFXUtils.toFXImage(bufferedImage, null);
        } else {
            return null;
        }
    }

    /**
     * Delete a series' cover from the filesystem, if it has been saved.
     *
     * @param series the Series whose cover is being deleted
     */
    public static void deleteCover(Series series) {
        Path path = findCoverPath(series);
        if (Files.exists(path)) {
            try {
                Files.delete(path);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Retrieve the path for where a series' cover image should be saved.
     *
     * @param series the series whose cover to find the path for
     * @return the path to where the series' cover image should be saved
     */
    private static Path findCoverPath(Series series) {
        String name = OutputHelpers.sanitizeFilename(series.getTitle()) + ".jpg";
        return Paths.get(PATH_COVERS.toString() + File.separator + name);
    }
}
