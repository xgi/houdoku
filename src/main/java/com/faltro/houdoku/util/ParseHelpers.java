package com.faltro.houdoku.util;

import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import java.text.NumberFormat;
import java.text.ParseException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ParseHelpers {
    /**
     * The maximum width of covers retrieved from content sources. Cover images should be enforced
     * to this limit after being downloaded.
     */
    public static final int COVER_MAX_WIDTH = 320;

    /**
     * Creates an array of strings using the sub-elements of the given element.
     *
     * @param list    the container (parent) element, such as a ul
     * @param itemTag (optional) the tag of the child elements, such as li
     * @return an array of the text properties of the matching elements
     */
    public static String[] htmlListToStringArray(Element list, String... itemTag) {
        String selectorTag = itemTag.length > 0 ? itemTag[0] : "li";
        Elements items = list.select(selectorTag);
        String[] result = new String[items.size()];
        for (Element item : items) {
            result[items.indexOf(item)] = item.text();
        }
        return result;
    }

    /**
     * Retrieves the td element corresponding to the th with the given header.
     *
     * @param parent the parent element, which is probably a tbody
     * @param header the header text used to find a matching th; the first header which contains
     *               this text will be used
     * @return the td element corresponding to the th with the given header
     */
    public static Element tdWithHeader(Element parent, String header) {
        return parent.selectFirst("th:contains(" + header + ")").parent().selectFirst("td");
    }

    /**
     * Isolates the first word in the given string.
     * <p>
     * This function is built to handle two cases: the input string solely contains a single word,
     * and the input string contains a sequence of words, separated by spaces.
     *
     * @param string the source string
     * @return the first word in the given string
     */
    public static String firstWord(String string) {
        String result = string;
        if (string.contains(" ")) {
            result = string.substring(0, string.indexOf(" "));
        }
        return result;
    }

    /**
     * Safely parses an int from the given string.
     * <p>
     * This method can parse integers from text which uses US-style formatting, particularly
     * including comma separated digits.
     * <p>
     * If the given text is blank, this method will return 0.
     *
     * @param text a string which can reasonably be represented as an integer
     * @return the int which is represented by the given text
     */
    public static int parseInt(String text) {
        text = text.replaceAll(",", "");
        text = text.split("\\s+|-+")[0];
        int result = 0;
        if (!text.equals("")) {
            try {
                result = NumberFormat.getNumberInstance(java.util.Locale.US).parse(text).intValue();
            } catch (ParseException e) {
                e.printStackTrace();
            }
        }
        return result;
    }

    /**
     * Safely parses a long from the given string.
     * <p>
     * This method can parse longs from text which uses US-style formatting, particularly including
     * comma separated digits.
     * <p>
     * If the given text is blank, this method will return 0.
     *
     * @param text a string which can reasonably be represented as an integer
     * @return the int which is represented by the given text
     */
    public static long parseLong(String text) {
        text = text.replaceAll(",", "");
        text = text.split("\\s+|-|:+")[0];
        long result = 0;
        if (!text.equals("")) {
            try {
                result = NumberFormat.getNumberInstance(java.util.Locale.US).parse(text)
                        .longValue();
            } catch (ParseException e) {
                e.printStackTrace();
            }
        }
        return result;
    }

    /**
     * Safely parses a double from the given string.
     * <p>
     * If the given text is blank, this method will return 0.
     *
     * @param text a string which can reasonably be represented as a double
     * @return the double which is represented by the given text
     */
    public static double parseDouble(String text) {
        text = text.replaceAll(",", "");
        text = text.split("\\s+|-|:+")[0];
        return text.length() > 0 ? Double.parseDouble(text) : 0;
    }

    /**
     * Parses a dateString using the given dateTimeFormatter, but first checks whether the
     * dateString is a relative date, and calculates the appropriate LocalDateTime for either case.
     *
     * @param dateString        the source date text
     * @param dateTimeFormatter the DateTimeFormatter for processing the dateString
     * @return a LocalDateTime corresponding to the given dateString
     */
    public static LocalDateTime potentiallyRelativeDate(String dateString,
            DateTimeFormatter dateTimeFormatter) {
        LocalDateTime localDateTime;
        switch (dateString) {
            case "Today":
                localDateTime = LocalDate.now().atStartOfDay();
                break;
            case "Yesterday":
                localDateTime = LocalDate.now().minusDays(1).atStartOfDay();
                break;
            default:
                localDateTime = LocalDate.parse(dateString, dateTimeFormatter).atStartOfDay();
                break;
        }
        return localDateTime;
    }
}
