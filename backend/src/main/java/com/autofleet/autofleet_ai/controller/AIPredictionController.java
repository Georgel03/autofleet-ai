package com.autofleet.autofleet_ai.controller;

import com.autofleet.autofleet_ai.dto.AIPredictionDTO;
import com.autofleet.autofleet_ai.service.AIPredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIPredictionController {

    private final AIPredictionService aiService;

    public AIPredictionController(AIPredictionService aiService) {
        this.aiService = aiService;
    }


    @PostMapping("/predict/{vehicleId}")
    public ResponseEntity<AIPredictionDTO> generatePrediction(@PathVariable Long vehicleId) {

        AIPredictionDTO prediction = aiService.generatePrediction(vehicleId);
        return ResponseEntity.ok(prediction);
    }
}