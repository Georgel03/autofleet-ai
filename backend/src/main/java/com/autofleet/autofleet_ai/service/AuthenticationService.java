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
        // verificam daca email-ul exista deja
        if (repository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("Acest email este deja folosit!");
        }

        // construim noul utilizator
        User user = new User();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Role.USER);

        // salvam in baza de date
        repository.save(user);

        // generam token-ul pentru a-l loga automat dupa inregistrare
        var jwtToken = jwtService.generateToken(user);

        return new AuthenticationResponseDTO(jwtToken);
    }

    public AuthenticationResponseDTO authenticate(AuthenticationRequestDTO request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        var user = repository.findByEmail(request.email())
                .orElseThrow();

        var jwtToken = jwtService.generateToken(user);

        return new AuthenticationResponseDTO(jwtToken);
    }
}