package com.autofleet.autofleet_ai.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateAIPredictionDTO(
        @NotNull(message = "ID-ul maSinii este obligatoriu") Long vehicleId,
        @NotBlank(message = "Componenta prezisa este obligatorie") String predictedComponent,
        @NotBlank(message = "Urgenta (HIGH, MEDIUM, LOW) este obligatorie") String urgency,
        @NotBlank(message = "Rationamentul este obligatoriu") String reasoning,

        @NotNull(message = "Probabilitatea este obligatorie")
        @Min(value = 0, message = "Probabilitatea minima este 0")
        @Max(value = 100, message = "Probabilitatea maxima este 100") Integer failureProbability
) {}