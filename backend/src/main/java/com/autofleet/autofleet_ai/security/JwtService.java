package com.autofleet.autofleet_ai.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;

    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    // extrage adresa de email (username-ul) din token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // metoda generica pentru extragerea datelor din token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        // aplicam functia ceruta ca sa luam fix o singura valoare
        return claimsResolver.apply(claims);
    }

    // genereaza un token simplu doar cu datele userului
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    // genereaza un token
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                // punem in interiorul token-ului orice date suplimentare am primit (ex: roluri, id).
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                // semnam token-ul folosind cheia criptografica.
                .signWith(getSignInKey())
                // strange toate informatiile impachetate intr-un singur sir lung de text (String).
                .compact();
    }

    // verifica daca token-ul apartine userului si daca nu a expirat
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // citeste si valideaza token-ul
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                // // verifica cheia noastra secreta fara de care nu poate confirma ca token-ul e pe bune
                .verifyWith(getSignInKey())
                // finalizam crearea instrumentului de citit
                .build()
                // ii dam token-ul cerandu-i sa il analizeze si sa citeasca tot ce e in el
                .parseSignedClaims(token)
                // extragem payload-ul
                .getPayload();
    }

    // transforma string-ul intr-o cheie criptografica reala
    private SecretKey getSignInKey() {
        // decodificam cheia noastra din litere normale intr un byte array
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        // generam o cheie de tip HMAC-SHA folosind acei biti
        return Keys.hmacShaKeyFor(keyBytes);
    }
}