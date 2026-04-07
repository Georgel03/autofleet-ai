package com.autofleet.autofleet_ai.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "hydrogen_vehicles")
@Getter
@Setter
@NoArgsConstructor
public class HydrogenVehicle extends Vehicle{

    private Integer hydrogenTankCapacity;

}
