package com.autofleet.autofleet_ai.service;

import com.autofleet.autofleet_ai.dto.AIPredictionDTO;
import com.autofleet.autofleet_ai.dto.MaintenanceRecordDTO;
import com.autofleet.autofleet_ai.dto.VehicleResponseDTO;
import com.autofleet.autofleet_ai.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component // spring creeza un obiect din clasa asta ca sa-l poata injecta in Service
public class VehicleMapper {

    public VehicleResponseDTO toDto(Vehicle vehicle) {

        // variabile temporare pentru datele specifice
        Integer batteryCapacity = null;
        Integer maxRange = null;
        Integer displacement = null;
        Integer cylinders = null;
        String fuelType = null;
        Integer hydrogenTankCapacity = null;
        String vehicleType = "UNKNOWN";
        String engineSummary = "Unknown Engine";


        switch (vehicle) {
            case ElectricVehicle e -> {
                vehicleType = "ELECTRIC";
                batteryCapacity = e.getBatteryCapacity();
                maxRange = e.getMaxRange();
                engineSummary = (batteryCapacity != null ? batteryCapacity + " kWh " : "") + "Electric";
            }
            case HybridVehicle h -> {
                vehicleType = "HYBRID";
                displacement = h.getDisplacement();
                cylinders = h.getCylinders();
                batteryCapacity = h.getBatteryCapacity();
                engineSummary = (displacement != null ? String.format("%.1fL ", displacement / 1000.0) : "") +
                        (cylinders != null ? cylinders + "-Cylinder " : "") + "Hybrid";
            }
            case ThermalVehicle t -> {
                vehicleType = "THERMAL";
                displacement = t.getDisplacement();
                cylinders = t.getCylinders();
                fuelType = t.getFuelType();
                engineSummary = (displacement != null ? String.format("%.1fL ", displacement / 1000.0) : "") +
                        (cylinders != null ? cylinders + "-Cylinder " : "") +
                        (fuelType != null ? fuelType : "Thermal");
            }
            case HydrogenVehicle h -> {
                vehicleType = "HYDROGEN";
                hydrogenTankCapacity = h.getHydrogenTankCapacity();
                engineSummary = (hydrogenTankCapacity != null ? hydrogenTankCapacity + "L " : "") + "Hydrogen";
            }
            default -> {}
        }

        // construim  DTO final
        return new VehicleResponseDTO(
                vehicle.getId(),
                vehicle.getManufacturer(),
                vehicle.getModel(),
                vehicle.getLicensePlate(),
                vehicle.getMileage(),
                vehicle.getStatus() != null ? vehicle.getStatus().name() : null,
                vehicle.getHealthScore(),
                vehicle.getVin(),
                vehicle.getHorsePower(),
                vehicleType,
                batteryCapacity,
                maxRange,
                displacement,
                cylinders,
                fuelType,
                hydrogenTankCapacity,
                engineSummary,
                getLatestPredictionDto(vehicle.getAiPredictions()),
                mapMaintenanceHistory(vehicle.getMaintenanceHistory())
        );
    }

    // functie ce extrage doar ultima predictie
    private AIPredictionDTO getLatestPredictionDto(List<AIPrediction> predictions) {
        if (predictions == null || predictions.isEmpty()) {
            return null;
        }
        AIPrediction latest = predictions.get(0);
        return new AIPredictionDTO(
                latest.getId(),
                latest.getPredictedComponent(),
                latest.getUrgency(),
                latest.getReasoning(),
                latest.getFailureProbability(),
                latest.getCreatedAt()
        );
    }

    // functie care transforma lista de entitati de mentenanta in DTO-uri
    private List<MaintenanceRecordDTO> mapMaintenanceHistory(List<MaintenanceRecord> records) {
        if (records == null || records.isEmpty()) {
            return List.of();
        }
        return records.stream()
                .map(r -> new MaintenanceRecordDTO(
                        r.getId(),
                        r.getServiceDate(),
                        r.getDescription(),
                        r.getCost()
                ))
                .collect(Collectors.toList());
    }

    //  DTO-ul in entitate noua
    public Vehicle toEntity(com.autofleet.autofleet_ai.dto.CreateVehicleDTO dto) {
        if (dto == null) {
            return null;
        }

        Vehicle vehicle;

        switch (dto.engineType().toUpperCase()) {
            case "ELECTRIC" -> {
                ElectricVehicle ev = new ElectricVehicle();
                ev.setBatteryCapacity(dto.batteryCapacity());
                ev.setMaxRange(dto.maxRange());
                vehicle = ev;
            }
            case "HYBRID" -> {
                HybridVehicle hv = new HybridVehicle();
                hv.setDisplacement(dto.displacement());
                hv.setCylinders(dto.cylinders());
                hv.setBatteryCapacity(dto.batteryCapacity());
                vehicle = hv;
            }
            case "THERMAL" -> {
                ThermalVehicle tv = new ThermalVehicle();
                tv.setDisplacement(dto.displacement());
                tv.setCylinders(dto.cylinders());
                tv.setFuelType(dto.fuelType());
                vehicle = tv;
            }
            case "HYDROGEN" -> {
                HydrogenVehicle hv = new HydrogenVehicle();
                hv.setHydrogenTankCapacity(dto.hydrogenTankCapacity());
                vehicle = hv;
            }
            default -> throw new IllegalArgumentException("Tip de motor necunoscut: " + dto.engineType());
        }

        // setam datele comune pe care le au toate masinile
        vehicle.setManufacturer(dto.manufacturer());
        vehicle.setModel(dto.model());
        vehicle.setLicensePlate(dto.licensePlate());
        vehicle.setMileage(dto.mileage());
        vehicle.setHorsePower(dto.horsePower());
        vehicle.setStatus(VehicleStatus.OK);
        vehicle.setHealthScore(100);
        vehicle.setVin("AUTO" + System.currentTimeMillis() + "FLT");

        return vehicle;
    }
}