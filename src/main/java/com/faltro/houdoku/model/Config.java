package com.faltro.houdoku.model;

import javafx.scene.input.KeyCode;

import java.util.HashMap;

/**
 * Stores user-specific config information for the client.
 */
public class Config {
    /**
     * Whether the night mode theme is currently enabled.
     */
    public static final String FIELD_NIGHT_MODE_ENABLED = "night_mode_enabled";
    /**
     * Whether the night mode theme is only applied to the reader page.
     */
    public static final String FIELD_NIGHT_MODE_READER_ONLY = "night_mode_reader_only";
    /**
     * The type of filter to apply to the reader page when night mode is active.
     * <p>
     * Available values are: "color", "brightness", "none"
     */
    public static final String FIELD_PAGE_FILTER_TYPE = "page_filter_type";
    /**
     * The hue modifier to use on the reader page when night mode is active and
     * the page filter is set to "color".
     */
    public static final String FIELD_PAGE_FILTER_COLOR_HUE = "page_filter_color_hue";
    /**
     * The saturation modifier to use on the reader page when night mode is
     * active and the page filter is set to "color".
     */
    public static final String FIELD_PAGE_FILTER_COLOR_SATURATION = "page_filter_color_saturation";
    /**
     * The brightness modifier to use on the reader page when night mode is
     * active and the page filter is set to "brightness".
     */
    public static final String FIELD_PAGE_FILTER_BRIGHTNESS = "page_filter_brightness";
    /**
     * Whether to restrict the preloading of pages in the reader. If the value
     * is false, the reader will preload the entire chapter even if the user
     * stays on the first page.
     */
    public static final String FIELD_RESTRICT_PRELOAD_PAGES = "restrict_preload_pages";
    /**
     * The number of pages to preload if preloading pages is restricted.
     */
    public static final String FIELD_PRELOAD_PAGES_AMOUNT = "preload_pages_amount";
    /**
     * Key binding in the reader for going to the previous page.
     */
    public static final String FIELD_READER_KEY_PREV_PAGE = "reader_key_prev_page";
    /**
     * Key binding in the reader for going to the next page.
     */
    public static final String FIELD_READER_KEY_NEXT_PAGE = "reader_key_next_page";
    /**
     * Key binding in the reader for going to the first page.
     */
    public static final String FIELD_READER_KEY_FIRST_PAGE = "reader_key_first_page";
    /**
     * Key binding in the reader for going to the last page.
     */
    public static final String FIELD_READER_KEY_LAST_PAGE = "reader_key_last_page";
    /**
     * Key binding in the reader for going back to the series view.
     */
    public static final String FIELD_READER_KEY_TO_SERIES = "reader_key_to_series";

    /**
     * The HashMap of default configuration values.
     */
    private static final HashMap<String, Object> DEFAULTS = new HashMap<>();

    static {
        DEFAULTS.put(FIELD_NIGHT_MODE_ENABLED, false);
        DEFAULTS.put(FIELD_NIGHT_MODE_READER_ONLY, false);
        DEFAULTS.put(FIELD_PAGE_FILTER_TYPE, "color");
        DEFAULTS.put(FIELD_PAGE_FILTER_COLOR_HUE, 0.25);
        DEFAULTS.put(FIELD_PAGE_FILTER_COLOR_SATURATION, 0.33);
        DEFAULTS.put(FIELD_PAGE_FILTER_BRIGHTNESS, 0.50);
        DEFAULTS.put(FIELD_RESTRICT_PRELOAD_PAGES, false);
        DEFAULTS.put(FIELD_PRELOAD_PAGES_AMOUNT, 6.0);
        DEFAULTS.put(FIELD_READER_KEY_PREV_PAGE, KeyCode.LEFT.toString());
        DEFAULTS.put(FIELD_READER_KEY_NEXT_PAGE, KeyCode.RIGHT.toString());
        DEFAULTS.put(FIELD_READER_KEY_FIRST_PAGE, KeyCode.HOME.toString());
        DEFAULTS.put(FIELD_READER_KEY_LAST_PAGE, KeyCode.END.toString());
        DEFAULTS.put(FIELD_READER_KEY_TO_SERIES, KeyCode.BACK_SPACE.toString());
    }

    private HashMap<String, Object> data;

    /**
     * Create a Config instance with data using the default values.
     */
    public Config() {
        data = new HashMap<>(DEFAULTS);
    }

    /**
     * Restore the data to the default values.
     */
    public void restoreDefaults() {
        data = new HashMap<>(DEFAULTS);
    }

    /**
     * Update the value for a field in the config data.
     * <p>
     * This method returns a boolean of whether it was successful in updating
     * the field. It is considered unsuccessful if the given field name is not
     * in the data HashMap, or if the type of the new value does not match the
     * type of the existing value.
     *
     * @param name  the name of the field to update
     * @param value the new value of the field
     * @return whether or not the field was successfully updated
     */
    public boolean updateField(String name, Object value) {
        boolean successful = false;
        if (data.containsKey(name)) {
            if (data.get(name).getClass() == value.getClass()) {
                data.replace(name, value);
                successful = true;
            }
        }
        return successful;
    }

    /**
     * Get the value of the field with the given name.
     *
     * @param name the name of the field to retrieve
     * @return the value of the requested field, or null
     */
    public Object getField(String name) {
        Object result = null;
        if (data.containsKey(name)) {
            result = data.get(name);
        }
        return result;
    }

    /**
     * Get the default value of the field with the given name.
     *
     * @param name the name of the field to retrieve
     * @return the default value of the requested field, or null
     */
    public Object getFieldDefault(String name) {
        Object result = null;
        if (DEFAULTS.containsKey(name)) {
            result = DEFAULTS.get(name);
        }
        return result;
    }
}
