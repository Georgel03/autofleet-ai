package com.autofleet.autofleet_ai.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_predictions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Builder
public class AIPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String predictedComponent; // ex: Timing Belt Replacement

    private String urgency; // HIGH, MEDIUM, LOW

    @Column(columnDefinition = "TEXT")
    private String reasoning; // explicatia generata de AI (Reasoning Engine)

    private Integer failureProbability; // Procentul (ex: 74%)

    // Data la care a fost generată predicția
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY) // eficienta: nu incarcam masina de fiecare data
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}