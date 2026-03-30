package com.autofleet.autofleet_ai.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthenticationRequestDTO(
        @NotBlank(message = "Email-ul este obligatoriu") String email,
        @NotBlank(message = "Parola este obligatorie") String password
) {}