package com.gs.mutualfundcalc.service;

import com.gs.mutualfundcalc.dto.FundDto;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FundService {

    // TODO: Replace with external API client (e.g. Yahoo Finance, Alpha Vantage)
    //       when the market data integration is ready (Phase 2).

    /**
     * Returns all available mutual funds.
     * Will be populated from an external API in Phase 2.
     */
    public List<FundDto> listAll() {
        return List.of(); // TODO: fetch from external API
    }

    /**
     * Returns a single fund by internal id.
     * Will look up from external API in Phase 2.
     */
    public FundDto getById(String id) {
        // TODO: fetch from external API and return matching fund
        throw new RuntimeException("Fund not found: " + id);
    }

    /**
     * Returns the fund's default annual return for use as a fallback
     * in calculations when the caller does not supply annualReturn.
     * Will be derived from external API data in Phase 2.
     */
    public double getDefaultReturn(String id) {
        // TODO: derive from external API (e.g. 10-year average return)
        throw new RuntimeException("Fund not found: " + id);
    }
}
