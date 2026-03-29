package com.autofleet.autofleet_ai.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Inheritance(strategy = InheritanceType.JOINED) // Strategia "Clean Architecture"
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public abstract class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String manufacturer;
    private String model;

    @Column(unique = true, nullable = false)
    private String licensePlate;

    private Integer mileage;

    @Enumerated(EnumType.STRING)
    private VehicleStatus status;

    private Integer healthScore;
    private String vin;
    private Integer horsePower;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL)
    private List<MaintenanceRecord> maintenanceHistory;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC") // baza de date face sortarea pentru noi
    private List<AIPrediction> aiPredictions;
}