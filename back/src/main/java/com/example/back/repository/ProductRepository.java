package com.example.back.repository;

import com.example.back.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    // Recherche par nom (insensible à la casse)
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // Filtrage par catégorie
    Page<Product> findByCategoryName(String categoryName, Pageable pageable);

    // Recherche par nom ET catégorie
    Page<Product> findByNameContainingIgnoreCaseAndCategoryName(String name, String categoryName, Pageable pageable);

    // Compter les produits avec un stock faible
    long countByStockQuantityLessThan(int stockQuantity);
}