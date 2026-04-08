package com.autofleet.autofleet_ai.service;

import com.autofleet.autofleet_ai.dto.CreateVehicleDTO;
import com.autofleet.autofleet_ai.dto.FleetStatsDTO;
import com.autofleet.autofleet_ai.dto.UpdateVehicleDTO;
import com.autofleet.autofleet_ai.dto.VehicleResponseDTO;
import com.autofleet.autofleet_ai.entity.User;
import com.autofleet.autofleet_ai.entity.Vehicle;
import com.autofleet.autofleet_ai.exception.BusinessRuleException;
import com.autofleet.autofleet_ai.exception.ResourceNotFoundException;
import com.autofleet.autofleet_ai.repository.UserRepository;
import com.autofleet.autofleet_ai.repository.VehicleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.module.ResolutionException;
import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleMapper vehicleMapper;
    private final UserRepository userRepository;

    public VehicleService(VehicleRepository vehicleRepository, VehicleMapper vehicleMapper, UserRepository userRepository) {
        this.vehicleRepository = vehicleRepository;
        this.vehicleMapper = vehicleMapper;
        this.userRepository = userRepository;
    }


    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizatorul nu a fost gasit in baza de date"));
    }


    public FleetStatsDTO getFleetStats() {
        User user = getCurrentUser();
        Long totalVehicles = vehicleRepository.getVehiclesCountByUser(user);
        Long totalMileage = vehicleRepository.getTotalFleetMileageByUser(user);
        Long criticalCount = vehicleRepository.getCriticalVehiclesCountByUser(user);

        return new FleetStatsDTO(totalVehicles, totalMileage, criticalCount);
    }


    public Page<VehicleResponseDTO> getVehiclesPage(int page, int size, String sortBy, String sortDir, String keyword) {
        User user = getCurrentUser();
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Vehicle> vehiclePage;
        if (keyword != null && !keyword.trim().isEmpty()) {
            vehiclePage = vehicleRepository.searchVehiclesByUser(keyword.trim(), user, pageable);
        } else {
            vehiclePage = vehicleRepository.findAllByUser(user, pageable);
        }
        return vehiclePage.map(vehicleMapper::toDto);
    }

    @Transactional
    public VehicleResponseDTO getVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Masina cu id-ul %d nu a fost gasita!", id)));

        if (!vehicle.getUser().getId().equals(getCurrentUser().getId())) {
            throw new AccessDeniedException("Nu ai permisiunea sa accesezi aceasta masina!");
        }
        return vehicleMapper.toDto(vehicle);
    }


    @Transactional
    public VehicleResponseDTO createVehicle(CreateVehicleDTO createDTO) {
        User user = getCurrentUser();

        if (vehicleRepository.existsByLicensePlateAndUser(createDTO.licensePlate(), user)) {
            throw new BusinessRuleException("O masina cu acest numar exista deja in flota ta!");
        }

        Vehicle newVehicle = vehicleMapper.toEntity(createDTO);
        newVehicle.setUser(user);

        Vehicle savedVehicle = vehicleRepository.save(newVehicle);
        return vehicleMapper.toDto(savedVehicle);
    }


    @Transactional
    public VehicleResponseDTO updateVehicle(Long id, UpdateVehicleDTO updateDTO) {
        User user = getCurrentUser();
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Masina cu id-ul %d nu a fost gasita!", id)));

        if (!existingVehicle.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Nu poti modifica masina altui utilizator!");
        }


        if (updateDTO.manufacturer() != null) existingVehicle.setManufacturer(updateDTO.manufacturer());
        if (updateDTO.model() != null) existingVehicle.setModel(updateDTO.model());
        if (updateDTO.licensePlate() != null) {
            if (!existingVehicle.getLicensePlate().equals(updateDTO.licensePlate()) &&
                    vehicleRepository.existsByLicensePlateAndUser(updateDTO.licensePlate(), user)) {
                throw new BusinessRuleException("Numarul apartine deja altei masini din flota ta!");
            }
            existingVehicle.setLicensePlate(updateDTO.licensePlate());
        }
        if (updateDTO.mileage() != null) existingVehicle.setMileage(updateDTO.mileage());

        return vehicleMapper.toDto(vehicleRepository.save(existingVehicle));
    }


    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format("Masina cu id-ul %d nu a fost gasita!", id)));

        if (!vehicle.getUser().getId().equals(getCurrentUser().getId())) {
            throw new AccessDeniedException("Nu poti sterge masina altui utilizator!");
        }
        vehicleRepository.deleteById(id);
    }


    @Transactional
    public List<VehicleResponseDTO> getCarsWithWarningStatusAndMoreThanOnePred() {
        User user = getCurrentUser();

        List<Vehicle> vehicleList = vehicleRepository.getWarningVehiclesWithMoreThanOnePredByUser(user);
        return vehicleList.stream().map(vehicleMapper::toDto).toList();
    }
}