package com.autofleet.autofleet_ai.service;

import com.autofleet.autofleet_ai.dto.CreateMaintenanceRecordDTO;
import com.autofleet.autofleet_ai.dto.MaintenanceRecordDTO;
import com.autofleet.autofleet_ai.entity.MaintenanceRecord;
import com.autofleet.autofleet_ai.entity.Vehicle;
import org.springframework.stereotype.Component;

@Component
public class MaintenanceRecordMapper {

    // parsam entitatea in DTO pentru a o trimite la frontend
    public MaintenanceRecordDTO toDto(MaintenanceRecord record) {
        if (record == null) {
            return null;
        }
        return new MaintenanceRecordDTO(
                record.getId(),
                record.getServiceDate(),
                record.getDescription(),
                record.getCost()
        );
    }

    // parsam DTO-ul primit din formular in entitate/clasa
    public MaintenanceRecord toEntity(CreateMaintenanceRecordDTO dto, Vehicle vehicle) {
        if (dto == null) {
            return null;
        }

        MaintenanceRecord record = new MaintenanceRecord();
        record.setServiceDate(dto.serviceDate());
        record.setDescription(dto.description());
        record.setCost(dto.cost());

        record.setVehicle(vehicle);

        return record;
    }
}