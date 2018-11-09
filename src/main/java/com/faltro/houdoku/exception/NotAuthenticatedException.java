package com.faltro.houdoku.exception;

public class NotAuthenticatedException extends Exception {
    public NotAuthenticatedException() {
        super("The user is not authenticated with the service");
    }
}
