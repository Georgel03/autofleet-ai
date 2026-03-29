package com.autofleet.autofleet_ai.service;

import com.autofleet.autofleet_ai.dto.CreateMaintenanceRecordDTO;
import com.autofleet.autofleet_ai.dto.MaintenanceRecordDTO;
import com.autofleet.autofleet_ai.entity.MaintenanceRecord;
import com.autofleet.autofleet_ai.entity.Vehicle;
import org.springframework.stereotype.Component;

@Component
public class MaintenanceRecordMapper {

    // Transformam Entitatea in DTO pentru a o trimite la frontend
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

    // Transformam DTO-ul primit din formular in Entitate
    // Observa ca primim si obiectul Vehicle complet, scos de Service din baza de date
    public MaintenanceRecord toEntity(CreateMaintenanceRecordDTO dto, Vehicle vehicle) {
        if (dto == null) {
            return null;
        }

        MaintenanceRecord record = new MaintenanceRecord();
        record.setServiceDate(dto.serviceDate());
        record.setDescription(dto.description());
        record.setCost(dto.cost());

        // Aici facem legatura in baza de date (Foreign Key)
        record.setVehicle(vehicle);

        return record;
    }
}