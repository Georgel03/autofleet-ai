package com.autofleet.autofleet_ai.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CreateVehicleDTO(
        @NotBlank(message = "Producatorul este obligatoriu") String manufacturer,
        @NotBlank(message = "Modelul este obligatoriu") String model,
        @NotBlank(message = "Numarul de inmatriculare este obligatoriu") String licensePlate,

        @NotNull(message = "Kilometrajul nu poate fi null")
        @PositiveOrZero(message = "Kilometrajul trebuie sa fie pozitiv") Integer mileage,

        @NotNull(message = "Anul masinii este obligatoriu")
        @PositiveOrZero(message = "Anul masinii trebuie sa fie pozitiv")
        @Min(value = 1900, message = "Anul masinii nu poate fi mai mic de 1900")
        Integer fabricationYear,

        @NotBlank(message = "Tipul motorului (ELECTRIC, HYBRID, THERMAL) este obligatoriu") String engineType,



        Integer horsePower,
        Integer batteryCapacity,
        Integer maxRange,
        Integer displacement,
        Integer cylinders,
        String fuelType
) {}