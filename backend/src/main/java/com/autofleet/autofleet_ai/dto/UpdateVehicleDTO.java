package com.autofleet.autofleet_ai.dto;

import jakarta.validation.constraints.PositiveOrZero;

public record UpdateVehicleDTO(
        String manufacturer,
        String model,
        String licensePlate,

        @PositiveOrZero(message = "Kilometrajul nu poate fi negativ") Integer mileage
) {}