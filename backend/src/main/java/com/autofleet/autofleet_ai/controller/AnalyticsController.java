package com.autofleet.autofleet_ai.controller;

import com.autofleet.autofleet_ai.dto.AnalyticsDashboardDTO;
import com.autofleet.autofleet_ai.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:5173")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    public ResponseEntity<AnalyticsDashboardDTO> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getDashboardData());
    }
}