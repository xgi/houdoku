package com.faltro.houdoku.model;

/**
 * Contains reading status definitions.
 * <p>
 * This class was made to unify trackers which may represent status codes in different formats.
 * Note: it is not used for representing the publication status of a series -- it is for
 * representing the state of the user's consumption of a series.
 */
public class Statuses {
    /**
     * Retrieve a Status from a recognizable code/token.
     * <p>
     * For example, calling this method with "plan to read" or "planning" or "PLANNING" will return
     * Status.PLANNING.
     *
     * @param code the case-insensitive status code to lookup
     * @return the matching Status, or Status.UNKNOWN if none match
     * @see Status
     */
    public static Status get(String code) {
        for (Status status : Status.values()) {
            if (status.getName().toLowerCase().equals(code.toLowerCase())) {
                return status;
            } else {
                for (String c : status.getCodes()) {
                    if (c.toLowerCase().equals(code.toLowerCase())) {
                        return status;
                    }
                }
            }
        }
        return Status.UNKNOWN;
    }

    public enum Status {
        // @formatter:off
        COMPLETED("Completed"),
        DROPPED("Dropped"),
        PAUSED("Paused", "on_hold"),
        PLANNING("Planning", "plan to read", "planned"),
        READING("Reading", "current"),
        REREADING("Rereading", "repeating"),
        UNKNOWN("[unknown]");
        // @formatter:on

        private final String name;
        private final String[] codes;

        Status(String name, String... codes) {
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
