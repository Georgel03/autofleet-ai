package com.autofleet.autofleet_ai.dto;

import java.util.List;

public record VehicleResponseDTO(
        // date de baza comune
        Long id,
        String manufacturer,
        String model,
        String licensePlate,
        Integer mileage,
        String status,
        Integer healthScore,
        String vin,
        Integer horsePower,
        String vehicleType, // "ELECTRIC", "HYBRID", "THERMAL"

        // Date specifice (optionale in functie de tip)
        Integer batteryCapacity,
        Integer maxRange,
        Integer displacement,
        Integer cylinders,
        String fuelType,

        // Date agregate pentru UI
        String engineSummary, // ex: "1.8L 4-Cylinder Hybrid"
        AIPredictionDTO latestPrediction,
        List<MaintenanceRecordDTO> maintenanceHistory
) {}