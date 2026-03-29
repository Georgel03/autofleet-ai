package com.autofleet.autofleet_ai.service;

import com.autofleet.autofleet_ai.dto.CreateVehicleDTO;
import com.autofleet.autofleet_ai.dto.VehicleResponseDTO;
import com.autofleet.autofleet_ai.entity.Vehicle;
import com.autofleet.autofleet_ai.repository.VehicleRepository;
import com.autofleet.autofleet_ai.dto.UpdateVehicleDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleMapper vehicleMapper;

    // dependency injection
    public VehicleService(VehicleRepository vehicleRepository, VehicleMapper vehicleMapper) {
        this.vehicleRepository = vehicleRepository;
        this.vehicleMapper = vehicleMapper;
    }

    // aducem toate masinile pentru a le afisa în tabel
    public List<VehicleResponseDTO> getAllVehicles() {
        return vehicleRepository.findAll()
                .stream()
                .map(vehicleMapper::toDto)
                .collect(Collectors.toList());
    }

    // adaugam o masina noua din formularul de pe frontend
    @Transactional
    public VehicleResponseDTO createVehicle(CreateVehicleDTO createDTO) {
        // numarul de inmatriculare trebuie sa fie unic
        if (vehicleRepository.existsByLicensePlate(createDTO.licensePlate())) {
            throw new IllegalArgumentException("O masina cu acest numar de inmatriculare exista deja în sistem!");
        }

        // Transformăm DTO-ul primit din rețea în Entitate de DB
        Vehicle newVehicle = vehicleMapper.toEntity(createDTO);

        // Salvăm în MySQL (Hibernate își dă seama singur dacă o pune în electric_vehicles sau thermal_vehicles)
        Vehicle savedVehicle = vehicleRepository.save(newVehicle);

        // Returnăm înapoi forma curată (DTO) către frontend
        return vehicleMapper.toDto(savedVehicle);
    }

    // modificam o masina existenta
    @Transactional
    public VehicleResponseDTO updateVehicle(Long id, UpdateVehicleDTO updateDTO) {
        // 1. Cautam masina in baza de date
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Masina cu ID-ul " + id + " nu a fost gasita!"));

        // 2. Actualizam doar campurile care au fost trimise (care nu sunt null)
        if (updateDTO.manufacturer() != null) {
            existingVehicle.setManufacturer(updateDTO.manufacturer());
        }

        if (updateDTO.model() != null) {
            existingVehicle.setModel(updateDTO.model());
        }

        if (updateDTO.licensePlate() != null) {
            // Daca vrea sa schimbe numarul, verificam sa nu existe deja pe ALTA masina
            if (!existingVehicle.getLicensePlate().equals(updateDTO.licensePlate()) &&
                    vehicleRepository.existsByLicensePlate(updateDTO.licensePlate())) {
                throw new IllegalArgumentException("Acest numar de inmatriculare apartine deja altei masini!");
            }
            existingVehicle.setLicensePlate(updateDTO.licensePlate());
        }

        if (updateDTO.mileage() != null) {
            existingVehicle.setMileage(updateDTO.mileage());
        }

        // 3. Salvam si returnam DTO-ul actualizat
        Vehicle savedVehicle = vehicleRepository.save(existingVehicle);
        return vehicleMapper.toDto(savedVehicle);
    }

    //  stergem o masina din sistem
    @Transactional
    public void deleteVehicle(Long id) {
        if (!vehicleRepository.existsById(id)) {
            throw new IllegalArgumentException("Mașina cu ID-ul " + id + " nu a fost găsită!");
        }
        vehicleRepository.deleteById(id);
    }
}