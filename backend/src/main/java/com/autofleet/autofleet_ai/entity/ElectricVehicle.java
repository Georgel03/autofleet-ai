package com.autofleet.autofleet_ai.entity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Entity
@Table(name = "electric_vehicles")
@Getter @Setter @NoArgsConstructor
public class ElectricVehicle extends Vehicle {
    private Integer batteryCapacity; // kWh
    private Integer maxRange;        // km
}
