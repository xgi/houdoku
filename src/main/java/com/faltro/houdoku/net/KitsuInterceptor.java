package com.faltro.houdoku.net;

import okhttp3.Interceptor;
import okhttp3.Request;
import okhttp3.Response;
import java.io.IOException;

public class KitsuInterceptor implements Interceptor {
    private String token = null;

    @Override
    public Response intercept(Chain chain) throws IOException {
        Request original_request = chain.request();

        String authorization = "Bearer " + this.token;
        Request request =
                original_request.newBuilder().addHeader("Authorization", authorization).build();

        return chain.proceed(request);
    }

    public void setToken(String token) {
        this.token = token;
    }
}
