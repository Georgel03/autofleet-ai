package com.autofleet.autofleet_ai.controller;

import com.autofleet.autofleet_ai.dto.CreateVehicleDTO;
import com.autofleet.autofleet_ai.dto.VehicleResponseDTO;
import com.autofleet.autofleet_ai.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "http://localhost:5173") // permite frontendului sa faca requesturi fara erori de CORS
public class VehicleController {

    private final VehicleService vehicleService;

    // Injectam Service-ul pe care tocmai l-am creat
    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    // 1. GET: Aducem toata flota de masini
    @GetMapping
    public ResponseEntity<List<VehicleResponseDTO>> getAllVehicles() {
        List<VehicleResponseDTO> vehicles = vehicleService.getAllVehicles();
        return ResponseEntity.ok(vehicles);
    }

    // 2. POST: Adaugam o masina noua
    // Adnotarea @Valid ii spune lui Spring sa verifice regulile din DTO (@NotBlank, @PositiveOrZero)
    @PostMapping
    public ResponseEntity<VehicleResponseDTO> createVehicle(@Valid @RequestBody CreateVehicleDTO createDTO) {
        VehicleResponseDTO newVehicle = vehicleService.createVehicle(createDTO);
        // Returnam codul HTTP 201 (Created) si masina nou adaugata
        return ResponseEntity.status(HttpStatus.CREATED).body(newVehicle);
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