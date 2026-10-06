package com.ricebowl.api.infra.security;

import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
public class AuthCookieService {
    private final String name;
    private final boolean secure;
    private final String sameSite;
    private final Duration maxAge;

    public AuthCookieService(
            @Value("${api.security.cookie.name:ricebowl_session}") String name,
            @Value("${api.security.cookie.secure:false}") boolean secure,
            @Value("${api.security.cookie.same-site:Lax}") String sameSite,
            @Value("${api.security.token.expiration:PT2H}") Duration maxAge) {
        this.name = name;
        this.secure = secure;
        this.sameSite = sameSite;
        this.maxAge = maxAge;
    }

    public void write(HttpServletResponse response, String token) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie(token, maxAge).toString());
    }

    public void clear(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie("", Duration.ZERO).toString());
    }

    private ResponseCookie cookie(String value, Duration age) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(age)
                .build();
    }
}
