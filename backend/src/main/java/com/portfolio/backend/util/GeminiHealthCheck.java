package com.portfolio.backend.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

/**
 * Standalone utility to test Gemini API health.
 * Reads API key from .env file in the backend directory.
 * 
 * Usage:
 *   mvn exec:java -Dexec.mainClass="com.portfolio.backend.util.GeminiHealthCheck" -q
 */
public class GeminiHealthCheck {

    private static final String GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static void main(String[] args) {
        String apiKey = loadApiKeyFromEnv();
        String model = loadModelFromEnv();

        System.out.println("╔════════════════════════════════════════════════════════════╗");
        System.out.println("║           GEMINI API HEALTH CHECK                          ║");
        System.out.println("╚════════════════════════════════════════════════════════════╝\n");

        if (apiKey == null || apiKey.isEmpty()) {
            System.out.println("❌ ERROR: GEMINI_API_KEY not found in .env file");
            System.out.println("   Please add: GEMINI_API_KEY=your_key_here in .env");
            System.exit(1);
        }

        String maskedKey = maskApiKey(apiKey);
        System.out.println("✓ API Key: " + maskedKey);
        System.out.println("✓ Model: " + model);
        System.out.println();

        testGeminiAPI(apiKey, model);
    }

    private static String loadApiKeyFromEnv() {
        try (BufferedReader reader = new BufferedReader(new FileReader(".env"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith("GEMINI_API_KEY=")) {
                    return line.substring("GEMINI_API_KEY=".length()).trim();
                }
            }
        } catch (IOException e) {
            System.out.println("⚠️  Warning: Could not read .env file");
        }
        return null;
    }

    private static String loadModelFromEnv() {
        try (BufferedReader reader = new BufferedReader(new FileReader(".env"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith("GEMINI_MODEL=")) {
                    return line.substring("GEMINI_MODEL=".length()).trim();
                }
            }
        } catch (IOException e) {
            // Model not in .env, use default
        }
        return "gemini-2.5-flash";
    }

    private static String maskApiKey(String apiKey) {
        if (apiKey == null || apiKey.length() < 5) {
            return "***invalid***";
        }
        String lastFive = apiKey.substring(apiKey.length() - 5);
        int totalLength = apiKey.length();
        return "***" + lastFive + " (length: " + totalLength + ")";
    }

    private static void testGeminiAPI(String apiKey, String model) {
        try {
            ObjectNode requestBody = objectMapper.createObjectNode();
            ArrayNode contentsArray = objectMapper.createArrayNode();
            ObjectNode content = objectMapper.createObjectNode();
            ArrayNode partsArray = objectMapper.createArrayNode();
            ObjectNode part = objectMapper.createObjectNode();
            
            part.put("text", "Say 'Hello from Gemini!'");
            partsArray.add(part);
            content.set("parts", partsArray);
            contentsArray.add(content);
            requestBody.set("contents", contentsArray);

            String url = String.format("%s/%s:generateContent?key=%s", 
                GEMINI_API_BASE, model, apiKey);

            System.out.println("Testing API...\n");
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody.toString()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, 
                    HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                System.out.println("✅ SUCCESS! Gemini API is working.\n");
                
                try {
                    JsonNode responseNode = objectMapper.readTree(response.body());
                    if (responseNode.has("candidates") && responseNode.get("candidates").size() > 0) {
                        JsonNode candidate = responseNode.get("candidates").get(0);
                        if (candidate.has("content") && candidate.get("content").has("parts")) {
                            JsonNode parts = candidate.get("content").get("parts");
                            if (parts.size() > 0 && parts.get(0).has("text")) {
                                String text = parts.get(0).get("text").asText();
                                System.out.println("Response: \"" + text + "\"");
                            }
                        }
                    }
                } catch (Exception e) {
                    System.out.println(response.body());
                }
                
            } else if (response.statusCode() == 401) {
                System.out.println("❌ ERROR 401: Invalid API key\n");
                printError(response.body());
                System.exit(1);
            } else if (response.statusCode() == 403) {
                System.out.println("❌ ERROR 403: API not enabled or forbidden\n");
                printError(response.body());
                System.exit(1);
            } else if (response.statusCode() == 400) {
                System.out.println("❌ ERROR 400: Bad Request\n");
                printError(response.body());
                System.exit(1);
            } else {
                System.out.println("❌ ERROR " + response.statusCode() + "\n");
                System.out.println(response.body());
                System.exit(1);
            }

        } catch (IOException e) {
            System.out.println("❌ Network error: " + e.getMessage());
            System.exit(1);
        } catch (InterruptedException e) {
            System.out.println("❌ Request interrupted: " + e.getMessage());
            Thread.currentThread().interrupt();
            System.exit(1);
        } catch (Exception e) {
            System.out.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static void printError(String responseBody) {
        try {
            JsonNode errorNode = objectMapper.readTree(responseBody);
            if (errorNode.has("error") && errorNode.get("error").has("message")) {
                System.out.println(errorNode.get("error").get("message").asText());
            } else {
                System.out.println(responseBody);
            }
        } catch (Exception e) {
            System.out.println(responseBody);
        }
    }
}
