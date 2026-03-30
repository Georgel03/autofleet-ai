package com.autofleet.autofleet_ai.service;

import com.autofleet.autofleet_ai.dto.AuthenticationRequestDTO;
import com.autofleet.autofleet_ai.dto.AuthenticationResponseDTO;
import com.autofleet.autofleet_ai.dto.RegisterRequestDTO;
import com.autofleet.autofleet_ai.entity.User;
import com.autofleet.autofleet_ai.entity.Role;
import com.autofleet.autofleet_ai.repository.UserRepository;
import com.autofleet.autofleet_ai.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationService(UserRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthenticationResponseDTO register(RegisterRequestDTO request) {
        // 1. Verificam daca email-ul exista deja (optional, dar recomandat)
        if (repository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("Acest email este deja folosit!");
        }

        // 2. Construim noul utilizator
        User user = new User();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);

        // 3. Salvam in baza de date
        repository.save(user);

        // 4. Generam token-ul pentru a-l loga automat dupa inregistrare
        var jwtToken = jwtService.generateToken(user);

        return new AuthenticationResponseDTO(jwtToken);
    }

    public AuthenticationResponseDTO authenticate(AuthenticationRequestDTO request) {
        // 1. AuthenticationManager se ocupa automat de verificarea parolei criptate
        // Daca parola e gresita, arunca o eroare si se opreste aici
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        // 2. Daca a trecut de pasul 1, datele sunt corecte. Scoatem userul din DB.
        var user = repository.findByEmail(request.email())
                .orElseThrow();

        // 3. Generam un nou token JWT
        var jwtToken = jwtService.generateToken(user);

        return new AuthenticationResponseDTO(jwtToken);
    }
}