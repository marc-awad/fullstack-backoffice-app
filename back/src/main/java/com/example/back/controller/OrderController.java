package com.example.back.controller;

import com.example.back.dto.OrderRequest;
import com.example.back.dto.OrderResponse;
import com.example.back.model.User;
import com.example.back.repository.UserRepository;
import com.example.back.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Commandes", description = "API de gestion des commandes utilisateur (authentification requise)")
@RestController
@RequestMapping("/api/orders")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    // ========================================
    // POST /api/orders
    // Créer une nouvelle commande pour l'utilisateur connecté
    // ========================================
    @Operation(
            summary = "Créer une nouvelle commande",
            description = "Permet à un utilisateur authentifié de passer une commande avec un ou plusieurs produits. " +
                    "L'utilisateur est automatiquement identifié via le token JWT."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Commande créée avec succès",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = OrderResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Données de commande invalides (produit inexistant, stock insuffisant, etc.)",
                    content = @Content(mediaType = "text/plain")
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié - Token JWT manquant ou invalide",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Utilisateur ou produit non trouvé",
                    content = @Content(mediaType = "text/plain")
            )
    })
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Détails de la commande incluant les articles et quantités",
                    required = true,
                    content = @Content(schema = @Schema(implementation = OrderRequest.class))
            )
            @Valid @RequestBody OrderRequest request
    ) {
        System.out.println("=== DEBUT createOrder() ===");

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Authentication: " + auth);
        System.out.println("Is authenticated: " + (auth != null && auth.isAuthenticated()));

        if (auth == null) {
            System.err.println("ERREUR: Authentication est null !");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = auth.getName();
        System.out.println("Username: " + username);
        System.out.println("Authorities: " + auth.getAuthorities());

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        System.out.println("User found: " + user.getId() + " - " + user.getUsername());

        request.setUserId(user.getId());
        System.out.println("OrderRequest items: " + request.getItems().size());

        OrderResponse response = orderService.createOrder(request);

        System.out.println("Order created successfully: " + response);
        System.out.println("=== FIN createOrder() ===");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ========================================
    // GET /api/orders/my-orders
    // Récupérer l'historique des commandes de l'utilisateur connecté
    // ========================================
    @Operation(
            summary = "Consulter mes commandes",
            description = "Récupère l'historique complet des commandes de l'utilisateur authentifié, " +
                    "incluant les détails des produits, quantités, prix et statuts."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Liste des commandes récupérée avec succès",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = OrderResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié - Token JWT manquant ou invalide",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Utilisateur non trouvé",
                    content = @Content(mediaType = "text/plain")
            )
    })
    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        System.out.println("=== DEBUT getMyOrders() ===");

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Authentication: " + auth);

        if (auth == null) {
            System.err.println("ERREUR: Authentication est null !");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = auth.getName();
        System.out.println("Username: " + username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        System.out.println("User found: " + user.getId() + " - " + user.getUsername());

        List<OrderResponse> orders = orderService.getOrdersByUser(user.getId());

        System.out.println("Orders found: " + orders.size());
        System.out.println("=== FIN getMyOrders() ===");

        return ResponseEntity.ok(orders);
    }
}