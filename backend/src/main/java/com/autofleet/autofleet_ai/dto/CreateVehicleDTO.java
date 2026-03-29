package com.autofleet.autofleet_ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CreateVehicleDTO(
        @NotBlank(message = "Producatorul este obligatoriu") String manufacturer,
        @NotBlank(message = "Modelul este obligatoriu") String model,
        @NotBlank(message = "Numarul de inmatriculare este obligatoriu") String licensePlate,

        @NotNull(message = "Kilometrajul nu poate fi null")
        @PositiveOrZero(message = "Kilometrajul trebuie sa fie pozitiv") Integer mileage,

        @NotBlank(message = "Tipul motorului (ELECTRIC, HYBRID, THERMAL) este obligatoriu") String engineType,

        Integer horsePower,
        Integer batteryCapacity,
        Integer maxRange,
        Integer displacement,
        Integer cylinders,
        String fuelType
) {}