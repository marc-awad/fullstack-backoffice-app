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

import java.util.List;

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
    // Liste tous les produits avec pagination et filtres
    // =======================
    @Operation(
            summary = "Lister tous les produits",
            description = "Récupère la liste paginée de tous les produits avec filtres optionnels par nom et catégorie"
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
            @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Recherche par nom de produit", example = "Smartphone")
            @RequestParam(required = false) String search,
            @Parameter(description = "Filtrer par nom de catégorie", example = "Électronique")
            @RequestParam(required = false) String category
    ) {
        Page<ProductResponse> products = productService.searchProducts(search, category, page, size);
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
    // GET /api/products/categories
    // Liste toutes les catégories
    // =======================
    @Operation(
            summary = "Lister toutes les catégories",
            description = "Récupère la liste de toutes les catégories disponibles"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Liste des catégories récupérée avec succès",
                    content = @Content(mediaType = "application/json")
            )
    })
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = productService.getAllCategories();
        return ResponseEntity.ok(categories);
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