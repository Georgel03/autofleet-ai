package com.autofleet.autofleet_ai.service;

import com.autofleet.autofleet_ai.dto.AIPredictionDTO;
import com.autofleet.autofleet_ai.entity.AIPrediction;
import com.autofleet.autofleet_ai.entity.MaintenanceRecord;
import com.autofleet.autofleet_ai.entity.Vehicle;
import com.autofleet.autofleet_ai.entity.VehicleStatus;
import com.autofleet.autofleet_ai.repository.AIPredictionRepository;
import com.autofleet.autofleet_ai.repository.VehicleRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AIPredictionService {

    private final AIPredictionRepository aiRepository;
    private final VehicleRepository vehicleRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${openai.api.key}")
    private String apiKey;

    public AIPredictionService(AIPredictionRepository aiRepository,
                               VehicleRepository vehicleRepository) {
        this.aiRepository = aiRepository;
        this.vehicleRepository = vehicleRepository;
        this.objectMapper = new ObjectMapper();
        this.webClient = WebClient.builder().baseUrl("https://api.openai.com/v1").build();
    }

    @Transactional
    public AIPredictionDTO generatePrediction(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException("Masina nu a fost gasita!"));

        // 1. Pregatim istoricul de mentenanta ca text pentru AI
        String serviceHistoryText = vehicle.getMaintenanceHistory().stream()
                .map(record -> String.format("- Data: %s, Descriere: %s, Cost: %.2f",
                        record.getServiceDate(), record.getDescription(), record.getCost()))
                .collect(Collectors.joining("\n"));

        if (serviceHistoryText.isEmpty()) {
            serviceHistoryText = "Nu exista nicio intrare in service pana acum.";
        }

        // 2. Construim Prompt-ul (Contextul "Expert" pentru AI)
        String prompt = String.format(
                "Te rog analizeaza urmatorul vehicul din flota noastra:\n" +
                        "- Marca si Model: %s %s\n" +
                        "- Kilometraj curent: %d km\n" +
                        "- Putere motor: %s CP\n" +
                        "- Scor de sanatate (Health Score): %d/100\n\n" +
                        "Istoricul de mentenanta inregistrat pana in prezent (daca este gol, nu s-au facut revizii recente):\n%s\n\n" +
                        "Instructiuni stricte de analiza:\n" +
                        "1. Evalueaza kilometrajul curent si compara-l cu durata de viata standard a componentelor critice (ex: kit distributie, filtru de particule DPF, ambreiaj, turbosuflanta, placute/discuri frana, sistem de racire si alte componente).\n" +
                        "2. Verifica istoricul de service. Daca o componenta majora trebuia schimbata la acest kilometraj dar NU apare in istoric, fa din ea principala ta predictie.\n" +
                        "3. Daca mentenanta de baza (ulei, filtre) nu apare recent in istoric la masini cu rulaj mare, ia in calcul uzura motorului.\n" +
                        "4. Selecteaza o singura componenta, cea mai critica si probabila sa cedeze in urmatoarele luni.\n" +
                        "5. Rationamentul (reasoning) trebuie sa fie foarte tehnic, profesionist, in limba romana, explicand clar de ce ai facut aceasta alegere pe baza datelor oferite.",
                vehicle.getManufacturer(), vehicle.getModel(), vehicle.getMileage(),
                vehicle.getHorsePower() != null ? vehicle.getHorsePower() : "Necunoscut",
                vehicle.getHealthScore(), serviceHistoryText
        );

        // 3. Payload-ul pentru OpenAI cu System Prompt
        Map<String, Object> requestBody = Map.of(
                "model", "gpt-5.4",
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content",
                                "You are an elite automotive diagnostic AI and fleet maintenance manager. " +
                                        "Your task is to accurately predict the next component failure based on mileage, specs, and maintenance history gaps. " +
                                        "You MUST respond ONLY in valid JSON with exactly these keys: " +
                                        "'predictedComponent' (String, in Romanian), " +
                                        "'urgency' (String: strictly HIGH, MEDIUM, or LOW), " +
                                        "'reasoning' (String, highly technical explanation in Romanian), " +
                                        "'failureProbability' (Integer between 0 and 100)."),
                        Map.of("role", "user", "content", prompt)
                )
        );

        try {
            // 4. Apelul real WebClient
            String response = webClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // 5. Parsare si Salvare
            JsonNode root = objectMapper.readTree(response);
            String content = root.path("choices").get(0).path("message").path("content").asText();
            JsonNode aiJson = objectMapper.readTree(content);

            AIPrediction prediction = new AIPrediction();
            prediction.setVehicle(vehicle);
            prediction.setPredictedComponent(aiJson.get("predictedComponent").asText());
            prediction.setUrgency(aiJson.get("urgency").asText());
            prediction.setReasoning(aiJson.get("reasoning").asText());
            prediction.setFailureProbability(aiJson.get("failureProbability").asInt());
            prediction.setCreatedAt(LocalDateTime.now());

            AIPrediction saved = aiRepository.save(prediction);

            String urgency = saved.getUrgency().toUpperCase();
            if (urgency.equals("HIGH")) {
                vehicle.setStatus(VehicleStatus.MAINTENANCE_REQUIRED);
            } else if (urgency.equals("MEDIUM")) {
                vehicle.setStatus(VehicleStatus.WARNING);
            } else {
                vehicle.setStatus(VehicleStatus.OK);
            }

            vehicleRepository.save(vehicle);

            return new AIPredictionDTO(
                    saved.getId(), saved.getPredictedComponent(), saved.getUrgency(),
                    saved.getReasoning(), saved.getFailureProbability(), saved.getCreatedAt()
            );

        } catch (Exception e) {
            throw new RuntimeException("Eroare OpenAI: " + e.getMessage());
        }
    }
}