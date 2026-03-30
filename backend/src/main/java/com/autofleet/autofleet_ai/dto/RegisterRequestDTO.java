package com.autofleet.autofleet_ai.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequestDTO(
        @NotBlank(message = "Prenumele este obligatoriu") String firstName,
        @NotBlank(message = "Numele este obligatoriu") String lastName,
        @Email(message = "Formatul email-ului nu este valid")
        @NotBlank(message = "Email-ul este obligatoriu") String email,
        @NotBlank(message = "Parola este obligatorie")
        @Size(min = 6, message = "Parola trebuie sa aiba minim 6 caractere") String password
) {}