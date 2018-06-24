package com.faltro.houdoku.data;

import com.faltro.houdoku.model.Library;
import com.faltro.houdoku.util.Serializer;

import java.util.prefs.BackingStoreException;
import java.util.prefs.Preferences;

public class Data {
    /**
     * A string for use as a default value when retrieving Preferences values.
     */
    private static String NONEXISTENT_DATA = "NONEXISTENT DATA";
    /**
     * The maximum length of a string as a Preferences value.
     */
    private static int MAX_VALUE_LEN = 8192;
    /**
     * The field name for the library in the Preferences object.
     * <p>
     * In practice, this is only the prefix of the saved field name.
     *
     * @see #saveLongValue(Preferences, String, String)
     */
    private static String FIELD_LIBRARY = "library";
    /**
     * The Preferences object for the user-specific directory.
     */
    private static Preferences prefsUser = Preferences.userRoot();

    /**
     * Saves the given Library to the filesystem.
     * <p>
     * The library is saved to a user-specific directory.
     *
     * @param library the library to save
     */
    public static void saveLibrary(Library library) {
        String serialized = Serializer.serializeLibrary(library);

        // delete potentially overlapping fields before saving
        // We may want to load the data into a temp object before doing this to
        // prevent data loss if the application exits before the new data can
        // be saved.
        deleteFields(prefsUser, FIELD_LIBRARY);

        saveLongValue(prefsUser, FIELD_LIBRARY, serialized);
    }

    /**
     * Loads a saved Library from the filesystem.
     * <p>
     * The library is retrieved from a user-specific directory.
     *
     * @return the saved library, or null if it is not available
     */
    public static Library loadLibrary() {
        String serialized = loadLongValue(prefsUser, FIELD_LIBRARY);
        System.out.println(serialized);
        Library result = null;
        if (!serialized.equals(NONEXISTENT_DATA)) {
            result = Serializer.deserializeLibrary(serialized);
        }
        return result;
    }

    /**
     * Saves a potentially long-length value in the given Preferences object.
     * <p>
     * The given field will not actually be present in the saved preferences,
     * instead the value will be saved under multiple fields labeled field_0,
     * field_1, field_2, etc. Therefore, any value saved using this method
     * must be retrieved using loadLongValue which explicitly handles this
     * format.
     *
     * @param preferences the Preferences object to store the value in
     * @param field       the field prefix to store the value
     * @param value       the value to store, which may be very long
     * @see #loadLongValue(Preferences, String)
     */
    private static void saveLongValue(Preferences preferences, String field, String value) {
        int num_parts = (int) Math.ceil(value.length() / MAX_VALUE_LEN);
        for (int i = 0; i <= num_parts; i++) {
            String subExtended = value.substring(i * MAX_VALUE_LEN);
            String sub = subExtended.substring(0, subExtended.length() > MAX_VALUE_LEN ?
                    MAX_VALUE_LEN : subExtended.length());
            preferences.put(field + "_" + Integer.toString(i), sub);
        }
    }

    /**
     * Loads a potentially long-length value from the given Preferences object.
     * <p>
     * Requires the field to have been saved in the format described in the
     * documentation for {@link #saveLongValue(Preferences, String, String)}.
     *
     * @param preferences the Preferences object the value is stored in
     * @param field       the field prefix where the value is stored
     * @return the full value saved with the field prefix, or
     * {@link #NONEXISTENT_DATA} if the field is not found
     * @see #saveLongValue(Preferences, String, String)
     */
    private static String loadLongValue(Preferences preferences, String field) {
        StringBuilder result = new StringBuilder();
        String partial = "";
        for (int i = 0; !partial.equals(NONEXISTENT_DATA); i++) {
            partial = preferences.get(field + "_" + Integer.toString(i), NONEXISTENT_DATA);
            if (!partial.equals(NONEXISTENT_DATA)) {
                result.append(partial);
            }
        }
        return result.toString().equals("") ? NONEXISTENT_DATA : result.toString();
    }

    /**
     * Deletes fields from the given Preferences object with the given prefix.
     *
     * @param preferences the Preferences object to delete fields from
     * @param prefix      the prefix of fields to delete
     */
    private static void deleteFields(Preferences preferences, String prefix) {
        try {
            for (String key : preferences.keys()) {
                if (key.startsWith(prefix)) {
                    preferences.remove(key);
                }
            }
        } catch (BackingStoreException e) {
            e.printStackTrace();
        }
    }
}
