package com.faltro.houdoku.model;

import com.faltro.houdoku.plugins.MangaDex;
import com.faltro.houdoku.util.Serializer;
import javafx.scene.paint.Color;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;

public class Library {
    private ArrayList<Series> serieses;
    private Category rootCategory;

    public Library() {
        this.rootCategory = new Category("All Series");
        Category category1 = new Category("Action");
        Category category2 = new Category("Psychological");
        Category category3 = new Category("Fantasy", Color.RED);
        Category category4 = new Category("Mystery");
        Category category5 = new Category("Thriller", Color.GREEN);
        Category category6 = new Category("Romance");

        category1.addSubcategory(category2);
        category1.addSubcategory(category5);
        this.rootCategory.addSubcategory(category1);
        this.rootCategory.addSubcategory(category3);
        this.rootCategory.addSubcategory(category4);
        this.rootCategory.addSubcategory(category6);

        this.serieses = new ArrayList<>();
        MangaDex mangaDex = new MangaDex();
        try {
            serieses.addAll(Arrays.asList(
                    mangaDex.series("/manga/2334"),
                    mangaDex.series("/manga/17274")
//                    mangaDex.series("/manga/7420"),
//                    mangaDex.series("/manga/21827"),
//                    mangaDex.series("/manga/429")
            ));
        } catch (IOException e) {
            e.printStackTrace();
        }

        Serializer.serializeLibrary(this);
    }

    public void calculateCategoryOccurrences() {
        // The maximum height of the tree is strictly set to 3, including the
        // required "All Series" root.
        // The occurrences for a category is incremented even if it is not
        // explicitly present in a series' categories, but one of its
        // subcategories is.

        // create a flat ArrayList of non-unique categories present in series'
        ArrayList<Category> found_categories = new ArrayList();
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

    public ArrayList<Series> getSerieses() {
        return serieses;
    }

    public Category getRootCategory() {
        return rootCategory;
    }
}
