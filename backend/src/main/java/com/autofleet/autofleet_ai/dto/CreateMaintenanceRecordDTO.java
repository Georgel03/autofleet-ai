package com.autofleet.autofleet_ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDate;

public record CreateMaintenanceRecordDTO(
        @NotNull(message = "ID-ul maSinii este obligatoriu") Long vehicleId,
        @NotNull(message = "Data de service este obligatorie") LocalDate serviceDate,
        @NotBlank(message = "Descrierea reparaTiei este obligatorie") String description,
        @NotNull(message = "Costul este obligatoriu")
        @PositiveOrZero(message = "Costul nu poate fi negativ") Double cost
) {}