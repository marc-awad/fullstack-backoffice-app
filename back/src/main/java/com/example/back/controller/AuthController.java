package com.example.back.controller;

import com.example.back.dto.AuthResponse;
import com.example.back.dto.LoginRequest;
import com.example.back.dto.RegisterRequest;
import com.example.back.exception.InvalidCredentialsException;
import com.example.back.exception.UserAlreadyExistsException;
import com.example.back.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Authentification", description = "API pour l'inscription, la connexion et la gestion de l'authentification JWT")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // =======================
    // Endpoint Inscription
    // =======================
    @Operation(
            summary = "Inscription d'un nouvel utilisateur",
            description = "Crée un nouveau compte utilisateur avec le rôle USER par défaut. L'email doit être unique."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Utilisateur créé avec succès",
                    content = @Content(mediaType = "text/plain")
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Email déjà utilisé ou données invalides",
                    content = @Content(mediaType = "text/plain")
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erreur serveur interne",
                    content = @Content(mediaType = "text/plain")
            )
    })
    @PostMapping("/register")
    public ResponseEntity<String> register(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Informations d'inscription de l'utilisateur",
                    required = true,
                    content = @Content(schema = @Schema(implementation = RegisterRequest.class))
            )
            @Valid @RequestBody RegisterRequest request
    ) {
        userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully");
    }

    // =======================
    // Endpoint Connexion
    // =======================
    @Operation(
            summary = "Connexion utilisateur",
            description = "Authentifie un utilisateur avec son email et mot de passe. Retourne un token JWT valide pour 24 heures."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Authentification réussie - Token JWT retourné",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Identifiants invalides - Email ou mot de passe incorrect",
                    content = @Content(mediaType = "text/plain")
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Données de connexion invalides",
                    content = @Content(mediaType = "text/plain")
            )
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Identifiants de connexion (email et mot de passe)",
                    required = true,
                    content = @Content(schema = @Schema(implementation = LoginRequest.class))
            )
            @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse response = userService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    // =======================
    // Gestion des exceptions
    // =======================
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<String> handleUserExists(UserAlreadyExistsException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<String> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleOtherExceptions(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred: " + ex.getMessage());
    }
}