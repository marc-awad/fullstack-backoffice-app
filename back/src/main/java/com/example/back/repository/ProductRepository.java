package com.example.back.repository;

import com.example.back.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // Recherche par nom avec pagination
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // Recherche par catégorie avec pagination
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    // Recherche combinée nom + catégorie avec pagination
    Page<Product> findByNameContainingIgnoreCaseAndCategoryId(String name, Long categoryId, Pageable pageable);
}
