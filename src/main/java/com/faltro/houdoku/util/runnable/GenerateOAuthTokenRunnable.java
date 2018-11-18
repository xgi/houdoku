package com.faltro.houdoku.util.runnable;

import com.faltro.houdoku.controller.ConfigController;
import com.faltro.houdoku.exception.NotAuthenticatedException;
import com.faltro.houdoku.exception.NotImplementedException;
import com.faltro.houdoku.plugins.tracker.TrackerOAuth;
import com.faltro.houdoku.util.ContentLoader;

import java.io.IOException;

public class GenerateOAuthTokenRunnable extends LoaderRunnable {
    private final TrackerOAuth tracker;
    private final String code;
    private final ConfigController configController;

    /**
     * Runnable for loading a chapter page.
     *
     * @param name             the name of the thread
     * @param contentLoader    the ContentLoader which created this instance
     * @param tracker          the TrackerOAuth to load from
     * @param code             a verification code given by the user after authorization
     * @param configController the ConfigController to update after the token
     *                         is generated
     */
    public GenerateOAuthTokenRunnable(String name, ContentLoader contentLoader,
                                      TrackerOAuth tracker, String code,
                                      ConfigController configController) {
        super(name, contentLoader);
        this.tracker = tracker;
        this.code = code;
        this.configController = configController;
    }

    @Override
    public void run() {
        try {
            tracker.generateToken(code);

            // update the displayed authentication status
            try {
                String text = String.format("You are authenticated as: %s",
                        tracker.authenticatedUserName()
                );
                configController.updateTrackerStatus(
                        tracker.getClass().getField("ID").getInt(null), true, text);
            } catch (NoSuchFieldException | IllegalAccessException | NotAuthenticatedException e) {
                e.printStackTrace();
            }
        } catch (IOException | NotImplementedException e) {
            e.printStackTrace();
        }

        finish();
    }
}
