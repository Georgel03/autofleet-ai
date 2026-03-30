package com.autofleet.autofleet_ai.security;

import com.autofleet.autofleet_ai.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class ApplicationConfig {

    private final UserRepository repository;

    public ApplicationConfig(UserRepository repository) {
        this.repository = repository;
    }

    // definim cum cautam user-ul (prin email)
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> repository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilizatorul nu a fost gasit"));
    }

    // providerul care face legatura intre UserDetailsService si PasswordEncoder
    @Bean
    public AuthenticationProvider authenticationProvider() {
        // trece userDetailsService() direct in constructor
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService());

        // seteaza algoritmul de parole
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    // managerul care se va ocupa efectiv de autentificare la login
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // algoritmul de hashuire a parolelor
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}