package com.faltro.houdoku.util;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class OutputHelpersTest {

    @Test
    public void truncate1() {
        assertEquals("", OutputHelpers.truncate("", 0));
    }

    @Test
    public void truncate2() {
        assertEquals("some...", OutputHelpers.truncate("something", 7));
    }

    @Test
    public void doubleToString1() {
        assertEquals("0", OutputHelpers.doubleToString(0.0));
    }

    @Test
    public void doubleToString2() {
        assertEquals("1.5", OutputHelpers.doubleToString(1.5));
    }

    @Test
    public void sanitizeFilename1() {
        assertEquals("clean_name.txt", OutputHelpers.sanitizeFilename("clean_name.txt"));
    }

    @Test
    public void sanitizeFilename2() {
        assertEquals("ugly_file_n_me.txt", OutputHelpers.sanitizeFilename("ugly%file n@me.txt"));
    }
}