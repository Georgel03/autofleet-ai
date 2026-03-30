package com.autofleet.autofleet_ai.controller;

import com.autofleet.autofleet_ai.dto.AIPredictionDTO;
import com.autofleet.autofleet_ai.service.AIPredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173") // Permitem frontend-ului React sa faca apeluri catre acest endpoint
public class AIPredictionController {

    private final AIPredictionService aiService;

    // Injectam serviciul pe care tocmai l-am imbunatatit
    public AIPredictionController(AIPredictionService aiService) {
        this.aiService = aiService;
    }

    // Acest endpoint va fi apelat cand apesi butonul "Run AI Scan" din frontend
    @PostMapping("/predict/{vehicleId}")
    public ResponseEntity<AIPredictionDTO> generatePrediction(@PathVariable Long vehicleId) {

        // Apelam metoda noastra complexa care discuta cu OpenAI
        AIPredictionDTO prediction = aiService.generatePrediction(vehicleId);

        // Returnam rezultatul sub forma de JSON catre frontend cu status 200 OK
        return ResponseEntity.ok(prediction);
    }
}