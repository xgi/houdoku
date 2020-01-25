package com.faltro.houdoku.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Category's are effectively "tags" for Series' in the Library. Series' can be assigned an array of
 * categories (handled as an array of strings) which are then matched with instances of this class.
 * 
 * <p>Instances of categories are unique -- the name of categories can not overlap.
 */
public class Category {
    private ArrayList<Category> subcategories;
    private String name;
    private transient Category parent;
    private transient int occurrences;

    public Category(String name, Category parent) {
        this.name = name;
        this.parent = parent;
        this.occurrences = 0;
        this.subcategories = new ArrayList<>();
    }

    /**
     * Determine whether a category name is valid.
     * 
     * <p>This method does not determine whether the name overlaps with an existing category -- it
     * only checks that the given name string is not inherently invalid.
     *
     * @param name the name to check
     * @return whether the given string is a valid category name
     */
    public static boolean nameIsValid(String name) {
        boolean result = true;
        if (name.equals("")) {
            result = false;
        }
        return result;
    }

    /**
     * Add a Category as a subcategory to this one.
     *
     * @param category the subcategory to add
     */
    public void addSubcategory(Category category) {
        category.setParent(this);
        this.subcategories.add(category);
    }

    /**
     * Find a Category which is subordinate to this one at any depth.
     *
     * @param name the name of the Category to find
     * @return the Category with the given name, or null
     */
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
     * Remove the given Category from the subcategories of this.
     *
     * @param category the Category to remove, which should be a direct subcategory of this
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

    private void setParent(Category category) {
        parent = category;
    }

    public List<Category> getSubcategories() {
        subcategories.sort((a, b) -> {
            String name_a = a.getName();
            String name_b = b.getName();
            return name_a.compareTo(name_b);
        });
        return subcategories;
    }

    public void setSubcategories(ArrayList<Category> subcategories) {
        this.subcategories = subcategories;
    }

    public void setOccurrences(int occurrences) {
        this.occurrences = occurrences;
    }

    @Override
    public boolean equals(Object object) {
        boolean result = false;
        if (object != null && object.getClass() == this.getClass()) {
            result = name.equalsIgnoreCase(((Category) object).name);
        }
        return result;
    }

    public String toString() {
        return name + " (" + Integer.toString(occurrences) + ")";
    }
}
