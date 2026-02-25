package com.gs.mutualfundcalc.dto;

/**
 * Public representation of a mutual fund — what GET /api/funds returns.
 *
 * id           - our internal identifier, e.g. "fxaix"
 * name         - human-readable name
 * symbol       - external ticker symbol, e.g. "FXAIX"
 * expenseRatio - annual fee as a decimal, e.g. 0.0015 = 0.15%
 * category     - "Equity", "Fixed Income", "Balanced", etc.
 */
public record FundDto(
    String id,
    String name,
    String symbol,
    double expenseRatio,
    String category
) {}
