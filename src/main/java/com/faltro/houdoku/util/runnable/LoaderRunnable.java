package com.faltro.houdoku.util.runnable;

import com.faltro.houdoku.util.ContentLoader;

public class LoaderRunnable implements Runnable {
    final ContentLoader contentLoader;
    private final String name;
    boolean running;

    /**
     * A generic Runnable that is run by ContentLoader.
     *
     * @param name          the name of the thread
     * @param contentLoader the ContentLoader which created this instance
     */
    LoaderRunnable(String name, ContentLoader contentLoader) {
        this.name = name;
        this.contentLoader = contentLoader;
        this.running = true;
    }

    @Override
    public void run() {
        finish();
    }

    /**
     * Safely stop the runnable.
     * <p>
     * The {@link #run()} method must make use of the {@link #running} parameter for this method to
     * be useful. If it doesn't, the runnable might not be meaningful enough to stop, anyway.
     */
    public void requestStop() {
        this.running = false;
    }

    /**
     * Called when the {@link #run()} method has finished execution.
     */
    void finish() {
        contentLoader.getRunnables().remove(this);
    }

    public String getName() {
        return name;
    }
}
