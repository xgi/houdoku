package com.faltro.houdoku.util;

/**
 * An info source is a website which contains generic series information and
 * media. This type differs from {@link ContentSource} in that instances of this
 * class are used to retrieve information and media which is not specific to
 * an individual ContentSource.
 * <p>
 * Currently, instances of this class are not heavily utilized, since most
 * ContentSource's provide adequate series information. In the future, we may
 * want to utilize instances of this class to "fill in" for missing data
 * from ContentSource's.
 * <p>
 * The client maintains only one InfoSource at a time, which is hardcoded in
 * {@link PluginManager}. In the future, we may allow the user to switch the
 * current InfoSource in their settings.
 *
 * @see com.faltro.houdoku.plugins.info
 */
public interface InfoSource {
    /**
     * The unique identifier for the InfoSource.
     */
    int ID = -1;
    /**
     * The user-friendly name of the InfoSource.
     */
    String NAME = "UnimplementedInfoSource";
    /**
     * The domain of the InfoSource.
     */
    String DOMAIN = "example.com";
    /**
     * The protocol for the InfoSource, which is likely either http or https.
     */
    String PROTOCOL = "https";

    /**
     * Represents this InfoSource as a string.
     *
     * @return the user-friendly representation of this InfoSource
     */
    String toString();
}
