package com.example.back.controller;

import com.example.back.dto.OrderRequest;
import com.example.back.dto.OrderResponse;
import com.example.back.model.User;
import com.example.back.repository.UserRepository;
import com.example.back.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
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
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
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