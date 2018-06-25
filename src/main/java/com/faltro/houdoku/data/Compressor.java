package com.faltro.houdoku.data;

import java.io.*;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

class Compressor {
    /**
     * Compress the given string using gzip.
     *
     * @param text the text to compress
     * @return the given string compressed and encoded as bytes using UTF-8
     */
    static byte[] compress(String text) {
        ByteArrayOutputStream result = new ByteArrayOutputStream();
        try {
            GZIPOutputStream gzip = new GZIPOutputStream(result);
            gzip.write(text.getBytes("UTF-8"));
            gzip.flush();
            gzip.close();
        } catch (IOException e) {
            // realistically, this should probably never happen, since we are
            // simply using data from a local variable
            e.printStackTrace();
        }
        return result.toByteArray();
    }

    /**
     * Decompresses a compressed array of bytes to a string.
     *
     * @param bytes an array of bytes encoded using UTF-8
     * @return the given bytes decompressed, as a string
     */
    static String decompress(byte[] bytes) {
        // based on https://stackoverflow.com/a/34305182
        StringBuilder result = new StringBuilder();
        try {
            GZIPInputStream gzip = new GZIPInputStream(new ByteArrayInputStream(bytes));
            BufferedReader bufferedReader = new BufferedReader(
                    new InputStreamReader(gzip, "UTF-8"));
            String line;
            while ((line = bufferedReader.readLine()) != null) {
                result.append(line);
            }
        } catch (IOException e) {
            // realistically, this should probably never happen, since we are
            // simply using data from a local variable
            e.printStackTrace();
        }
        return result.toString();
    }
}
