package com.autofleet.autofleet_ai;

import com.autofleet.autofleet_ai.entity.User;
import com.autofleet.autofleet_ai.entity.Vehicle;
import com.autofleet.autofleet_ai.entity.ThermalVehicle;
import com.autofleet.autofleet_ai.repository.UserRepository;
import com.autofleet.autofleet_ai.repository.VehicleRepository;
import com.autofleet.autofleet_ai.service.VehicleMapper;
import com.autofleet.autofleet_ai.service.VehicleService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VehicleMapper vehicleMapper;

    // mocks necesare pentru a simula autentificarea
    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private VehicleService vehicleService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void deleteVehicle_ShouldThrowAccessDenied_WhenUserIsNotOwner() {

        User owner = new User();
        owner.setId(1L);
        owner.setEmail("owner@test.com");

        User hacker = new User();
        hacker.setId(2L);
        hacker.setEmail("hacker@test.com");

        Vehicle vehicle = new ThermalVehicle();
        vehicle.setId(100L);
        vehicle.setUser(owner);

        // simulam SecurityContextHolder, service-ul intreba cine este logat, returnam hackerul
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("hacker@test.com");
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByEmail("hacker@test.com")).thenReturn(Optional.of(hacker));
        when(vehicleRepository.findById(100L)).thenReturn(Optional.of(vehicle));

        assertThrows(AccessDeniedException.class, () -> {
            vehicleService.deleteVehicle(100L);
        });

        verify(vehicleRepository, never()).deleteById(100L);
    }
}
