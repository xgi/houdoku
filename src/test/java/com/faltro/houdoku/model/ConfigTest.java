package com.faltro.houdoku.model;

import org.junit.Before;
import org.junit.Test;

import java.util.HashMap;

import static org.junit.Assert.*;

public class ConfigTest {
    private Config config;

    @Before
    public void setUp() {
        config = new Config();
    }

    @Test
    public void constructorAddedDefaultFields() {
        for (Config.Field field : Config.Field.values()) {
            assertEquals(config.getValue(field), field.getDefaultValue());
        }
    }

    @Test
    public void getValueContains() {
        Config.Field field = Config.Field.QUICK_RELOAD_SERIES;
        assertEquals(config.getValue(field), field.getDefaultValue());
    }

    @Test
    public void replaceValueContains() {
        Config.Field field = Config.Field.QUICK_RELOAD_SERIES;
        config.replaceValue(field, !(boolean) field.getDefaultValue());
        assertEquals(config.getValue(field), !(boolean) field.getDefaultValue());
    }
}