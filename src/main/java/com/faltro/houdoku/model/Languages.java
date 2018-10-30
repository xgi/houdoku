package com.faltro.houdoku.model;

/**
 * Contains language definitions.
 * <p>
 * This class was made to unify content sources which may represent languages in
 * a variety of formats or with different language codes.
 */
public class Languages {
    /**
     * Retrieve a Language using a language code or String.
     * <p>
     * For example, calling this method with "gb" or "english" or "English"
     * will return Language.ENGLISH.
     *
     * @param code the case-insensitive language code to lookup
     * @return the matching Language, or Language.UNKNOWN if none match
     * @see Language
     */
    public static Language get(String code) {
        for (Language language : Language.values()) {
            if (language.getName().toLowerCase().equals(code.toLowerCase())) {
                return language;
            } else {
                for (String c : language.getCodes()) {
                    if (c.toLowerCase().equals(code.toLowerCase())) {
                        return language;
                    }
                }
            }
        }
        return Language.UNKNOWN;
    }

    public enum Language {
        ARABIC("Arabic", "sa"),
        CHINESE("Chinese", "zh", "cn"),
        ENGLISH("English", "gb", "en"),
        FILIPINO("Filipino", "ph"),
        FRENCH("French", "fr"),
        GERMAN("German", "de"),
        INDONESIAN("Indonesian", "id"),
        ITALIAN("Italian", "it"),
        JAPANESE("Japanese", "jp"),
        KOREAN("Korean", "kr"),
        POLISH("Polish", "pl"),
        PORTUGUESE("Portuguese", "br"),
        RUSSIAN("Russian", "ru"),
        SPANISH("Spanish", "es", "mx"),
        THAI("Thai", "th"),
        UNKNOWN("[unknown]"),
        VIETNAMESE("Vietnamese", "vn");

        private final String name;
        private final String[] codes;

        Language(String name, String... codes) {
            this.name = name;
            this.codes = codes;
        }

        String getName() {
            return this.name;
        }

        String[] getCodes() {
            return this.codes;
        }

        public String toString() {
            return this.name;
        }
    }
}