package com.autofleet.autofleet_ai.controller;

import com.autofleet.autofleet_ai.dto.CreateMaintenanceRecordDTO;
import com.autofleet.autofleet_ai.dto.MaintenanceRecordDTO;
import com.autofleet.autofleet_ai.dto.UpdateMaintenanceRecordDTO;
import com.autofleet.autofleet_ai.service.MaintenanceRecordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "http://localhost:5173")
public class MaintenanceRecordController {

    private final MaintenanceRecordService maintenanceService;

    public MaintenanceRecordController(MaintenanceRecordService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    // istoricul doar pentru o anumita masina
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<MaintenanceRecordDTO>> getRecordsByVehicleId(@PathVariable Long vehicleId) {
        List<MaintenanceRecordDTO> records = maintenanceService.getRecordsByVehicleId(vehicleId);
        return ResponseEntity.ok(records);
    }

    @PostMapping
    public ResponseEntity<MaintenanceRecordDTO> createRecord(@Valid @RequestBody CreateMaintenanceRecordDTO createDTO) {
        MaintenanceRecordDTO newRecord = maintenanceService.createRecord(createDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(newRecord);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<MaintenanceRecordDTO> updateRecord(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMaintenanceRecordDTO updateDTO) {
        MaintenanceRecordDTO updatedRecord = maintenanceService.updateRecord(id, updateDTO);
        return ResponseEntity.ok(updatedRecord);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(@PathVariable Long id) {
        maintenanceService.deleteRecord(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/costs/{vehicleId}")
    public ResponseEntity<Double> getTotalCostForCar(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(maintenanceService.getTotalCostByVehicleId(vehicleId));
    }
}