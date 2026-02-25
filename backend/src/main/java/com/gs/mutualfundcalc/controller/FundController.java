package com.gs.mutualfundcalc.controller;

import com.gs.mutualfundcalc.dto.FundDto;
import com.gs.mutualfundcalc.service.FundService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/funds")
public class FundController {

    private final FundService fundService;

    public FundController(FundService fundService) {
        this.fundService = fundService;
    }

    /**
     * GET /api/funds
     * Returns the full list of available mutual funds.
     */
    @GetMapping
    public List<FundDto> listFunds() {
        return fundService.listAll();
    }

    /**
     * GET /api/funds/{id}
     * Returns a single fund by its internal id (e.g. "fxaix").
     * Returns 404 if not found.
     */
    @GetMapping("/{id}")
    public FundDto getFund(@PathVariable String id) {
        return fundService.getById(id);
    }
}
