package com.faltro.houdoku.model;

import com.faltro.houdoku.data.Data;

import java.util.ArrayList;
import java.util.Arrays;

/**
 * A user-specific library of Series'.
 * <p>
 * This class also defines the root category, "All Series", which cannot be
 * altered or removed.
 */
public class Library {
    private final ArrayList<Series> serieses;
    private final Category rootCategory;

    public Library() {
        serieses = new ArrayList<>();

        // add default categories
        rootCategory = new Category("All Series", null);
        Category action = new Category("Action", rootCategory);
        Category adventure = new Category("Adventure", rootCategory);
        Category comedy = new Category("Comedy", rootCategory);
        Category drama = new Category("Drama", rootCategory);
        Category fantasy = new Category("Fantasy", rootCategory);
        Category historical = new Category("Historical", rootCategory);
        Category mystery = new Category("Mystery", rootCategory);
        Category psychological = new Category("Psychological", rootCategory);
        Category romance = new Category("Romance", rootCategory);
        Category scifi = new Category("Sci-Fi", rootCategory);
        Category sliceoflife = new Category("Slice of Life", rootCategory);
        Category supernatural = new Category("Supernatural", rootCategory);

        psychological.addSubcategory(new Category("Horror", psychological));
        fantasy.addSubcategory(new Category("Magic", fantasy));
        scifi.addSubcategory(new Category("Mecha", scifi));

        ArrayList<Category> subcategories = new ArrayList<>(Arrays.asList(
                action, adventure, comedy, drama, fantasy, historical, mystery, psychological,
                romance, scifi, sliceoflife, supernatural));
        rootCategory.setSubcategories(subcategories);

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

    /**
     * Add a Series to the library.
     * <p>
     * This method does not check whether the series already exists in the
     * library.
     *
     * @param series the Series to add
     */
    public void addSeries(Series series) {
        serieses.add(series);
        Data.saveLibrary(this);
    }

    /**
     * Remove a Series from the library.
     * <p>
     * This method also deletes the cached series cover from the filesystem.
     *
     * @param series the Series to remove
     */
    public void removeSeries(Series series) {
        serieses.remove(series);
        Data.deleteCover(series);
        Data.saveLibrary(this);
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
