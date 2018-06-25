package com.faltro.houdoku.data;

import java.io.*;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

class Compressor {
    /**
     * Compress an array of bytes.
     *
     * @param bytes the bytes to compress
     * @return the given bytes compressed
     */
    static byte[] compress(byte[] bytes) {
        ByteArrayOutputStream result = new ByteArrayOutputStream();
        try {
            GZIPOutputStream gzip = new GZIPOutputStream(result);
            gzip.write(bytes);
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
     * Decompress a compressed array of bytes.
     *
     * @param bytes an array of bytes encoded using UTF-8
     * @return the given bytes decompressed
     */
    static byte[] decompress(byte[] bytes) {
        ByteArrayOutputStream result = new ByteArrayOutputStream();
        try {
            GZIPInputStream gzip = new GZIPInputStream(new ByteArrayInputStream(bytes));
            // retrieve bytes in chunks of 2048
            byte[] buffer = new byte[2048];
            int len;
            while ((len = gzip.read(buffer)) > 0) {
                result.write(buffer, 0, len);
            }
            gzip.close();
        } catch (IOException e) {
            // realistically, this should probably never happen, since we are
            // simply using data from a local variable
            e.printStackTrace();
        }
        return result.toByteArray();
    }
}
