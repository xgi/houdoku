package com.faltro.houdoku.model;

import javafx.scene.input.KeyCode;
import java.util.HashMap;

/**
 * Stores user-specific config information for the client.
 */
public class Config {
    private final HashMap<String, Object> data;

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
     *
     * @param field the Field to replace
     * @param value the new value of the field
     */
    public void replaceValue(Field field, Object value) {
        if (data.containsKey(field.name)) {
            if (data.get(field.name).getClass() == value.getClass()) {
                data.replace(field.name, value);
            }
        }
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
         * Quickly reload series information by only making one HTTP request, at the expense of
         * potentially not retrieving all of a series' chapters.
         */
        QUICK_RELOAD_SERIES("quick_reload_series", true),
        /**
         * Whether to filter all releases to a specific language.
         */
        LANGUAGE_FILTER_ENABLED("language_filter_enabled", true),
        /**
         * The language to filter to, if the language filter is enabled.
         */
        LANGUAGE_FILTER_LANGUAGE("language_filter_language", "English"),
        /**
         * Whether to apply page filters only when night mode is enabled.
         */
        PAGE_FILTER_NIGHT_MODE_ONLY("page_filter_night_mode_only", true),
        /**
         * Whether the color page filter is enabled.
         */
        PAGE_FILTER_COLOR_ENABLED("page_filter_color_enabled", true),
        /**
         * The hue modifier to use on the reader page when effects are active and the page filter is
         * set to "color".
         */
        PAGE_FILTER_COLOR_HUE("page_filter_color_hue", 0.25),
        /**
         * The saturation modifier to use on the reader page when effects are active and the page
         * filter is set to "color".
         */
        PAGE_FILTER_COLOR_SATURATION("page_filter_color_saturation", 0.33),
        /**
         * Whether the color page filter is enabled.
         */
        PAGE_FILTER_BRIGHTNESS_ENABLED("page_filter_brightness_enabled", false),
        /**
         * The brightness modifier to use on the reader page when effects are active and the page
         * filter is set to "brightness".
         */
        PAGE_FILTER_BRIGHTNESS("page_filter_brightness", 0.50),
        /**
         * Whether to restrict the preloading of pages in the reader. If the value is false, the
         * reader will preload the entire chapter even if the user stays on the first page.
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
        READER_KEY_TO_SERIES("reader_key_to_series", KeyCode.BACK_SPACE.toString()),
        /**
         * Whether the user is currently authenticated with AniList.
         */
        TRACKER_ANILIST_AUTHENTICATED("tracker_anilist_authenticated", false),
        /**
         * The user's AniList authentication token (only makes sense when authenticated).
         */
        TRACKER_ANILIST_TOKEN("tracker_anilist_token", ""),
        /**
         * Whether to automatically update the number of chapters read on AniList.
         */
        TRACKER_ANILIST_UPDATE_AUTO("tracker_anilist_update_auto", false);

        private final String name;
        private final Object defaultValue;

        Field(String name, Object default_value) {
            this.name = name;
            this.defaultValue = default_value;
        }

        String getName() {
            return name;
        }

        Object getDefaultValue() {
            return defaultValue;
        }

        public String toString() {
            return name;
        }
    }
}
