package com.autofleet.autofleet_ai.dto;

import java.time.LocalDate;

public record MaintenanceRecordDTO(
        Long id,
        LocalDate serviceDate,
        String description,
        Double cost
) {}