package com.faltro.houdoku.plugins.info;

import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.model.Series;
import javafx.scene.image.Image;

import java.io.IOException;

/**
 * This class contains implementations for some methods from InfoSource that
 * are expected to be common between most info source plugins.
 * <p>
 * For method and field documentation, please see the InfoSource class.
 *
 * @see InfoSource
 */
public class GenericInfoSource implements InfoSource {
    public static final int ID = -1;
    public static final String NAME = "GenericInfoSource";
    public static final String DOMAIN = "example.com";
    public static final String PROTOCOL = "https";

    @Override
    public Image banner(Series series) throws IOException, NotImplementedException {
        throw new NotImplementedException();
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
