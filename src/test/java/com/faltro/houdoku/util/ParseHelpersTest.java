package com.faltro.houdoku.util;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class ParseHelpersTest {

    @Test
    public void firstWord1() {
        assertEquals("first", ParseHelpers.firstWord("first"));
    }

    @Test
    public void firstWord2() {
        assertEquals("first", ParseHelpers.firstWord("first word"));
    }

    @Test
    public void parseInt1() {
        assertEquals(2, ParseHelpers.parseInt("2"));
    }

    @Test
    public void parseInt2() {
        assertEquals(2, ParseHelpers.parseInt("2.5"));
    }

    @Test
    public void parseInt3() {
        assertEquals(2345, ParseHelpers.parseInt("2,345.67 dollars"));
    }

    @Test
    public void parseDouble1() {
        assertEquals(2.0, ParseHelpers.parseDouble("2"), 0);
    }

    @Test
    public void parseDouble2() {
        assertEquals(2.5, ParseHelpers.parseDouble("2.5"), 0);
    }

    @Test
    public void parseDouble3() {
        assertEquals(2345.67, ParseHelpers.parseDouble("2,345.67 dollars"), 0);
    }
}