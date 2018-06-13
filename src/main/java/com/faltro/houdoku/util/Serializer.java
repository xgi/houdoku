package com.faltro.houdoku.util;

import com.faltro.houdoku.model.Library;
import com.faltro.houdoku.model.Series;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

public class Serializer {
    public static void serializeLibrary(Library library) {
        Gson gson = new Gson();
        JsonObject jsonRoot = new JsonObject();

        JsonArray jsonSerieses = new JsonArray();
        for (Series series : library.getSerieses()) {
            JsonElement seriesJson = gson.toJsonTree(series);
            jsonSerieses.add(seriesJson);
        }

        jsonRoot.add("library", jsonSerieses);
        jsonRoot.add("categories", gson.toJsonTree(library.getRootCategory()));
        System.out.println(jsonRoot);


//        Series series2 = gson.fromJson(jsonRoot.get("library").getAsJsonArray().get(0), Series.class);
//        System.out.println(series2.category.getColor().getRed());
    }
}
