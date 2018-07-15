package com.faltro.houdoku.model;

import javafx.scene.input.KeyCode;

import java.util.HashMap;

/**
 * Stores user-specific config information for the client.
 */
public class Config {
    private HashMap<String, Object> data;

    /**
     * Create a Config instance with data using the default values.
     */
    public Config() {
        data = new HashMap<>();
        for (Field field : Field.values()) {
            data.put(field.getName(), field.getDefaultValue());
        }
    }

    /**
     * Restore the data to the default values.
     */
    public void restoreDefaults() {
        for (Field field : Field.values()) {
            data.put(field.getName(), field.getDefaultValue());
        }
    }

    /**
     * Update the value for a field in the config data.
     * <p>
     * This method returns a boolean of whether it was successful in updating
     * the field. It is considered unsuccessful if the given field name is not
     * in the data HashMap, or if the type of the new value does not match the
     * type of the existing value.
     *
     * @param field the Field to replace
     * @param value the new value of the field
     * @return whether or not the field was successfully updated
     */
    public boolean replaceValue(Field field, Object value) {
        boolean successful = false;
        if (data.containsKey(field.name)) {
            if (data.get(field.name).getClass() == value.getClass()) {
                data.replace(field.name, value);
                successful = true;
            }
        }
        return successful;
    }

    /**
     * Get the value of the field with the given name.
     *
     * @param field the Field to retrieve
     * @return the value of the requested Field, or null
     */
    public Object getValue(Field field) {
        Object result = null;
        if (data.containsKey(field.name)) {
            result = data.get(field.name);
        }
        return result;
    }

    public enum Field {
        /**
         * Whether the night mode theme is currently enabled.
         */
        NIGHT_MODE_ENABLED("night_mode_enabled", false),
        /**
         * Whether the night mode theme is only applied to the reader page.
         */
        NIGHT_MODE_READER_ONLY("night_mode_reader_only", false),
        /**
         * The type of filter to apply to the reader page when night mode is active.
         * <p>
         * Available values are: "color", "brightness", "none"
         */
        PAGE_FILTER_TYPE("page_filter_type", "color"),
        /**
         * The hue modifier to use on the reader page when night mode is active and
         * the page filter is set to "color".
         */
        PAGE_FILTER_COLOR_HUE("page_filter_color_hue", 0.25),
        /**
         * The saturation modifier to use on the reader page when night mode is
         * active and the page filter is set to "color".
         */
        PAGE_FILTER_COLOR_SATURATION("page_filter_color_saturation", 0.33),
        /**
         * The brightness modifier to use on the reader page when night mode is
         * active and the page filter is set to "brightness".
         */
        PAGE_FILTER_BRIGHTNESS("page_filter_brightness", 0.50),
        /**
         * Whether to restrict the preloading of pages in the reader. If the value
         * is false, the reader will preload the entire chapter even if the user
         * stays on the first page.
         */
        RESTRICT_PRELOAD_PAGES("restrict_preload_pages", false),
        /**
         * The number of pages to preload if preloading pages is restricted.
         */
        PRELOAD_PAGES_AMOUNT("preload_pages_amount", 6.0),
        /**
         * Key binding in the reader for going to the previous page.
         */
        READER_KEY_PREV_PAGE("reader_key_prev_page", KeyCode.LEFT.toString()),
        /**
         * Key binding in the reader for going to the next page.
         */
        READER_KEY_NEXT_PAGE("reader_key_next_page", KeyCode.RIGHT.toString()),
        /**
         * Key binding in the reader for going to the first page.
         */
        READER_KEY_FIRST_PAGE("reader_key_first_page", KeyCode.HOME.toString()),
        /**
         * Key binding in the reader for going to the last page.
         */
        READER_KEY_LAST_PAGE("reader_key_last_page", KeyCode.END.toString()),
        /**
         * Key binding in the reader for going back to the series view.
         */
        READER_KEY_TO_SERIES("reader_key_to_series", KeyCode.BACK_SPACE.toString());

        String name;
        Object default_value;

        Field(String name, Object default_value) {
            this.name = name;
            this.default_value = default_value;
        }

        public String getName() {
            return name;
        }

        public Object getDefaultValue() {
            return default_value;
        }

        public String toString() {
            return name;
        }
    }
}
