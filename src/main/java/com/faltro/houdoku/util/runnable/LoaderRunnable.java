package com.faltro.houdoku.util.runnable;

import com.faltro.houdoku.util.ContentLoader;

public class LoaderRunnable implements Runnable {
    ContentLoader contentLoader;
    String name;
    boolean running;

    LoaderRunnable(ContentLoader contentLoader, String name) {
        this.contentLoader = contentLoader;
        this.name = name;
        this.running = true;
    }

    @Override
    public void run() {
        finish();
    }

    public void requestStop() {
        this.running = false;
    }

    void finish() {
        contentLoader.getRunnables().remove(this);
    }

    public String getName() {
        return name;
    }
}
