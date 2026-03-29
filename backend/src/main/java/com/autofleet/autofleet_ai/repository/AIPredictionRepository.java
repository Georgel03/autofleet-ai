package com.autofleet.autofleet_ai.repository;

import com.autofleet.autofleet_ai.entity.AIPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIPredictionRepository extends JpaRepository<AIPrediction, Long> {

    // aducem predictiile unei masini, de la cea mai noua la cea mai veche
    List<AIPrediction> findByVehicleIdOrderByCreatedAtDesc(Long vehicleId);
}