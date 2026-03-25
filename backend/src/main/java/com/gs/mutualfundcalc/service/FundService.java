package com.gs.mutualfundcalc.service;

import com.gs.mutualfundcalc.dto.FundDto;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FundService {

    // Curated list of popular mutual funds and ETFs.
    // Expense ratios and categories are stable public data that rarely changes.
    private static final List<FundDto> FUNDS = List.of(
        // S&P 500 index funds
        new FundDto("vfiax",  "Vanguard 500 Index Fund Admiral",           "VFIAX",  0.0004, "Equity"),
        new FundDto("fxaix",  "Fidelity 500 Index Fund",                   "FXAIX",  0.0015, "Equity"),
        new FundDto("swppx",  "Schwab S&P 500 Index Fund",                 "SWPPX",  0.0002, "Equity"),
        new FundDto("spy",    "SPDR S&P 500 ETF Trust",                    "SPY",    0.0095, "Equity"),
        new FundDto("ivv",    "iShares Core S&P 500 ETF",                  "IVV",    0.0003, "Equity"),
        new FundDto("voo",    "Vanguard S&P 500 ETF",                      "VOO",    0.0003, "Equity"),

        // Total market
        new FundDto("vtsax",  "Vanguard Total Stock Market Index Admiral", "VTSAX",  0.0004, "Equity"),
        new FundDto("fskax",  "Fidelity Total Market Index Fund",          "FSKAX",  0.0015, "Equity"),
        new FundDto("vti",    "Vanguard Total Stock Market ETF",           "VTI",    0.0003, "Equity"),

        // Growth
        new FundDto("agthx",  "American Funds Growth Fund of America",     "AGTHX",  0.0064, "Equity"),
        new FundDto("fcntx",  "Fidelity Contrafund",                       "FCNTX",  0.0039, "Equity"),
        new FundDto("qqqm",   "Invesco Nasdaq 100 ETF",                    "QQQM",   0.0015, "Equity"),

        // Bonds / Fixed income
        new FundDto("vbtlx",  "Vanguard Total Bond Market Index Admiral",  "VBTLX",  0.0005, "Fixed Income"),
        new FundDto("bnd",    "Vanguard Total Bond Market ETF",            "BND",    0.0003, "Fixed Income"),
        new FundDto("agg",    "iShares Core U.S. Aggregate Bond ETF",      "AGG",    0.0003, "Fixed Income"),

        // Balanced
        new FundDto("vbiax",  "Vanguard Balanced Index Fund Admiral",      "VBIAX",  0.0007, "Balanced"),

        // International
        new FundDto("vtiax",  "Vanguard Total International Stock Index",  "VTIAX",  0.0011, "International"),
        new FundDto("vxus",   "Vanguard Total International Stock ETF",    "VXUS",   0.0007, "International")
    );

    // Quick lookup: lowercase ticker id → FundDto
    private static final Map<String, FundDto> BY_ID = FUNDS.stream()
            .collect(Collectors.toMap(FundDto::id, f -> f));

    private final MarketDataService marketDataService;

    public FundService(MarketDataService marketDataService) {
        this.marketDataService = marketDataService;
    }

    public List<FundDto> listAll() {
        return FUNDS;
    }

    /**
     * Returns a fund by ticker id (case-insensitive).
     * Checks the curated list first; if not found, falls back to Yahoo Finance
     * to look up the name and type for any valid ticker.
     */
    public FundDto getById(String id) {
        String key = id.toLowerCase();
        FundDto fund = BY_ID.get(key);
        if (fund != null) return fund;

        // Not in the curated list — ask Yahoo Finance for name, category, and expense ratio
        MarketDataService.FundInfo info = marketDataService.fetchFundInfo(id.toUpperCase());
        return new FundDto(key, info.name(), id.toUpperCase(), info.expenseRatio(), info.category());
    }
}
