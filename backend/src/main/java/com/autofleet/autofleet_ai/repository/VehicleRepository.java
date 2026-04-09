package com.autofleet.autofleet_ai.repository;

import com.autofleet.autofleet_ai.entity.User;
import com.autofleet.autofleet_ai.entity.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {


    boolean existsByLicensePlateAndUser(String licensePlate, User user);


    Page<Vehicle> findAllByUser(User user, Pageable pageable);

    @Query("SELECT v FROM Vehicle v WHERE TYPE(v) = :type AND v.user = :user")
    Page<Vehicle> findByVehicleTypeAndUser(@Param("type") Class<? extends Vehicle> type, @Param("user") User user, Pageable pageable);


    @Query("SELECT v FROM Vehicle v WHERE v.user = :user AND (" +
            "LOWER(v.manufacturer) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(v.model) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(v.licensePlate) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Vehicle> searchVehiclesByUser(@Param("keyword") String keyword, @Param("user") User user, Pageable pageable);


    @Query("SELECT COUNT(v) FROM Vehicle v WHERE v.user = :user")
    Long getVehiclesCountByUser(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(v.mileage), 0) FROM Vehicle v WHERE v.user = :user")
    Long getTotalFleetMileageByUser(@Param("user") User user);

    @Query("SELECT COUNT(v) FROM Vehicle v WHERE v.status = 'MAINTENANCE_REQUIRED' AND v.user = :user")
    Long getCriticalVehiclesCountByUser(@Param("user") User user);

    @Query("SELECT v FROM Vehicle v WHERE v.status = 'WARNING' AND v.user = :user AND SIZE(v.aiPredictions) > 1")
    List<Vehicle> getWarningVehiclesWithMoreThanOnePredByUser(@Param("user") User user);

    @Query("SELECT v FROM Vehicle v WHERE v.user = :user")
    List<Vehicle> findAllListByUser(@Param("user") User user);


}