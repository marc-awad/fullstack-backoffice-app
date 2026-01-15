package com.example.back.service;

import com.example.back.dto.OrderRequest;
import com.example.back.dto.OrderResponse;
import com.example.back.exception.ProductNotFoundException;
import com.example.back.model.Order;
import com.example.back.model.OrderItem;
import com.example.back.model.OrderStatus;
import com.example.back.model.Product;
import com.example.back.model.User;
import com.example.back.repository.OrderRepository;
import com.example.back.repository.ProductRepository;
import com.example.back.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Créer une nouvelle commande
     */
    public OrderResponse createOrder(OrderRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Utiliser un container mutable pour totalAmount
        double[] totalAmount = {0};

        List<OrderItem> orderItems = request.getItems().stream().map(itemReq -> {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ProductNotFoundException("Product not found: " + itemReq.getProductId()));

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new IllegalArgumentException("Not enough stock for product: " + product.getName());
            }

            // Mettre à jour le stock
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);

            // Ajouter au total
            totalAmount[0] += product.getPrice() * itemReq.getQuantity();

            return OrderItem.builder()
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(product.getPrice())
                    .build();
        }).collect(Collectors.toList());

        Order order = Order.builder()
                .user(user)
                .orderDate(LocalDateTime.now())
                .totalAmount(totalAmount[0])
                .status(OrderStatus.PENDING)
                .items(orderItems)
                .build();

        Order savedOrder = orderRepository.save(order);

        List<OrderResponse.OrderItemResponse> responseItems = savedOrder.getItems().stream()
                .map(i -> OrderResponse.OrderItemResponse.builder()
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .orderId(savedOrder.getId())
                .userId(user.getId())
                .orderDate(savedOrder.getOrderDate())
                .totalAmount(savedOrder.getTotalAmount())
                .status(savedOrder.getStatus().name())
                .items(responseItems)
                .build();
    }


    /**
     * Récupérer les commandes d'un utilisateur
     */
    public List<OrderResponse> getOrdersByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return orderRepository.findByUser(user).stream().map(order -> {
            List<OrderResponse.OrderItemResponse> responseItems = order.getItems().stream()
                    .map(i -> OrderResponse.OrderItemResponse.builder()
                            .productId(i.getProductId())
                            .productName(i.getProductName())
                            .quantity(i.getQuantity())
                            .unitPrice(i.getUnitPrice())
                            .build())
                    .collect(Collectors.toList());

            return OrderResponse.builder()
                    .orderId(order.getId())
                    .userId(user.getId())
                    .orderDate(order.getOrderDate())
                    .totalAmount(order.getTotalAmount())
                    .status(order.getStatus().name())
                    .items(responseItems)
                    .build();
        }).collect(Collectors.toList());
    }
}
