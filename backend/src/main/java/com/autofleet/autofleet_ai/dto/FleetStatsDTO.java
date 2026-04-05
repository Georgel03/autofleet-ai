package com.autofleet.autofleet_ai.dto;

public record FleetStatsDTO(

        Long totalCars,
        Long totalMileage,
        Long criticalCount
) {}