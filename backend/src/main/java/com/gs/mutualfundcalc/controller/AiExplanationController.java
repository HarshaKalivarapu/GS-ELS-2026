package com.gs.mutualfundcalc.controller;

import com.gs.mutualfundcalc.dto.ai.PortfolioExplanationRequest;
import com.gs.mutualfundcalc.dto.ai.PortfolioExplanationResponse;
import com.gs.mutualfundcalc.service.AiExplanationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiExplanationController {

    private final AiExplanationService aiExplanationService;

    public AiExplanationController(AiExplanationService aiExplanationService) {
        this.aiExplanationService = aiExplanationService;
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("ai controller alive");
    }

    @PostMapping("/portfolio-explanation")
    public ResponseEntity<?> explainPortfolio(
            @RequestBody PortfolioExplanationRequest request
    ) {
        try {
            PortfolioExplanationResponse response =
                    aiExplanationService.generatePortfolioExplanation(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(
                    new ErrorResponse("AI explanation failed", e.getMessage())
            );
        }
    }

    public static class ErrorResponse {
        private final String error;
        private final String message;

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }

        public String getError() {
            return error;
        }

        public String getMessage() {
            return message;
        }
    }
}