package com.faltro.houdoku.util;

import javafx.scene.image.Image;
import javafx.scene.image.ImageView;

import java.time.format.DateTimeFormatter;

public class OutputHelpers {
    public static final DateTimeFormatter dateTimeFormatter =
            DateTimeFormatter.ofPattern("MMM dd, yyyy");

    /**
     * Truncates a string to a maximum length, with a trailing ellipsis.
     *
     * @param string the source string
     * @param length the maximum length of the output string; must be the
     *               greater of either 3 or the length of the input string
     * @return the given string truncated to the given length
     */
    public static String truncate(String string, int length) {
        return string.length() > length ? string.substring(0, length - 3) + "..." : string;
    }

    /**
     * Represents a double as a String.
     * <p>
     * The resulting string will only contain a decimal if the double cannot
     * be equivalently represented without it.
     *
     * @param dbl the source Double
     * @return a String representation of dbl
     */
    public static String doubleToString(Double dbl) {
        String result = dbl.toString();
        if (dbl.intValue() == dbl) {
            result = Integer.toString(dbl.intValue());
        }
        return result;
    }

    /**
     * Sanitize a filename of potentially illegal characters.
     *
     * @param filename the filename to sanitize
     * @return the filename with illegal characters replaced with underscores
     */
    public static String sanitizeFilename(String filename) {
        // based on https://stackoverflow.com/a/17745189
        // this could have issues with non-latin characters
        return filename.replaceAll("[^a-zA-Z0-9\\._]+", "_");
    }

    /**
     * Shrink an Image to a set of maximum dimensions, if necessary.
     * <p>
     * If the Image is smaller than the given dimensions, it is not changed.
     *
     * @param image the Image to shrink
     * @param max_width the max width of the new Image
     * @param max_height the max height of the new Image
     * @return an Image with dims that are at most max_width and max_height
     */
    public static Image shrinkImage(Image image, int max_width, int max_height) {
        // adapted from https://stackoverflow.com/a/35613669
        ImageView imageView = new ImageView(image);
        imageView.setPreserveRatio(true);
        if (max_width > max_height && image.getWidth() > max_width) {
            imageView.setFitWidth(max_width);
        } else if (max_height > max_width && image.getHeight() > max_height) {
            imageView.setFitHeight(max_height);
        }
        return imageView.snapshot(null, null);
    }
}
