package com.faltro.houdoku.model;

import org.junit.Before;
import org.junit.Test;

import java.util.ArrayList;
import java.util.Arrays;

import static org.junit.Assert.*;

public class CategoryTest {
    private Category category1;
    private Category category2;
    private Category category3;

    @Before
    public void setUp() {
        category1 = new Category("apple", null);
        category2 = new Category("banana", null);
        category3 = new Category("carrot", null);
    }

    @Test
    public void name() {
        assertEquals("apple", category1.getName());
        category1.setName("new_name");
        assertEquals("new_name", category1.getName());
    }

    @Test
    public void parent() {
        assertEquals(null, category1.getParent());
        Category child = new Category("child", category1);
        category1.addSubcategory(child);
        assertEquals(category1, child.getParent());
    }

    @Test
    public void nameIsValidBlank() {
        assertFalse(Category.nameIsValid(""));
    }

    @Test
    public void addSubcategory() {
        assertTrue(category1.getSubcategories().isEmpty());
        category1.addSubcategory(category2);
        assertFalse(category1.getSubcategories().isEmpty());
        assertEquals(category2, category1.getSubcategories().get(0));
    }

    @Test
    public void removeSubcategory() {
        assertTrue(category1.getSubcategories().isEmpty());
        category1.addSubcategory(category2);
        assertFalse(category1.getSubcategories().isEmpty());
        assertEquals(category2, category1.getSubcategories().get(0));
        category1.removeSubcategory(category2);
        assertTrue(category1.getSubcategories().isEmpty());
    }

    @Test
    public void getSubcategoriesPreordered() {
        category1.addSubcategory(category2);
        category1.addSubcategory(category3);
        assertEquals(new ArrayList<>(Arrays.asList(category2, category3)),
                category1.getSubcategories());
        assertNotEquals(new ArrayList<>(Arrays.asList(category1, category3)),
                category1.getSubcategories());
    }

    @Test
    public void getSubcategoriesOrdered() {
        category1.addSubcategory(category3);
        category1.addSubcategory(category2);
        assertEquals(new ArrayList<>(Arrays.asList(category2, category3)),
                category1.getSubcategories());
        assertNotEquals(new ArrayList<>(Arrays.asList(category3, category2)),
                category1.getSubcategories());
    }

    @Test
    public void recursiveFindSubcategory1() {
        category1.addSubcategory(category2);
        assertEquals(category2, category1.recursiveFindSubcategory(category2.getName()));
    }

    @Test
    public void recursiveFindSubcategory2() {
        category1.addSubcategory(category2);
        category1.addSubcategory(category3);
        assertEquals(category2, category1.recursiveFindSubcategory(category2.getName()));
    }

    @Test
    public void recursiveFindSubcategory3() {
        category2.addSubcategory(category3);
        category1.addSubcategory(category2);
        assertEquals(category3, category1.recursiveFindSubcategory(category3.getName()));
    }

    @Test
    public void equals() {
        assertFalse(category1.equals(category2));
        category2.setName("apple");
        assertTrue(category1.equals(category2));
        category2.setName("aPpLe");
        assertTrue(category1.equals(category2));
    }
}