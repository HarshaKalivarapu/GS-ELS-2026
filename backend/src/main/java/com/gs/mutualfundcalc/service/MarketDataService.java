package com.gs.mutualfundcalc.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.CookieManager;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class MarketDataService {

    private static final String BASE_URL    = "https://query1.finance.yahoo.com/v8/finance/chart/";
    private static final String SUMMARY_URL = "https://query2.finance.yahoo.com/v10/finance/quoteSummary/";
    private static final String CRUMB_URL   = "https://query1.finance.yahoo.com/v1/test/getcrumb";
    private static final String MARKET_TICKER = "%5EGSPC";
    private static final double FALLBACK_BETA   = 1.0;
    private static final double FALLBACK_RETURN = 0.08;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    // Java's HttpClient handles cookies automatically — needed for crumb auth
    private final HttpClient httpClient = HttpClient.newBuilder()
            .cookieHandler(new CookieManager())
            .build();

    // Crumb is valid for a session; cache in memory after first fetch
    private volatile String cachedCrumb = null;

    // ── Public methods ─────────────────────────────────────────────────────────

    @Cacheable("beta")
    public double fetchBeta(String ticker) {
        try {
            List<Double> fundReturns   = fetchMonthlyReturns(ticker);
            List<Double> marketReturns = fetchMonthlyReturns(MARKET_TICKER);

            int n = Math.min(fundReturns.size(), marketReturns.size());
            if (n < 3) return FALLBACK_BETA;

            List<Double> f = fundReturns.subList(0, n);
            List<Double> m = marketReturns.subList(0, n);

            double meanF = f.stream().mapToDouble(d -> d).average().orElse(0);
            double meanM = m.stream().mapToDouble(d -> d).average().orElse(0);

            double cov = 0, varM = 0;
            for (int i = 0; i < n; i++) {
                cov  += (f.get(i) - meanF) * (m.get(i) - meanM);
                varM += Math.pow(m.get(i) - meanM, 2);
            }

            if (varM == 0) return FALLBACK_BETA;
            double beta = cov / varM;
            return Double.isFinite(beta) ? beta : FALLBACK_BETA;
        } catch (Exception e) {
            return FALLBACK_BETA;
        }
    }

    @Cacheable("annualReturn")
    public double fetchAnnualReturn(String ticker) {
        try {
            List<Double> prices = fetchAdjClosePrices(ticker);
            if (prices.size() < 2) return FALLBACK_RETURN;

            double first = prices.get(0);
            double last  = prices.get(prices.size() - 1);
            if (first <= 0) return FALLBACK_RETURN;

            double years        = prices.size() / 12.0;
            double annualReturn = Math.pow(last / first, 1.0 / years) - 1;
            return Double.isFinite(annualReturn) ? annualReturn : FALLBACK_RETURN;
        } catch (Exception e) {
            return FALLBACK_RETURN;
        }
    }

    @Cacheable("volatility")
    public double fetchAnnualVolatility(String ticker) {
        try {
            List<Double> returns = fetchMonthlyReturns(ticker);
            if (returns.size() < 2) return 0.15;

            double mean     = returns.stream().mapToDouble(d -> d).average().orElse(0);
            double variance = returns.stream().mapToDouble(r -> Math.pow(r - mean, 2)).average().orElse(0);

            double annualVolatility = Math.sqrt(variance) * Math.sqrt(12);
            return Double.isFinite(annualVolatility) ? annualVolatility : 0.15;
        } catch (Exception e) {
            return 0.15;
        }
    }

    /**
     * Fetches fund name, category, and expense ratio for any ticker.
     * - Name and category come from the chart API meta (no auth required).
     * - Expense ratio comes from quoteSummary via crumb auth (funds/ETFs only).
     * Result is cached per ticker.
     */
    @Cacheable("fundInfo")
    public FundInfo fetchFundInfo(String ticker) {
        String name        = ticker.toUpperCase();
        String category    = "Equity";
        double expenseRatio = 0.0;

        try {
            // Step 1: get name + category from chart meta (no crumb needed)
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36");
            headers.set("Accept", "application/json");

            String chartBody = restTemplate
                    .exchange(BASE_URL + ticker + "?interval=1d&range=1d", HttpMethod.GET, new HttpEntity<>(headers), String.class)
                    .getBody();

            JsonNode meta = mapper.readTree(chartBody).path("chart").path("result").get(0).path("meta");
            name     = meta.path("longName").asText(meta.path("shortName").asText(ticker.toUpperCase()));
            category = mapInstrumentType(meta.path("instrumentType").asText("EQUITY"));
        } catch (Exception ignored) {}

        try {
            // Step 2: get expense ratio from quoteSummary (requires crumb auth)
            String crumb = getOrFetchCrumb();
            String url   = SUMMARY_URL + ticker + "?modules=fundProfile&crumb="
                         + URLEncoder.encode(crumb, StandardCharsets.UTF_8);

            HttpRequest req = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
                    .header("Accept", "application/json")
                    .GET().build();

            String summaryBody = httpClient.send(req, HttpResponse.BodyHandlers.ofString()).body();

            JsonNode fees = mapper.readTree(summaryBody)
                    .path("quoteSummary").path("result").get(0)
                    .path("fundProfile").path("feesExpensesInvestment");

            JsonNode ratioNode = fees.path("annualReportExpenseRatio");
            if (ratioNode.isMissingNode()) ratioNode = fees.path("netExpRatio");
            if (!ratioNode.isMissingNode()) expenseRatio = ratioNode.path("raw").asDouble(0.0);
        } catch (Exception ignored) { /* stocks won't have fundProfile — leave at 0.0 */ }

        return new FundInfo(name, category, expenseRatio);
    }

    public record FundInfo(String name, String category, double expenseRatio) {}

    // ── Private helpers ────────────────────────────────────────────────────────

    /**
     * Yahoo Finance crumb auth:
     * 1. Visit finance.yahoo.com to receive a session cookie (A3).
     * 2. Call /v1/test/getcrumb with that cookie → returns a crumb string.
     * 3. Append ?crumb=<value> to quoteSummary requests.
     * The crumb is valid for the session lifetime; we cache it in memory.
     */
    private String getOrFetchCrumb() throws Exception {
        if (cachedCrumb != null) return cachedCrumb;

        // Prime the cookie jar — fc.yahoo.com sets the required session cookie
        httpClient.send(
            HttpRequest.newBuilder()
                .uri(URI.create("https://fc.yahoo.com"))
                .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
                .GET().build(),
            HttpResponse.BodyHandlers.discarding()
        );

        // Fetch crumb
        HttpResponse<String> crumbResponse = httpClient.send(
            HttpRequest.newBuilder()
                .uri(URI.create(CRUMB_URL))
                .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
                .GET().build(),
            HttpResponse.BodyHandlers.ofString()
        );

        cachedCrumb = crumbResponse.body();
        return cachedCrumb;
    }

    private String mapInstrumentType(String instrumentType) {
        return switch (instrumentType.toUpperCase()) {
            case "MUTUALFUND" -> "Equity";
            case "ETF"        -> "Equity";
            case "BOND"       -> "Fixed Income";
            case "INDEX"      -> "Equity";
            default           -> "Equity";
        };
    }

    private List<Double> fetchMonthlyReturns(String ticker) throws Exception {
        List<Double> prices  = fetchAdjClosePrices(ticker);
        List<Double> returns = new ArrayList<>();
        for (int i = 1; i < prices.size(); i++) {
            double prev = prices.get(i - 1);
            double curr = prices.get(i);
            if (prev > 0) returns.add((curr - prev) / prev);
        }
        return returns;
    }

    private List<Double> fetchAdjClosePrices(String ticker) throws Exception {
        String url = BASE_URL + ticker + "?interval=1mo&range=2y";

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36");
        headers.set("Accept", "application/json");

        String body = restTemplate
                .exchange(url, HttpMethod.GET, new HttpEntity<>(headers), String.class)
                .getBody();

        JsonNode result = mapper.readTree(body).path("chart").path("result");
        if (result.isMissingNode() || result.isEmpty()) return List.of();

        JsonNode adjCloseArr = result.get(0).path("indicators").path("adjclose");
        JsonNode priceArr = adjCloseArr.isEmpty()
                ? result.get(0).path("indicators").path("quote").get(0).path("close")
                : adjCloseArr.get(0).path("adjclose");

        List<Double> prices = new ArrayList<>();
        for (JsonNode p : priceArr) {
            if (!p.isNull()) prices.add(p.asDouble());
        }
        return prices;
    }
}
