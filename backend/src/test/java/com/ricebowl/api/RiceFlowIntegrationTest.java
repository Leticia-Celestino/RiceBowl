package com.ricebowl.api;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class RiceFlowIntegrationTest {
    @Autowired
    private MockMvc mvc;

    @Test
    void publicationRemainsDraftUntilBothFilesAndEnforcesOwnership() throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String authorEmail = "author-" + suffix + "@example.test";
        String otherEmail = "other-" + suffix + "@example.test";
        register("author" + suffix, authorEmail);
        register("other" + suffix, otherEmail);
        String authorToken = login(authorEmail);
        String otherToken = login(otherEmail);

        mvc.perform(post("/rices")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ricePayload()))
                .andExpect(status().isUnauthorized());

        String created = mvc.perform(post("/rices")
                        .header("Authorization", bearer(authorToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(ricePayload()))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String riceId = JsonPath.read(created, "$.id");

        mvc.perform(get("/rices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].id", not(hasItem(riceId))));

        byte[] png = {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00};
        var cover = new MockMultipartFile("file", "cover.png", "image/png", png);
        mvc.perform(multipart(HttpMethod.PATCH, "/rices/{id}/cover", riceId)
                        .file(cover)
                        .header("Authorization", bearer(authorToken)))
                .andExpect(status().isOk());

        mvc.perform(get("/rices"))
                .andExpect(jsonPath("$.content[*].id", not(hasItem(riceId))));

        var config = new MockMultipartFile(
                "file", "dotfiles.zip", "application/zip", safeZip());
        mvc.perform(multipart(HttpMethod.PATCH, "/rices/{id}/config", riceId)
                        .file(config)
                        .header("Authorization", bearer(authorToken)))
                .andExpect(status().isOk());

        mvc.perform(get("/rices"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].id", hasItem(riceId)));

        mvc.perform(delete("/rices/{id}", riceId)
                        .header("Authorization", bearer(otherToken)))
                .andExpect(status().isForbidden());

        mvc.perform(delete("/rices/{id}", riceId)
                        .header("Authorization", bearer(authorToken)))
                .andExpect(status().isNoContent());

        mvc.perform(get("/rices/{id}", riceId))
                .andExpect(status().isNotFound());
    }

    private void register(String nickname, String email) throws Exception {
        mvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nickname":"%s","email":"%s","password":"test-pass-123"}
                                """.formatted(nickname, email)))
                .andExpect(status().isOk());
    }

    private String login(String email) throws Exception {
        String response = mvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"test-pass-123"}
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.token");
    }

    private String ricePayload() {
        return """
                {"title":"Integration rice","description":"Safe test",\
                 "distro":"Arch Linux","windowManager":"Hyprland","tags":["integration"]}
                """;
    }

    private byte[] safeZip() throws Exception {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        try (ZipOutputStream zip = new ZipOutputStream(output)) {
            zip.putNextEntry(new ZipEntry("config/hypr.conf"));
            zip.write("monitor=preferred".getBytes(StandardCharsets.UTF_8));
            zip.closeEntry();
        }
        return output.toByteArray();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
