package com.example.back.controller;

import com.example.back.dto.ProductResponse;
import com.example.back.exception.ProductNotFoundException;
import com.example.back.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Produits", description = "API publique pour consulter le catalogue de produits")
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // =======================
    // GET /api/products
    // Liste tous les produits avec pagination
    // =======================
    @Operation(
            summary = "Lister tous les produits",
            description = "Récupère la liste paginée de tous les produits disponibles dans le catalogue. " +
                    "Endpoint public accessible sans authentification."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Liste des produits récupérée avec succès",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = Page.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erreur serveur interne",
                    content = @Content(mediaType = "text/plain")
            )
    })
    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @Parameter(description = "Numéro de page (commence à 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Nombre d'éléments par page", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ProductResponse> products = productService.getAllProducts(page, size);
        return ResponseEntity.ok(products);
    }

    // =======================
    // GET /api/products/{id}
    // Détail d'un produit
    // =======================
    @Operation(
            summary = "Récupérer un produit par ID",
            description = "Retourne les détails complets d'un produit spécifique identifié par son ID"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Produit trouvé",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = ProductResponse.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Produit non trouvé avec cet ID",
                    content = @Content(mediaType = "text/plain")
            )
    })
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(
            @Parameter(description = "ID unique du produit", example = "1", required = true)
            @PathVariable Long id
    ) {
        ProductResponse product = productService.getProduct(id);
        return ResponseEntity.ok(product);
    }

    // =======================
    // GET /api/products/search
    // Recherche par nom et/ou catégorie avec pagination
    // =======================
    @Operation(
            summary = "Rechercher des produits",
            description = "Permet de filtrer les produits par nom et/ou catégorie avec pagination. " +
                    "Les paramètres de recherche sont optionnels."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Résultats de recherche retournés",
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = Page.class)
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erreur serveur interne",
                    content = @Content(mediaType = "text/plain")
            )
    })
    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @Parameter(description = "Nom du produit à rechercher (recherche partielle)", example = "Smartphone")
            @RequestParam(required = false) String name,
            @Parameter(description = "ID de la catégorie pour filtrer", example = "1")
            @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Numéro de page", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Nombre d'éléments par page", example = "10")
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ProductResponse> products = productService.searchProducts(name, categoryId, page, size);
        return ResponseEntity.ok(products);
    }

    // =======================
    // Gestion des exceptions
    // =======================
    @ExceptionHandler(ProductNotFoundException.class)
    public ResponseEntity<String> handleNotFound(ProductNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleOtherExceptions(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred: " + ex.getMessage());
    }
}