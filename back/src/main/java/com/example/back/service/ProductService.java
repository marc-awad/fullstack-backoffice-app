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

    public Page<ProductResponse> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Product> products = productRepository.findAll(pageable);
        return products.map(this::mapToResponse);
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
    // Recherche par nom et/ou catégorie avec pagination
    // =======================
    public Page<ProductResponse> searchProducts(String keyword, Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<Product> products;

        if (keyword != null && !keyword.isEmpty() && categoryId != null) {
            products = productRepository.findByNameContainingIgnoreCaseAndCategoryId(keyword, categoryId, pageable);
        } else if (keyword != null && !keyword.isEmpty()) {
            products = productRepository.findByNameContainingIgnoreCase(keyword, pageable);
        } else if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId, pageable);
        } else {
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
