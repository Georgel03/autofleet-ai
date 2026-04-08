package com.autofleet.autofleet_ai.service;

import com.autofleet.autofleet_ai.dto.CreateMaintenanceRecordDTO;
import com.autofleet.autofleet_ai.dto.MaintenanceRecordDTO;
import com.autofleet.autofleet_ai.dto.UpdateMaintenanceRecordDTO;
import com.autofleet.autofleet_ai.entity.MaintenanceRecord;
import com.autofleet.autofleet_ai.entity.Vehicle;
import com.autofleet.autofleet_ai.exception.BusinessRuleException;
import com.autofleet.autofleet_ai.exception.ResourceNotFoundException;
import com.autofleet.autofleet_ai.repository.MaintenanceRecordRepository;
import com.autofleet.autofleet_ai.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaintenanceRecordService {

    private final MaintenanceRecordRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;
    private final MaintenanceRecordMapper maintenanceMapper;

    public MaintenanceRecordService(
            MaintenanceRecordRepository maintenanceRepository,
            VehicleRepository vehicleRepository,
            MaintenanceRecordMapper maintenanceMapper) {
        this.maintenanceRepository = maintenanceRepository;
        this.vehicleRepository = vehicleRepository;
        this.maintenanceMapper = maintenanceMapper;
    }


    public List<MaintenanceRecordDTO> getRecordsByVehicleId(Long vehicleId) {
        // Verificam intai daca masina exista
        if (!vehicleRepository.existsById(vehicleId)) {
            throw new IllegalArgumentException("Masina cu ID-ul " + vehicleId + " nu a fost gasita!");
        }

        return maintenanceRepository.findByVehicleIdOrderByServiceDateDesc(vehicleId)
                .stream()
                .map(maintenanceMapper::toDto)
                .collect(Collectors.toList());
    }


    @Transactional
    public MaintenanceRecordDTO createRecord(CreateMaintenanceRecordDTO createDTO) {
        // Cautam masina in baza de date folosind ID-ul din DTO
        Vehicle vehicle = vehicleRepository.findById(createDTO.vehicleId())
                .orElseThrow(() -> new BusinessRuleException("Masina cu ID-ul " + createDTO.vehicleId() + " nu exista!"));

        // Transformam si setam relatia
        MaintenanceRecord newRecord = maintenanceMapper.toEntity(createDTO, vehicle);

        MaintenanceRecord savedRecord = maintenanceRepository.save(newRecord);
        return maintenanceMapper.toDto(savedRecord);
    }


    @Transactional
    public MaintenanceRecordDTO updateRecord(Long id, UpdateMaintenanceRecordDTO updateDTO) {
        MaintenanceRecord existingRecord = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inregistrarea de service cu ID-ul " + id + " nu a fost gasita!"));

        if (updateDTO.serviceDate() != null) {
            existingRecord.setServiceDate(updateDTO.serviceDate());
        }
        if (updateDTO.description() != null) {
            existingRecord.setDescription(updateDTO.description());
        }
        if (updateDTO.cost() != null) {
            existingRecord.setCost(updateDTO.cost());
        }

        MaintenanceRecord savedRecord = maintenanceRepository.save(existingRecord);
        return maintenanceMapper.toDto(savedRecord);
    }


    @Transactional
    public void deleteRecord(Long id) {
        if (!maintenanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Inregistrarea de service nu a fost gasita!");
        }
        maintenanceRepository.deleteById(id);
    }
}