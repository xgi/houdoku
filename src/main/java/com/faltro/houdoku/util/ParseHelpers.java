package com.faltro.houdoku.util;

import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.text.NumberFormat;
import java.text.ParseException;

public class ParseHelpers {
    public static String[] htmlListToStringArray(Element list, String... itemTag) {
        String selectorTag = itemTag.length > 0 ? itemTag[0] : "li";
        Elements items = list.select(selectorTag);
        String[] result = new String[items.size()];
        for (Element item : items) {
            result[items.indexOf(item)] = item.text();
        }
        return result;
    }

    public static Element tdWithHeader(Element parent, String header) {
        return parent.selectFirst("th:contains(" + header + ")").parent().selectFirst("td");
    }

    /**
     * Isolates the first word in the given string.
     * <p>
     * This function is built to handle two cases: the input string solely
     * contains a single word, and the input string contains a sequence of
     * words, separated by spaces.
     *
     * @param string
     * @return
     */
    public static String firstWord(String string) {
        String result = string;
        if (string.contains(" ")) {
            result = string.substring(0, string.indexOf(" "));
        }
        return result;
    }

    public static int parseInt(String text) {
        text = text.split("\\s+")[0];
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

    public static double parseDouble(String text) {
        text = text.split("\\s+")[0];
        return text.length() > 0 ? Double.parseDouble(text) : 0;
    }
}
