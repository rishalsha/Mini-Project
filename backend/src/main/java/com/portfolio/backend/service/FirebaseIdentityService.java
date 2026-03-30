package com.portfolio.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class FirebaseIdentityService {

    private final RestClient restClient;
    private final String firebaseWebApiKey;

    public FirebaseIdentityService(
            @Value("${firebase.web-api-key:}") String firebaseWebApiKey,
            RestClient.Builder restClientBuilder) {
        this.firebaseWebApiKey = firebaseWebApiKey == null ? "" : firebaseWebApiKey.trim();
        this.restClient = restClientBuilder.baseUrl("https://identitytoolkit.googleapis.com/v1").build();
    }

    public void assertVerifiedIdentity(String idToken, String expectedEmail) {
        if (idToken == null || idToken.isBlank()) {
            throw new IllegalArgumentException("Missing Firebase ID token");
        }
        if (expectedEmail == null || expectedEmail.isBlank()) {
            throw new IllegalArgumentException("Missing email");
        }
        if (firebaseWebApiKey.isBlank()) {
            throw new IllegalStateException("Firebase API key is not configured on backend");
        }

        ResponseEntity<Map> response;
        try {
            response = restClient.post()
                    .uri(uriBuilder -> uriBuilder.path("/accounts:lookup").queryParam("key", firebaseWebApiKey).build())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("idToken", idToken))
                    .retrieve()
                    .toEntity(Map.class);
        } catch (RestClientResponseException ex) {
            throw new IllegalArgumentException("Invalid or expired Firebase token");
        } catch (RestClientException ex) {
            throw new IllegalStateException("Unable to contact Firebase for token verification");
        }

        Map body = response.getBody();
        if (body == null) {
            throw new IllegalArgumentException("Invalid Firebase token");
        }

        Object usersObj = body.get("users");
        if (!(usersObj instanceof List<?> users) || users.isEmpty()) {
            throw new IllegalArgumentException("Invalid Firebase token");
        }

        Object userObj = users.get(0);
        if (!(userObj instanceof Map<?, ?> userMap)) {
            throw new IllegalArgumentException("Invalid Firebase token");
        }

        Object firebaseEmailRaw = userMap.get("email");
        Object emailVerifiedRaw = userMap.get("emailVerified");
        String firebaseEmail = (firebaseEmailRaw == null ? "" : String.valueOf(firebaseEmailRaw)).trim().toLowerCase();
        boolean emailVerified = emailVerifiedRaw != null && Boolean.parseBoolean(String.valueOf(emailVerifiedRaw));
        String normalizedExpectedEmail = expectedEmail.trim().toLowerCase();

        if (!normalizedExpectedEmail.equals(firebaseEmail)) {
            throw new IllegalArgumentException("Firebase token email does not match request email");
        }

        if (!emailVerified) {
            throw new IllegalArgumentException("Firebase email is not verified");
        }
    }
}
