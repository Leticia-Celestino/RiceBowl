package com.ricebowl.api;

import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ricebowl.api.domain.auth.AuthSessionRepository;
import com.ricebowl.api.domain.user.UserRepository;
import jakarta.servlet.http.Cookie;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AuthenticationSecurityIntegrationTest {
    private static final String PASSWORD = "test-pass-123";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthSessionRepository sessionRepository;


    @Test
    void mutationsRequireCsrfIncludingLoginAndRegistration() throws Exception {
        mvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentialsPayload(unique("csrf"), uniqueEmail("csrf"))))
                .andExpect(status().isForbidden());

        mvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload(uniqueEmail("missing"), PASSWORD)))
                .andExpect(status().isForbidden());
    }

    @Test
    void loginOnlyReturnsUserAndStoresOpaqueCredentialInHttpOnlyCookie() throws Exception {
        var email = uniqueEmail("cookie");
        register(unique("cookie"), email, "198.51.100.10");

        mvc.perform(post("/auth/login")
                        .with(csrf())
                        .with(request -> { request.setRemoteAddr("198.51.100.10"); return request; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload(email.toUpperCase(), PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value(email))
                .andExpect(jsonPath("$.token").doesNotExist())
                .andExpect(cookie().httpOnly("ricebowl_session", true))
                .andExpect(cookie().value("ricebowl_session", not("")));
    }

    @Test
    void logoutRevokesServerSideSessionEvenIfCookieWasCopied() throws Exception {
        var email = uniqueEmail("revoke");
        register(unique("revoke"), email, "198.51.100.11");
        var copiedSession = login(email, "198.51.100.11");

        mvc.perform(get("/users/me").cookie(copiedSession))
                .andExpect(status().isOk());

        mvc.perform(post("/auth/logout").with(csrf()).cookie(copiedSession))
                .andExpect(status().isNoContent())
                .andExpect(cookie().maxAge("ricebowl_session", 0));

        mvc.perform(get("/users/me").cookie(copiedSession))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void expiredSessionIsRejected() throws Exception {
        var email = uniqueEmail("expired");
        register(unique("expired"), email, "198.51.100.12");
        var sessionCookie = login(email, "198.51.100.12");
        var user = userRepository.findUserByEmailIgnoreCase(email).orElseThrow();
        var session = sessionRepository.findAll().stream()
                .filter(candidate -> candidate.getUser().getId().equals(user.getId()))
                .findFirst()
                .orElseThrow();
        session.setExpiresAt(Instant.now().minusSeconds(1));
        sessionRepository.saveAndFlush(session);

        mvc.perform(get("/users/me").cookie(sessionCookie))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginIsThrottledByAccountWithoutDisclosingWhetherItExists() throws Exception {
        var email = uniqueEmail("bruteforce");
        register(unique("bruteforce"), email, "198.51.100.13");

        for (int attempt = 0; attempt < 10; attempt++) {
            mvc.perform(post("/auth/login")
                            .with(csrf())
                            .with(request -> { request.setRemoteAddr("198.51.100.13"); return request; })
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(loginPayload(email, "wrong-password")))
                    .andExpect(status().isUnauthorized());
        }

        mvc.perform(post("/auth/login")
                        .with(csrf())
                        .with(request -> { request.setRemoteAddr("198.51.100.13"); return request; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload(email, "wrong-password")))
                .andExpect(status().isTooManyRequests());
    }

    @Test
    void accountCreationAndRecoveryResponsesDoNotEnumerateAccounts() throws Exception {
        var email = uniqueEmail("enumeration");
        var nickname = unique("enumeration");
        register(nickname, email, "198.51.100.14");

        mvc.perform(post("/auth/register")
                        .with(csrf())
                        .with(request -> { request.setRemoteAddr("198.51.100.15"); return request; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentialsPayload(nickname, email.toUpperCase())))
                .andExpect(status().isAccepted());

        for (String candidate : new String[] { email, uniqueEmail("unknown") }) {
            mvc.perform(post("/auth/forgot-password")
                            .with(csrf())
                            .with(request -> { request.setRemoteAddr("198.51.100.16"); return request; })
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"email\":\"%s\"}".formatted(candidate)))
                    .andExpect(status().isAccepted());
        }
    }

    private void register(String nickname, String email, String address) throws Exception {
        mvc.perform(post("/auth/register")
                        .with(csrf())
                        .with(request -> { request.setRemoteAddr(address); return request; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentialsPayload(nickname, email)))
                .andExpect(status().isAccepted());
    }

    private Cookie login(String email, String address) throws Exception {
        return mvc.perform(post("/auth/login")
                        .with(csrf())
                        .with(request -> { request.setRemoteAddr(address); return request; })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload(email, PASSWORD)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getCookie("ricebowl_session");
    }

    private String credentialsPayload(String nickname, String email) {
        return "{\"nickname\":\"%s\",\"email\":\"%s\",\"password\":\"%s\"}"
                .formatted(nickname, email, PASSWORD);
    }

    private String loginPayload(String email, String password) {
        return "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password);
    }

    private String unique(String prefix) {
        return prefix + UUID.randomUUID().toString().replace("-", "").substring(0, 10);
    }

    private String uniqueEmail(String prefix) {
        return unique(prefix) + "@example.test";
    }
}
