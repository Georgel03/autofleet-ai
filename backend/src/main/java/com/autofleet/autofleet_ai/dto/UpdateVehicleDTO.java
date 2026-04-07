package com.autofleet.autofleet_ai.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record UpdateVehicleDTO(
        String manufacturer,
        String model,
        String licensePlate,
        @PositiveOrZero(message = "Kilometrajul nu poate fi negativ") Integer mileage,

        @NotNull(message = "Anul masinii este obligatoriu")
        @PositiveOrZero(message = "Anul masinii trebuie sa fie pozitiv")
        @Min(value = 1900, message = "Anul masinii nu poate fi mai mic de 1900")
        Integer fabricationYear
) {}