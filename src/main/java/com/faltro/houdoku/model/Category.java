package com.faltro.houdoku.model;

import java.util.ArrayList;

public class Category {
    private String name;
    private transient Category parent;
    private ArrayList<Category> subcategories;
    private transient int occurrences;

    public Category(String name, Category parent) {
        this.name = name;
        this.parent = parent;
        this.occurrences = 0;
        this.subcategories = new ArrayList<>();
    }

    public static boolean nameIsValid(String name) {
        boolean result = true;
        if (name.equals("")) {
            result = false;
        }
        return result;
    }

    public void addSubcategory(Category category) {
        this.subcategories.add(category);
    }

    public void deltaOccurrences(int delta) {
        occurrences += delta;
    }

    public Category recursiveFindSubcategory(String name) {
        Category result = null;
        if (this.name.toLowerCase().equals(name.toLowerCase())) {
            result = this;
        } else {
            for (Category category : subcategories) {
                Category tempResult = category.recursiveFindSubcategory(name);
                result = tempResult == null ? result : tempResult;
            }
        }
        return result;
    }

    /**
     * Remove the given category from the subcategories of this.
     *
     * @param category the category to remove, which should be a direct
     *                 subcategory of this
     */
    public void removeSubcategory(Category category) {
        subcategories.remove(category);
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Category getParent() {
        return parent;
    }

    public ArrayList<Category> getSubcategories() {
        subcategories.sort((a, b) -> {
            String name_a = a.getName();
            String name_b = b.getName();
            return name_a.compareTo(name_b);
        });
        return subcategories;
    }

    public int getOccurrences() {
        return occurrences;
    }

    public void setOccurrences(int occurrences) {
        this.occurrences = occurrences;
    }

    public String toString() {
        return name + " (" + Integer.toString(occurrences) + ")";
    }

    public boolean equals(Category category) {
        return name.toLowerCase().equals(category.name.toLowerCase());
    }
}
