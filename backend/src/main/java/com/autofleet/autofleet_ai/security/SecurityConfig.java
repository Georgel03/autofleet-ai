package com.autofleet.autofleet_ai.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, AuthenticationProvider authenticationProvider) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // dezactivam CSRF pentru ca aplicatia noastra este un REST API stateless (nu folosește cookie-uri de sesiune)
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // configurăm regulile de acces
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // Orice request către rutele de autentificare este PUBLIC
                        .anyRequest().authenticated()                // Restul aplicației (/api/vehicles, /api/ai) este PRIVAT
                )

                // setăm managementul sesiunii pe STATELESS (serverul uită cine ești imediat după ce ți-a răspuns)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // ii spunem ce provider de autentificare să folosească (cel definit de noi în ApplicationConfig)
                .authenticationProvider(authenticationProvider)

                // inserăm filtrul nostru JWT exact înainte de filtrul standard de username/parolă din Spring
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Permitem cereri doar de la serverul nostru de React (Vite folosește portul 5173)
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        // Permitem metodele standard de comunicare
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // Permitem trimiterea token-ului JWT și a datelor JSON
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplicăm aceste reguli pentru absolut toate rutele noastre (/**)
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}