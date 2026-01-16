package com.example.back.controller;

import com.example.back.dto.*;
import com.example.back.repository.OrderRepository;
import com.example.back.repository.ProductRepository;
import com.example.back.repository.UserRepository;
import com.example.back.service.ProductService;
import com.example.back.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@Tag(name = "Administration", description = "API d'administration réservée aux utilisateurs avec le rôle ADMIN")
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final ProductService productService;
    private final UserService userService;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public AdminController(ProductService productService, UserService userService, OrderRepository orderRepository, UserRepository userRepository, ProductRepository productRepository) {
        this.productService = productService;
        this.userService = userService;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    // =======================
    // GESTION DES PRODUITS
    // =======================

    @Operation(
            summary = "Créer un nouveau produit",
            description = "Permet à un administrateur d'ajouter un nouveau produit au catalogue. " +
                    "Tous les champs sont requis sauf l'image."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Produit créé avec succès",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ProductResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Données du produit invalides",
                    content = @Content(mediaType = "text/plain")
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié - Token JWT manquant ou invalide",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Accès interdit - Rôle ADMIN requis",
                    content = @Content
            )
    })
    @PostMapping("/products")
    public ResponseEntity<ProductResponse> createProduct(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Informations du produit à créer",
                    required = true,
                    content = @Content(schema = @Schema(implementation = ProductRequest.class))
            )
            @Valid @RequestBody ProductRequest request
    ) {
        ProductResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Mettre à jour un produit",
            description = "Permet à un administrateur de modifier les informations d'un produit existant"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Produit mis à jour avec succès",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ProductResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Données du produit invalides",
                    content = @Content(mediaType = "text/plain")
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Accès interdit - Rôle ADMIN requis",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Produit non trouvé",
                    content = @Content(mediaType = "text/plain")
            )
    })
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminStatsDTO> getStats() {
        AdminStatsDTO stats = new AdminStatsDTO();
        stats.setTotalProducts(productRepository.count());
        stats.setTotalUsers(userRepository.count());
        stats.setTotalOrders(orderRepository.count());
        stats.setTotalRevenue(orderRepository.sumTotalAmount());
        stats.setRecentOrders(orderRepository.countByOrderDateAfter(LocalDateTime.now().minusDays(7))); // ⬅️ CORRECTION
        stats.setLowStockProducts(productRepository.countByStockQuantityLessThan(5));

        return ResponseEntity.ok(stats);
    }
    @PutMapping("/products/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @Parameter(description = "ID du produit à modifier", example = "1", required = true)
            @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Nouvelles informations du produit",
                    required = true,
                    content = @Content(schema = @Schema(implementation = ProductRequest.class))
            )
            @Valid @RequestBody ProductRequest request
    ) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Supprimer un produit",
            description = "Permet à un administrateur de supprimer définitivement un produit du catalogue"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Produit supprimé avec succès",
                    content = @Content(mediaType = "text/plain")
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Accès interdit - Rôle ADMIN requis",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Produit non trouvé",
                    content = @Content(mediaType = "text/plain")
            )
    })
    @DeleteMapping("/products/{id}")
    public ResponseEntity<String> deleteProduct(
            @Parameter(description = "ID du produit à supprimer", example = "1", required = true)
            @PathVariable Long id
    ) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully");
    }

    // =======================
    // GESTION DES UTILISATEURS
    // =======================

    @Operation(
            summary = "Lister tous les utilisateurs",
            description = "Récupère la liste paginée de tous les utilisateurs enregistrés dans le système"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Liste des utilisateurs récupérée",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = Page.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Accès interdit - Rôle ADMIN requis",
                    content = @Content
            )
    })
    @GetMapping("/users")
    public ResponseEntity<Page<UserResponse>> getUsers(
            @Parameter(description = "Numéro de page (commence à 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Nombre d'éléments par page", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<UserResponse> users = userService.getUsers(page, size);
        return ResponseEntity.ok(users);
    }

    @Operation(
            summary = "Mettre à jour un utilisateur",
            description = "Permet à un administrateur de modifier les rôles et le statut (activé/désactivé) d'un utilisateur"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Utilisateur mis à jour avec succès",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = UserResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Données invalides",
                    content = @Content(mediaType = "text/plain")
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Accès interdit - Rôle ADMIN requis",
                    content = @Content
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Utilisateur non trouvé",
                    content = @Content(mediaType = "text/plain")
            )
    })
    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @Parameter(description = "ID de l'utilisateur à modifier", example = "1", required = true)
            @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Nouvelles informations de l'utilisateur (rôles, statut enabled)",
                    required = true,
                    content = @Content(schema = @Schema(implementation = UpdateUserRequest.class))
            )
            @Valid @RequestBody UpdateUserRequest request
    ) {
        UserResponse updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }
}