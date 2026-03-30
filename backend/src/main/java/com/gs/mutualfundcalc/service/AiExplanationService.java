package com.gs.mutualfundcalc.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gs.mutualfundcalc.dto.ai.PortfolioExplanationRequest;
import com.gs.mutualfundcalc.dto.ai.PortfolioExplanationResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.UUID;

@Service
public class AiExplanationService {

    private final String openAiApiKey;
    private final String model;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiExplanationService(
            @Value("${openai.api.key}") String openAiApiKey,
            @Value("${openai.model}") String model
    ) {
        this.openAiApiKey = openAiApiKey;
        this.model = model;
    }

    public PortfolioExplanationResponse generatePortfolioExplanation(
            PortfolioExplanationRequest request
    ) throws IOException, InterruptedException {
        String prompt = buildPrompt(request);

        String responseFormatSchema = """
        {
          "type": "json_schema",
          "name": "portfolio_explanation",
          "schema": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
              "summary": { "type": "string" },
              "riskExplanation": { "type": "string" },
              "tickerExplanation": { "type": "string" },
              "tradeoffs": {
                "type": "array",
                "items": { "type": "string" }
              }
            },
            "required": ["summary", "riskExplanation", "tickerExplanation", "tradeoffs"]
          }
        }
        """;

        String body = objectMapper.writeValueAsString(
                objectMapper.createObjectNode()
                        .put("model", model)
                        .put("input", prompt)
                        .set("text",
                                objectMapper.createObjectNode()
                                        .set("format", objectMapper.readTree(responseFormatSchema))
                        )
        );

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/responses"))
                .header("Authorization", "Bearer " + openAiApiKey)
                .header("Content-Type", "application/json")
                .header("X-Client-Request-Id", UUID.randomUUID().toString())
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpClient client = HttpClient.newHttpClient();
        HttpResponse<String> httpResponse = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());

        if (httpResponse.statusCode() >= 300) {
            throw new RuntimeException("OpenAI error: " + httpResponse.body());
        }

        JsonNode root = objectMapper.readTree(httpResponse.body());

        JsonNode textNode = null;
        JsonNode output = root.path("output");

        if (output.isArray()) {
            for (JsonNode item : output) {
                if ("message".equals(item.path("type").asText())) {
                    JsonNode content = item.path("content");

                    if (content.isArray() && !content.isEmpty()) {
                        textNode = content.get(0).path("text");
                        break;
                    }
                }
            }
        }

        if (textNode == null || textNode.isMissingNode() || textNode.isNull()) {
            throw new RuntimeException("No explanation text returned from OpenAI: " + httpResponse.body());
        }

        return objectMapper.readValue(textNode.asText(), PortfolioExplanationResponse.class);
    }

    private String buildPrompt(PortfolioExplanationRequest request) throws IOException {
        String profileJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(request.getProfile());
        String recommendationJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(request.getRecommendation());

        return """
        You are explaining a portfolio recommendation in simple, plain English.

        The app already computed the portfolio. Do not change the numbers, funds, or allocations.
        Only explain them.

        Requirements:
        - Be concise and beginner-friendly.
        - Explain why the portfolio is conservative, moderate, or aggressive.
        - Explain why these tickers were selected.
        - Explain the main tradeoffs in normal language.
        - Do not mention being an AI.
        - Do not give legal, tax, or fiduciary advice.
        - Keep the tone confident and clear.

        User profile:
        %s

        Computed recommendation:
        %s
        """.formatted(profileJson, recommendationJson);
    }
}