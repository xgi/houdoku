package com.faltro.houdoku.data;

import com.faltro.houdoku.model.Library;
import net.harawata.appdirs.AppDirs;
import net.harawata.appdirs.AppDirsFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class Data {
    /**
     * The name of the encoding to use for all saved text.
     */
    private static String CHAR_ENCODING = "UTF-8";
    /**
     * AppDirs instance for determining cross-platform application directories.
     */
    private static AppDirs appDirs = AppDirsFactory.getInstance();
    /**
     * The base directory for storing application-specific user data.
     */
    private static String USER_DATA_DIR = appDirs.getUserDataDir("houdoku", null, "xgi");
    /**
     * The name of the file for storing library data.
     */
    private static Path PATH_LIBRARY = Paths.get(
            USER_DATA_DIR + File.separator + "library.json.gzip");

    /**
     * Saves the given Library to the filesystem.
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
    }

    /**
     * Loads a saved Library from the filesystem.
     *
     * @return the saved library, or null if it is not available
     * @see #saveLibrary(Library)
     * @see Serializer#deserializeLibrary(String)
     */
    public static Library loadLibrary() {
        String data = null;
        if (Files.exists(PATH_LIBRARY)) {
            try {
                data = new String(read(PATH_LIBRARY), CHAR_ENCODING);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return data == null ? null : Serializer.deserializeLibrary(data);
    }

    /**
     * Compresses and writes the given data to a file.
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
     * Reads and decompresses the data of the given file.
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
}
