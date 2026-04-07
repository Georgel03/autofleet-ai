package com.autofleet.autofleet_ai.controller;

import com.autofleet.autofleet_ai.dto.CreateVehicleDTO;
import com.autofleet.autofleet_ai.dto.UpdateVehicleStatusDTO;
import com.autofleet.autofleet_ai.dto.VehicleResponseDTO;
import com.autofleet.autofleet_ai.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.autofleet.autofleet_ai.dto.FleetStatsDTO;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.autofleet.autofleet_ai.service.ExcelExportService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "http://localhost:5173")
public class VehicleController {

    private final VehicleService vehicleService;

    private final ExcelExportService excelExportService;


    public VehicleController(VehicleService vehicleService, ExcelExportService excelExportService) {
        this.vehicleService = vehicleService;
        this.excelExportService = excelExportService;
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<byte[]> exportVehicleReport(@PathVariable Long id) {
        try {
            byte[] excelContent = excelExportService.generateVehicleReport(id);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            // setam numele fisierului ce va fi descarcat
            headers.setContentDispositionFormData("attachment", "Vehicle_Report_" + id + ".xlsx");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelContent);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // get aducem toata flota de masini
    @GetMapping
    public ResponseEntity<Page<VehicleResponseDTO>> getAllVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir,
            @RequestParam(required = false, defaultValue = "") String keyword) {

        Page<VehicleResponseDTO> vehiclePage = vehicleService.getVehiclesPage(page, size, sortBy, sortDir, keyword);
        return ResponseEntity.ok(vehiclePage);
    }

    @GetMapping("/stats")
    public ResponseEntity<FleetStatsDTO> getFleetStats() {
        FleetStatsDTO stats = vehicleService.getFleetStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponseDTO> getVehicle(@PathVariable Long vehicleId) {
        VehicleResponseDTO vehicleResponseDTO = vehicleService.getVehicle(vehicleId);
        return ResponseEntity.ok(vehicleResponseDTO);
    }

    // post adaugam o masina noua
    // Adnotarea @Valid ii spune lui Spring sa verifice regulile din DTO (@NotBlank, @PositiveOrZero)
    @PostMapping
    public ResponseEntity<VehicleResponseDTO> createVehicle(@Valid @RequestBody CreateVehicleDTO createDTO) {
        VehicleResponseDTO newVehicle = vehicleService.createVehicle(createDTO);
        // Returnam codul HTTP 201 (Created) si masina nou adaugata
        return ResponseEntity.status(HttpStatus.CREATED).body(newVehicle);
    }

    // actualize the status of a vehicle by ID
    @PatchMapping("/{id}/status")
    public ResponseEntity<VehicleResponseDTO> updateVehicleStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateVehicleStatusDTO updateVehicleStatusDTO) {
        VehicleResponseDTO updatedStatusVehicle = vehicleService.updateVehicleStatus(id, updateVehicleStatusDTO.getStatus());
        return ResponseEntity.ok(updatedStatusVehicle);

    }

    // actualizam partial o masina existenta
    @PatchMapping("/{id}")
    public ResponseEntity<VehicleResponseDTO> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody com.autofleet.autofleet_ai.dto.UpdateVehicleDTO updateDTO) {

        VehicleResponseDTO updatedVehicle = vehicleService.updateVehicle(id, updateDTO);
        return ResponseEntity.ok(updatedVehicle);
    }

    // stergem o masina dupa ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        // Returnam 204 (No Content) - inseamna ca stergerea a reusit, dar nu avem date de returnat
        return ResponseEntity.noContent().build();
    }


}