package com.autofleet.autofleet_ai.dto;

import com.autofleet.autofleet_ai.entity.VehicleStatus;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class UpdateVehicleStatusDTO {

    @NotNull
    VehicleStatus status;
}
