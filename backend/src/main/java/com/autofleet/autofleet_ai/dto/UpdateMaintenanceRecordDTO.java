package com.autofleet.autofleet_ai.dto;

import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

public record UpdateMaintenanceRecordDTO(
        LocalDate serviceDate,
        String description,
        @PositiveOrZero(message = "Costul nu poate fi negativ") Double cost
) {}