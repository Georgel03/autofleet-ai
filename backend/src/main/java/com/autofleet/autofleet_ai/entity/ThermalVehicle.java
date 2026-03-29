package com.autofleet.autofleet_ai.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "thermal_vehicles")
@Getter
@Setter
@NoArgsConstructor
public class ThermalVehicle extends Vehicle {
    private Integer displacement; // cm³
    private Integer cylinders;    // ex: 4
    private String fuelType;      // Diesel/Gasoline
}
