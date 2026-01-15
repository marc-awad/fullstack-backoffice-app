package com.example.back.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("=== DEBUT DU FILTRE JWT ===");
        System.out.println("URL demandée: " + request.getRequestURI());

        String authHeader = request.getHeader("Authorization");
        System.out.println("Authorization header: " + authHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            System.out.println("Token extrait: " + token);

            try {
                String username = jwtUtil.extractUsername(token);
                System.out.println("Username extrait: " + username);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                    if (jwtUtil.validateToken(token, username)) {
                        System.out.println("Token validé ✓");

                        // Extraire les rôles du token
                        String rolesString = jwtUtil.extractRoles(token);
                        System.out.println("Rôles extraits du token: " + rolesString);

                        // AJOUT DE CETTE VÉRIFICATION
                        if (rolesString != null && !rolesString.isEmpty()) {
                            List<SimpleGrantedAuthority> authorities = Arrays.stream(rolesString.split(","))
                                    .map(SimpleGrantedAuthority::new)
                                    .collect(Collectors.toList());

                            System.out.println("Authorities créées: " + authorities);

                            UsernamePasswordAuthenticationToken authToken =
                                    new UsernamePasswordAuthenticationToken(username, null, authorities);
                            SecurityContextHolder.getContext().setAuthentication(authToken);

                            System.out.println("Authentication définie dans SecurityContext ✓");
                        } else {
                            System.out.println("Aucun rôle trouvé dans le token");
                        }
                    } else {
                        System.out.println("Token invalide ✗");
                    }
                }
            } catch (Exception e) {
                System.err.println("ERREUR JWT: " + e.getMessage());
                e.printStackTrace();
                // NE PAS bloquer la requête, juste logger l'erreur
            }
        } else {
            System.out.println("Pas de header Authorization ou format incorrect");
        }

        System.out.println("=== FIN DU FILTRE JWT ===\n");
        filterChain.doFilter(request, response);  // TOUJOURS continuer le filtre
    }
}