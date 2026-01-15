package com.example.back.service;

import com.example.back.dto.ProductRequest;
import com.example.back.dto.ProductResponse;
import com.example.back.exception.ProductNotFoundException;
import com.example.back.model.Categorie;
import com.example.back.model.Product;
import com.example.back.repository.CategorieRepository;
import com.example.back.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategorieRepository categorieRepository;

    @InjectMocks
    private ProductService productService;

    private ProductRequest productRequest;
    private Product product;
    private Categorie category;

    @BeforeEach
    void setUp() {
        category = Categorie.builder()
                .id(1L)
                .name("Electronics")
                .build();

        productRequest = new ProductRequest();
        productRequest.setName("Laptop");
        productRequest.setDescription("High-performance laptop");
        productRequest.setPrice(999.99);
        productRequest.setCategoryId(1L);
        productRequest.setStockQuantity(10);
        productRequest.setLienImage("http://example.com/laptop.jpg");

        product = Product.builder()
                .id(1L)
                .name("Laptop")
                .description("High-performance laptop")
                .price(999.99)
                .category(category)
                .stockQuantity(10)
                .lienImage("http://example.com/laptop.jpg")
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ========================================
    // Tests pour createProduct()
    // ========================================

    @Test
    void createProduct_Success() {
        // Given
        when(categorieRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        // When
        ProductResponse response = productService.createProduct(productRequest);

        // Then
        assertNotNull(response);
        assertEquals("Laptop", response.getName());
        assertEquals(999.99, response.getPrice());
        assertEquals(10, response.getStockQuantity());
        assertEquals(1L, response.getCategoryId());
        assertEquals("Electronics", response.getCategoryName());

        verify(categorieRepository).findById(1L);
        verify(productRepository).save(argThat(savedProduct ->
                savedProduct.getName().equals("Laptop") &&
                        savedProduct.getPrice() == 999.99 &&
                        savedProduct.getStockQuantity() == 10 &&
                        savedProduct.getCategory().getId().equals(1L)
        ));
    }

    @Test
    void createProduct_ThrowsException_WhenCategoryNotFound() {
        // Given
        when(categorieRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        ProductNotFoundException exception = assertThrows(
                ProductNotFoundException.class,
                () -> productService.createProduct(productRequest)
        );

        assertEquals("Category not found", exception.getMessage());
        verify(categorieRepository).findById(1L);
        verify(productRepository, never()).save(any(Product.class));
    }

    // ========================================
    // Tests pour getProduct()
    // ========================================

    @Test
    void getProduct_Success() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        // When
        ProductResponse response = productService.getProduct(1L);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Laptop", response.getName());
        assertEquals(999.99, response.getPrice());

        verify(productRepository).findById(1L);
    }

    @Test
    void getProduct_ThrowsException_WhenProductNotFound() {
        // Given
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        ProductNotFoundException exception = assertThrows(
                ProductNotFoundException.class,
                () -> productService.getProduct(999L)
        );

        assertEquals("Product not found with id: 999", exception.getMessage());
        verify(productRepository).findById(999L);
    }

    // ========================================
    // Tests pour getAllProducts()
    // ========================================

    @Test
    void getAllProducts_Success() {
        // Given
        Product product2 = Product.builder()
                .id(2L)
                .name("Mouse")
                .description("Wireless mouse")
                .price(29.99)
                .category(category)
                .stockQuantity(50)
                .build();

        Page<Product> productPage = new PageImpl<>(
                Arrays.asList(product, product2),
                PageRequest.of(0, 10, Sort.by("id").descending()),
                2
        );

        when(productRepository.findAll(any(Pageable.class))).thenReturn(productPage);

        // When
        Page<ProductResponse> result = productService.getAllProducts(0, 10);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertEquals(2, result.getContent().size());
        assertEquals("Laptop", result.getContent().get(0).getName());
        assertEquals("Mouse", result.getContent().get(1).getName());

        verify(productRepository).findAll(any(Pageable.class));
    }

    @Test
    void getAllProducts_ReturnsEmptyPage_WhenNoProducts() {
        // Given
        Page<Product> emptyPage = new PageImpl<>(
                Collections.emptyList(),
                PageRequest.of(0, 10, Sort.by("id").descending()),
                0
        );

        when(productRepository.findAll(any(Pageable.class))).thenReturn(emptyPage);

        // When
        Page<ProductResponse> result = productService.getAllProducts(0, 10);

        // Then
        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
        assertTrue(result.getContent().isEmpty());

        verify(productRepository).findAll(any(Pageable.class));
    }

    // ========================================
    // Tests pour updateProduct()
    // ========================================

    @Test
    void updateProduct_Success() {
        // Given
        ProductRequest updateRequest = new ProductRequest();
        updateRequest.setName("Updated Laptop");
        updateRequest.setDescription("Updated description");
        updateRequest.setPrice(1299.99);
        updateRequest.setCategoryId(1L);
        updateRequest.setStockQuantity(5);
        updateRequest.setLienImage("http://example.com/updated.jpg");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(categorieRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        // When
        ProductResponse response = productService.updateProduct(1L, updateRequest);

        // Then
        assertNotNull(response);
        verify(productRepository).findById(1L);
        verify(categorieRepository).findById(1L);
        verify(productRepository).save(argThat(savedProduct ->
                savedProduct.getName().equals("Updated Laptop") &&
                        savedProduct.getPrice() == 1299.99 &&
                        savedProduct.getStockQuantity() == 5
        ));
    }

    @Test
    void updateProduct_ThrowsException_WhenProductNotFound() {
        // Given
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        ProductNotFoundException exception = assertThrows(
                ProductNotFoundException.class,
                () -> productService.updateProduct(999L, productRequest)
        );

        assertEquals("Product not found with id: 999", exception.getMessage());
        verify(productRepository).findById(999L);
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void updateProduct_ThrowsException_WhenCategoryNotFound() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(categorieRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        ProductNotFoundException exception = assertThrows(
                ProductNotFoundException.class,
                () -> productService.updateProduct(1L, productRequest)
        );

        assertEquals("Category not found", exception.getMessage());
        verify(productRepository).findById(1L);
        verify(categorieRepository).findById(1L);
        verify(productRepository, never()).save(any(Product.class));
    }

    // ========================================
    // Tests pour deleteProduct()
    // ========================================

    @Test
    void deleteProduct_Success() {
        // Given
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        doNothing().when(productRepository).delete(any(Product.class));

        // When
        productService.deleteProduct(1L);

        // Then
        verify(productRepository).findById(1L);
        verify(productRepository).delete(product);
    }

    @Test
    void deleteProduct_ThrowsException_WhenProductNotFound() {
        // Given
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        ProductNotFoundException exception = assertThrows(
                ProductNotFoundException.class,
                () -> productService.deleteProduct(999L)
        );

        assertEquals("Product not found with id: 999", exception.getMessage());
        verify(productRepository).findById(999L);
        verify(productRepository, never()).delete(any(Product.class));
    }

    // ========================================
    // Tests pour searchProducts()
    // ========================================

    @Test
    void searchProducts_WithKeywordAndCategory() {
        // Given
        Page<Product> productPage = new PageImpl<>(
                Collections.singletonList(product),
                PageRequest.of(0, 10, Sort.by("id").descending()),
                1
        );

        when(productRepository.findByNameContainingIgnoreCaseAndCategoryId(
                eq("Laptop"), eq(1L), any(Pageable.class)
        )).thenReturn(productPage);

        // When
        Page<ProductResponse> result = productService.searchProducts("Laptop", 1L, 0, 10);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Laptop", result.getContent().get(0).getName());

        verify(productRepository).findByNameContainingIgnoreCaseAndCategoryId(
                eq("Laptop"), eq(1L), any(Pageable.class)
        );
    }

    @Test
    void searchProducts_WithKeywordOnly() {
        // Given
        Page<Product> productPage = new PageImpl<>(
                Collections.singletonList(product),
                PageRequest.of(0, 10, Sort.by("id").descending()),
                1
        );

        when(productRepository.findByNameContainingIgnoreCase(
                eq("Laptop"), any(Pageable.class)
        )).thenReturn(productPage);

        // When
        Page<ProductResponse> result = productService.searchProducts("Laptop", null, 0, 10);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());

        verify(productRepository).findByNameContainingIgnoreCase(eq("Laptop"), any(Pageable.class));
    }

    @Test
    void searchProducts_WithCategoryOnly() {
        // Given
        Page<Product> productPage = new PageImpl<>(
                Collections.singletonList(product),
                PageRequest.of(0, 10, Sort.by("id").descending()),
                1
        );

        when(productRepository.findByCategoryId(eq(1L), any(Pageable.class)))
                .thenReturn(productPage);

        // When
        Page<ProductResponse> result = productService.searchProducts(null, 1L, 0, 10);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());

        verify(productRepository).findByCategoryId(eq(1L), any(Pageable.class));
    }

    @Test
    void searchProducts_WithNoFilters() {
        // Given
        Page<Product> productPage = new PageImpl<>(
                Collections.singletonList(product),
                PageRequest.of(0, 10, Sort.by("id").descending()),
                1
        );

        when(productRepository.findAll(any(Pageable.class))).thenReturn(productPage);

        // When
        Page<ProductResponse> result = productService.searchProducts(null, null, 0, 10);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());

        verify(productRepository).findAll(any(Pageable.class));
    }

    @Test
    void searchProducts_WithEmptyKeyword() {
        // Given
        Page<Product> productPage = new PageImpl<>(
                Collections.singletonList(product),
                PageRequest.of(0, 10, Sort.by("id").descending()),
                1
        );

        when(productRepository.findByCategoryId(eq(1L), any(Pageable.class)))
                .thenReturn(productPage);

        // When
        Page<ProductResponse> result = productService.searchProducts("", 1L, 0, 10);

        // Then
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());

        verify(productRepository).findByCategoryId(eq(1L), any(Pageable.class));
    }
}