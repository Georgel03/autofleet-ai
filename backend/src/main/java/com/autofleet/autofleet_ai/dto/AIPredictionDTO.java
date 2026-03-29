package com.autofleet.autofleet_ai.dto;

import java.time.LocalDateTime;

public record AIPredictionDTO(
        Long id,
        String predictedComponent,
        String urgency,
        String reasoning,
        Integer failureProbability,
        LocalDateTime createdAt
) {}