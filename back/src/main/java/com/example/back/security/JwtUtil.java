package com.example.back.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET_KEY = "wzUpGa9k4LTV3SHuY8qVrt6wOENkfdes5vLHVc1ex6581Iiq";

    public String generateToken(String username) {
        long expirationMillis = 1000 * 60 * 60 * 24; // 24h

        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET_KEY));

        return Jwts.builder()
                .subject(username)  // Nouvelle API sans setSubject
                .issuedAt(new Date())  // Nouvelle API sans setIssuedAt
                .expiration(new Date(System.currentTimeMillis() + expirationMillis))  // Nouvelle API sans setExpiration
                .signWith(key)  // signWith sans SignatureAlgorithm (détecté automatiquement)
                .compact();
    }

    // Récupérer le username depuis le token
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // Vérifier si le token est valide
    public boolean validateToken(String token, String username) {
        return extractUsername(token).equals(username) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }

    private Claims getClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET_KEY));
        return Jwts.parser()  // Nouvelle API : parser() au lieu de parserBuilder()
                .verifyWith(key)  // verifyWith au lieu de setSigningKey
                .build()
                .parseSignedClaims(token)  // parseSignedClaims au lieu de parseClaimsJws
                .getPayload();  // getPayload() au lieu de getBody()
    }
}