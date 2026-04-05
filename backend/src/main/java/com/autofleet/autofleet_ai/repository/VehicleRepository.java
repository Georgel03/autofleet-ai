package com.autofleet.autofleet_ai.repository;

import com.autofleet.autofleet_ai.entity.User;
import com.autofleet.autofleet_ai.entity.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    // 1. Verifică dacă numărul de înmatriculare există DOAR la acest user
    boolean existsByLicensePlateAndUser(String licensePlate, User user);

    // 2. Aduce TOATE mașinile, dar DOAR ale userului logat
    Page<Vehicle> findAllByUser(User user, Pageable pageable);

    // 3. Caută după text, dar DOAR în mașinile userului logat
    @Query("SELECT v FROM Vehicle v WHERE v.user = :user AND (" +
            "LOWER(v.manufacturer) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(v.model) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(v.licensePlate) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Vehicle> searchVehiclesByUser(@Param("keyword") String keyword, @Param("user") User user, Pageable pageable);

    // --- STATISTICI PENTRU ANALYTICS (Filtrate pe User) ---

    @Query("SELECT COUNT(v) FROM Vehicle v WHERE v.user = :user")
    Long getVehiclesCountByUser(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(v.mileage), 0) FROM Vehicle v WHERE v.user = :user")
    Long getTotalFleetMileageByUser(@Param("user") User user);

    @Query("SELECT COUNT(v) FROM Vehicle v WHERE v.status = 'MAINTENANCE_REQUIRED' AND v.user = :user")
    Long getCriticalVehiclesCountByUser(@Param("user") User user);

    // NOU: Aduce lista de mașini (fără paginare) pentru calculele complexe din Analytics
    @Query("SELECT v FROM Vehicle v WHERE v.user = :user")
    java.util.List<Vehicle> findAllListByUser(@Param("user") User user);
}