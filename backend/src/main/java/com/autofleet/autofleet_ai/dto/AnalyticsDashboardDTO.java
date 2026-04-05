package com.autofleet.autofleet_ai.dto;

import java.util.List;

public record AnalyticsDashboardDTO(
        List<MonthlyCostDTO> monthlyCosts,
        List<TopVehicleDTO> topVehicles,
        List<PowertrainCostDTO> powertrainCosts
) {
    public record MonthlyCostDTO(String month, Double cost) {}
    public record TopVehicleDTO(String name, Double value) {}
    public record PowertrainCostDTO(String type, Double avgCost) {}
}