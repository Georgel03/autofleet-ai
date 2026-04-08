package com.autofleet.autofleet_ai.service;

import com.autofleet.autofleet_ai.dto.AnalyticsDashboardDTO;
import com.autofleet.autofleet_ai.entity.*;
import com.autofleet.autofleet_ai.exception.ResourceNotFoundException;
import com.autofleet.autofleet_ai.repository.UserRepository;
import com.autofleet.autofleet_ai.repository.VehicleRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final VehicleRepository vehicleRepository;

    private final UserRepository userRepository;

    public AnalyticsService(VehicleRepository vehicleRepository, UserRepository userRepository) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizatorul nu a fost gasit"));
    }

    public AnalyticsDashboardDTO getDashboardData() {
        User user = getCurrentUser();

        List<Vehicle> allVehicles = vehicleRepository.findAllListByUser(user);

        // costuri lunare
        LocalDate now = LocalDate.now();
        Map<Month, Double> monthlyCosts = new LinkedHashMap<>();

        for (int i = 6; i >= 0; i--) {
            monthlyCosts.put(now.minusMonths(i).getMonth(), 0.0);
        }

        for (Vehicle vehicle : allVehicles) {
            if (vehicle.getMaintenanceHistory() != null) {
                for (MaintenanceRecord maintenanceRecord : vehicle.getMaintenanceHistory()) {
                    if (maintenanceRecord.getServiceDate() != null && maintenanceRecord.getServiceDate().isAfter(now.minusMonths(7))) {
                        Month m = maintenanceRecord.getServiceDate().getMonth();
                        if (monthlyCosts.containsKey(m)) {
                            monthlyCosts.put(m, monthlyCosts.get(m) + maintenanceRecord.getCost());
                        }
                    }
                }
            }
        }

        List<AnalyticsDashboardDTO.MonthlyCostDTO> monthlyCostDTOs = monthlyCosts.entrySet().stream()
                .map(e -> new AnalyticsDashboardDTO.MonthlyCostDTO(
                        e.getKey().getDisplayName(TextStyle.SHORT, Locale.ENGLISH).toUpperCase(),
                        Math.round(e.getValue() * 100.0) / 100.0
                ))
                .toList();

        //top 5 vehicule costisitoare
        List<AnalyticsDashboardDTO.TopVehicleDTO> topVehicles = allVehicles.stream()
                .map(vehicle -> {
                    //am adaugat verificarea null
                    double totalCost = vehicle.getMaintenanceHistory() == null ? 0.0 :
                            vehicle.getMaintenanceHistory().stream().mapToDouble(MaintenanceRecord::getCost).sum();
                    return new AbstractMap.SimpleEntry<>(vehicle, totalCost);
                })
                .filter(e -> e.getValue() > 0)
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                .limit(5)
                .map(e -> {
                    Vehicle v = (Vehicle) e.getKey();
                    String name = v.getLicensePlate() + " (" + v.getManufacturer() + ")";
                    return new AnalyticsDashboardDTO.TopVehicleDTO(name, Math.round(e.getValue() * 100.0) / 100.0);
                })
                .toList();

        // costuri medii de mentenanta pe tip de motorizare
        double thermalCost = 0, hybridCost = 0, electricCost = 0;
        int thermalCount = 0, hybridCount = 0, electricCount = 0;

        for (Vehicle v : allVehicles) {
            double cost = v.getMaintenanceHistory() == null ? 0.0 :
                    v.getMaintenanceHistory().stream().mapToDouble(MaintenanceRecord::getCost).sum();

            if (v instanceof ThermalVehicle) {
                thermalCount++;
                thermalCost += cost;
            } else if (v instanceof HybridVehicle) {
                hybridCount++;
                hybridCost += cost;
            } else if (v instanceof ElectricVehicle){
                electricCount++;
                electricCost += cost;
            }
        }

        List<AnalyticsDashboardDTO.PowertrainCostDTO> powertrainCosts = List.of(
                new AnalyticsDashboardDTO.PowertrainCostDTO("Thermal", thermalCount > 0 ? thermalCost / thermalCount : 0),
                new AnalyticsDashboardDTO.PowertrainCostDTO("Hybrid", hybridCount > 0 ? hybridCost / hybridCount : 0),
                new AnalyticsDashboardDTO.PowertrainCostDTO("Electric", electricCount > 0 ? electricCost / electricCount : 0)
        );

        return new AnalyticsDashboardDTO(monthlyCostDTOs, topVehicles, powertrainCosts);
    }
}