package com.example.back.service;

import com.example.back.dto.*;
import com.example.back.exception.InvalidCredentialsException;
import com.example.back.exception.UserAlreadyExistsException;
import com.example.back.model.Role;
import com.example.back.model.User;
import com.example.back.repository.UserRepository;
import com.example.back.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

    // =======================
    // INSCRIPTION
    // =======================
    public void register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new UserAlreadyExistsException("Username already taken");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("Email already registered");
        }


        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Collections.singleton(Role.USER))
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
    }

    // =======================
    // AUTHENTIFICATION
    // =======================
    public AuthResponse authenticate(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid username or password");
        }

        // Authorities
        var authorities = user.getRoles().stream()
                .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toList());

        String token = jwtUtil.generateToken(user.getUsername(), authorities);

        return new AuthResponse(user.getUsername(), token);
    }

    // =======================
    // LISTE UTILISATEURS (ADMIN)
    // =======================
    public Page<UserResponse> getUsers(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<User> usersPage = userRepository.findAll(pageRequest);

        return new PageImpl<>(
                usersPage.stream().map(this::toResponse).collect(Collectors.toList()),
                pageRequest,
                usersPage.getTotalElements()
        );
    }

    // =======================
    // MISE À JOUR UTILISATEUR (ADMIN)
    // =======================
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEnabled(request.getEnabled());
        user.setRoles(request.getRoles());
        userRepository.save(user);

        return toResponse(user);
    }

    // =======================
    // DTO Conversion
    // =======================
    private UserResponse toResponse(User user) {
        UserResponse resp = new UserResponse();
        resp.setId(user.getId());
        resp.setUsername(user.getUsername());
        resp.setEmail(user.getEmail());
        resp.setRoles(user.getRoles());
        resp.setEnabled(user.isEnabled());
        resp.setCreatedAt(user.getCreatedAt());
        return resp;
    }
}
