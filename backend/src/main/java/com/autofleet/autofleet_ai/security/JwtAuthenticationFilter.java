package com.autofleet.autofleet_ai.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // extragem header-ul de "Authorization" din cererea venită
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        // daca nu avem token sau nu incepe cu "Bearer ", lasam cererea sa treaca
        // (Asta permite rutelor publice, gen Login, sa functioneze)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        //  extragem token-ul efectiv
        jwt = authHeader.substring(7);

        // extragem email-ul din token
        userEmail = jwtService.extractUsername(jwt);

        // daca token-ul are un email si utilizatorul nu e deja logat în memorie
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // cautam userul in baza de date
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            // verificam daca token-ul este valid si aparține acestui user
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // cream tokenul de Autentificare intern pentru Spring
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // setam userul ca fiind logat oficial în sistem
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // lasam cererea sa mearga mai departe catre destinația ei
        filterChain.doFilter(request, response);
    }
}