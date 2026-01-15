package com.example.back.service;

import com.example.back.dto.AuthResponse;
import com.example.back.dto.LoginRequest;
import com.example.back.dto.RegisterRequest;
import com.example.back.exception.InvalidCredentialsException;
import com.example.back.exception.UserAlreadyExistsException;
import com.example.back.model.Role;
import com.example.back.model.User;
import com.example.back.repository.UserRepository;
import com.example.back.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Inscription d'un nouvel utilisateur
     */
    public void register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new UserAlreadyExistsException("Username already taken");
        }

        if (userRepository.findAll().stream().anyMatch(u -> u.getEmail().equalsIgnoreCase(request.getEmail()))) {
            throw new UserAlreadyExistsException("Email already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Collections.singleton(Role.USER))
                .enabled(true)
                .build();

        userRepository.save(user);
    }

    /**
     * Authentification utilisateur et génération JWT
     */
    public AuthResponse authenticate(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        // MODIFICATION ICI : Créer les authorities à partir des rôles de l'utilisateur
        var authorities = user.getRoles().stream()
                .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toList());

        // Passer les authorities au générateur de token
        String token = jwtUtil.generateToken(user.getUsername(), authorities);

        return new AuthResponse(user.getUsername(), token);
    }
}