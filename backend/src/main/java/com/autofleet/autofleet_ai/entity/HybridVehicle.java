package com.autofleet.autofleet_ai.entity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Entity
@Table(name = "hybrid_vehicles")
@Getter @Setter @NoArgsConstructor
public class HybridVehicle extends Vehicle {
    private Integer displacement;
    private Integer cylinders;
    private Integer batteryCapacity;
}
