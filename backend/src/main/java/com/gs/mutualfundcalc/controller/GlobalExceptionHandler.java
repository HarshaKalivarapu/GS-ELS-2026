package com.gs.mutualfundcalc.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Catches exceptions thrown by any controller and returns clean JSON
 * instead of Spring's default HTML error page.
 *
 * Example response: { "error": "Bad Request", "message": "At least one ticker required" }
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 400 — caller sent invalid input
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleBadRequest(IllegalArgumentException ex) {
        return Map.of("error", "Bad Request", "message", ex.getMessage());
    }

    // 404 — resource not found (e.g. unknown fund id)
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> handleNotFound(RuntimeException ex) {
        return Map.of("error", "Not Found", "message", ex.getMessage());
    }

    // 500 — unexpected server error
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, String> handleServerError(Exception ex) {
        return Map.of("error", "Internal Server Error", "message", ex.getMessage());
    }
}
