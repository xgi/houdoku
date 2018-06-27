package com.faltro.houdoku.model;

import com.faltro.houdoku.data.Data;

import java.util.ArrayList;
import java.util.Arrays;

public class Library {
    private ArrayList<Series> serieses;
    private Category rootCategory;

    public Library() {
        this.serieses = new ArrayList<>();
        this.rootCategory = new Category("All Series");
    }

    public Library(ArrayList<Series> serieses, Category rootCategory) {
        this.serieses = serieses;
        this.rootCategory = rootCategory;
    }

    /**
     * Recursively update the occurrences field for all categories.
     */
    public void calculateCategoryOccurrences() {
        // create a flat ArrayList of non-unique categories present in series'
        ArrayList<Category> found_categories = new ArrayList<>();
        for (Series series : serieses) {
            for (String stringCategory : series.getStringCategories()) {
                Category found_category = rootCategory.recursiveFindSubcategory(stringCategory);
                // stringCategory is not guaranteed to have a matching Category
                if (found_category != null) {
                    found_categories.add(found_category);
                }
            }
        }

        rootCategory.setOccurrences(serieses.size());
        // The maximum height of the tree is strictly set to 3, including the
        // required "All Series" root
        for (Category c1 : rootCategory.getSubcategories()) {
            c1.setOccurrences((int) found_categories.stream().filter(category ->
                    category.getName().toLowerCase().equals(c1.getName().toLowerCase())
            ).count());
            for (Category c2 : c1.getSubcategories()) {
                c2.setOccurrences((int) found_categories.stream().filter(category ->
                        category.getName().toLowerCase().equals(c2.getName().toLowerCase())
                ).count());
            }
        }
    }

    public void addSeries(Series series) {
        serieses.add(series);
    }

    public void removeSeries(Series series) {
        serieses.remove(series);
        Data.deleteCover(series);
    }

    /**
     * Try to find a series in the library matching the given title.
     * <p>
     * This check is case-insensitive, and also checks the altNames of the
     * series' in the library.
     *
     * @param title the title of the series to check
     * @return the (first) matching series, or null
     */
    public Series find(String title) {
        return serieses.stream().filter(series ->
                series.getTitle().toLowerCase().equals(title.toLowerCase()) ||
                        Arrays.stream(series.altNames).anyMatch(name ->
                            name.toLowerCase().equals(title.toLowerCase())
                        )
        ).findFirst().orElse(null);
    }

    public ArrayList<Series> getSerieses() {
        return serieses;
    }

    public Category getRootCategory() {
        return rootCategory;
    }
}
