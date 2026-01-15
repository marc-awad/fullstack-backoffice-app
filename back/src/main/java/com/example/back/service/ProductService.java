package com.example.back.service;

import com.example.back.dto.ProductRequest;
import com.example.back.dto.ProductResponse;
import com.example.back.exception.ProductNotFoundException;
import com.example.back.model.Categorie;
import com.example.back.model.Product;
import com.example.back.repository.CategorieRepository;
import com.example.back.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategorieRepository categorieRepository;

    // =======================
    // CRUD
    // =======================
    public ProductResponse createProduct(ProductRequest request) {
        Categorie category = categorieRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ProductNotFoundException("Category not found"));

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(category)
                .stockQuantity(request.getStockQuantity())
                .lienImage(request.getLienImage())
                .build();

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    public ProductResponse getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
        return mapToResponse(product);
    }

    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));

        Categorie category = categorieRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ProductNotFoundException("Category not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(category);
        product.setStockQuantity(request.getStockQuantity());
        product.setLienImage(request.getLienImage());

        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
        productRepository.delete(product);
    }

    // =======================
    // Récupérer toutes les catégories
    // =======================
    public List<String> getAllCategories() {
        return productRepository.findAll()
                .stream()
                .map(product -> product.getCategory().getName())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    // =======================
    // Recherche avec filtres par nom et/ou catégorie
    // =======================
    public Page<ProductResponse> searchProducts(String search, String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Product> products;

        if (search != null && !search.isEmpty() && category != null && !category.isEmpty()) {
            // Recherche par nom ET catégorie
            products = productRepository.findByNameContainingIgnoreCaseAndCategoryName(search, category, pageable);
        } else if (search != null && !search.isEmpty()) {
            // Recherche par nom uniquement
            products = productRepository.findByNameContainingIgnoreCase(search, pageable);
        } else if (category != null && !category.isEmpty()) {
            // Filtrage par catégorie uniquement
            products = productRepository.findByCategoryName(category, pageable);
        } else {
            // Tous les produits
            products = productRepository.findAll(pageable);
        }

        return products.map(this::mapToResponse);
    }

    // =======================
    // Mapper
    // =======================
    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .stockQuantity(product.getStockQuantity())
                .lienImage(product.getLienImage())
                .build();
    }
}