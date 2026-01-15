package com.example.back.service;

import com.example.back.dto.OrderRequest;
import com.example.back.dto.OrderResponse;
import com.example.back.exception.ProductNotFoundException;
import com.example.back.model.*;
import com.example.back.repository.OrderRepository;
import com.example.back.repository.ProductRepository;
import com.example.back.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderService orderService;

    private User user;
    private Product product1;
    private Product product2;
    private Categorie category;
    private OrderRequest orderRequest;
    private Order order;

    @BeforeEach
    void setUp() {
        // Setup User
        user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("password")
                .roles(Collections.singleton(Role.USER))
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        // Setup Category
        category = Categorie.builder()
                .id(1L)
                .name("Electronics")
                .build();

        // Setup Products
        product1 = Product.builder()
                .id(1L)
                .name("Laptop")
                .description("High-performance laptop")
                .price(999.99)
                .category(category)
                .stockQuantity(10)
                .createdAt(LocalDateTime.now())
                .build();

        product2 = Product.builder()
                .id(2L)
                .name("Mouse")
                .description("Wireless mouse")
                .price(29.99)
                .category(category)
                .stockQuantity(20)
                .createdAt(LocalDateTime.now())
                .build();

        // Setup OrderRequest
        OrderRequest.OrderItemRequest item1 = new OrderRequest.OrderItemRequest();
        item1.setProductId(1L);
        item1.setQuantity(2);

        OrderRequest.OrderItemRequest item2 = new OrderRequest.OrderItemRequest();
        item2.setProductId(2L);
        item2.setQuantity(3);

        orderRequest = new OrderRequest();
        orderRequest.setUserId(1L);
        orderRequest.setItems(Arrays.asList(item1, item2));

        // Setup Order
        List<OrderItem> orderItems = Arrays.asList(
                OrderItem.builder()
                        .productId(1L)
                        .productName("Laptop")
                        .quantity(2)
                        .unitPrice(999.99)
                        .build(),
                OrderItem.builder()
                        .productId(2L)
                        .productName("Mouse")
                        .quantity(3)
                        .unitPrice(29.99)
                        .build()
        );

        order = Order.builder()
                .id(1L)
                .user(user)
                .orderDate(LocalDateTime.now())
                .totalAmount(2089.95) // (999.99 * 2) + (29.99 * 3)
                .status(OrderStatus.PENDING)
                .items(orderItems)
                .build();
    }

    // ========================================
    // Tests pour createOrder()
    // ========================================

    @Test
    void createOrder_Success() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));
        when(productRepository.findById(2L)).thenReturn(Optional.of(product2));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        // When
        OrderResponse response = orderService.createOrder(orderRequest);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.getOrderId());
        assertEquals(1L, response.getUserId());
        assertEquals(2089.95, response.getTotalAmount(), 0.01);
        assertEquals("PENDING", response.getStatus());
        assertEquals(2, response.getItems().size());

        // Verify stock was updated
        verify(productRepository).save(argThat(p ->
                p.getId().equals(1L) && p.getStockQuantity() == 8 // 10 - 2
        ));
        verify(productRepository).save(argThat(p ->
                p.getId().equals(2L) && p.getStockQuantity() == 17 // 20 - 3
        ));

        // Verify order was saved
        verify(orderRepository).save(argThat(savedOrder ->
                savedOrder.getUser().getId().equals(1L) &&
                        savedOrder.getStatus() == OrderStatus.PENDING &&
                        savedOrder.getItems().size() == 2 &&
                        Math.abs(savedOrder.getTotalAmount() - 2089.95) < 0.01
        ));
    }

    @Test
    void createOrder_ThrowsException_WhenUserNotFound() {
        // Given
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        OrderRequest invalidRequest = new OrderRequest();
        invalidRequest.setUserId(999L);
        invalidRequest.setItems(Collections.emptyList());

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> orderService.createOrder(invalidRequest)
        );

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(999L);
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void createOrder_ThrowsException_WhenProductNotFound() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        OrderRequest.OrderItemRequest item = new OrderRequest.OrderItemRequest();
        item.setProductId(1L);
        item.setQuantity(2);

        OrderRequest request = new OrderRequest();
        request.setUserId(1L);
        request.setItems(Collections.singletonList(item));

        // When & Then
        ProductNotFoundException exception = assertThrows(
                ProductNotFoundException.class,
                () -> orderService.createOrder(request)
        );

        assertEquals("Product not found: 1", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(productRepository).findById(1L);
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void createOrder_ThrowsException_WhenInsufficientStock() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));

        OrderRequest.OrderItemRequest item = new OrderRequest.OrderItemRequest();
        item.setProductId(1L);
        item.setQuantity(15); // Plus que le stock disponible (10)

        OrderRequest request = new OrderRequest();
        request.setUserId(1L);
        request.setItems(Collections.singletonList(item));

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> orderService.createOrder(request)
        );

        assertEquals("Not enough stock for product: Laptop", exception.getMessage());
        verify(userRepository).findById(1L);
        verify(productRepository).findById(1L);
        verify(productRepository, never()).save(any(Product.class));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void createOrder_CalculatesTotalAmountCorrectly() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        OrderRequest.OrderItemRequest item = new OrderRequest.OrderItemRequest();
        item.setProductId(1L);
        item.setQuantity(3);

        OrderRequest request = new OrderRequest();
        request.setUserId(1L);
        request.setItems(Collections.singletonList(item));

        // When
        OrderResponse response = orderService.createOrder(request);

        // Then
        double expectedTotal = 999.99 * 3; // 2999.97
        assertEquals(expectedTotal, response.getTotalAmount(), 0.01);

        verify(orderRepository).save(argThat(savedOrder ->
                Math.abs(savedOrder.getTotalAmount() - expectedTotal) < 0.01
        ));
    }

    @Test
    void createOrder_UpdatesStockCorrectly() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        OrderRequest.OrderItemRequest item = new OrderRequest.OrderItemRequest();
        item.setProductId(1L);
        item.setQuantity(5);

        OrderRequest request = new OrderRequest();
        request.setUserId(1L);
        request.setItems(Collections.singletonList(item));

        // When
        orderService.createOrder(request);

        // Then
        verify(productRepository).save(argThat(p ->
                p.getId().equals(1L) && p.getStockQuantity() == 5 // 10 - 5
        ));
    }

    @Test
    void createOrder_WithMultipleItems_UpdatesAllStocks() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));
        when(productRepository.findById(2L)).thenReturn(Optional.of(product2));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        // When
        orderService.createOrder(orderRequest);

        // Then
        verify(productRepository, times(2)).save(any(Product.class));
        verify(productRepository).save(argThat(p ->
                p.getId().equals(1L) && p.getStockQuantity() == 8
        ));
        verify(productRepository).save(argThat(p ->
                p.getId().equals(2L) && p.getStockQuantity() == 17
        ));
    }

    @Test
    void createOrder_SetsOrderStatusToPending() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product1));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        OrderRequest.OrderItemRequest item = new OrderRequest.OrderItemRequest();
        item.setProductId(1L);
        item.setQuantity(1);

        OrderRequest request = new OrderRequest();
        request.setUserId(1L);
        request.setItems(Collections.singletonList(item));

        // When
        OrderResponse response = orderService.createOrder(request);

        // Then
        assertEquals("PENDING", response.getStatus());
        verify(orderRepository).save(argThat(savedOrder ->
                savedOrder.getStatus() == OrderStatus.PENDING
        ));
    }

    // ========================================
    // Tests pour getOrdersByUser()
    // ========================================

    @Test
    void getOrdersByUser_Success() {
        // Given
        Order order2 = Order.builder()
                .id(2L)
                .user(user)
                .orderDate(LocalDateTime.now().minusDays(1))
                .totalAmount(500.0)
                .status(OrderStatus.DELIVERED)
                .items(Collections.singletonList(
                        OrderItem.builder()
                                .productId(1L)
                                .productName("Laptop")
                                .quantity(1)
                                .unitPrice(500.0)
                                .build()
                ))
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(orderRepository.findByUser(user)).thenReturn(Arrays.asList(order, order2));

        // When
        List<OrderResponse> responses = orderService.getOrdersByUser(1L);

        // Then
        assertNotNull(responses);
        assertEquals(2, responses.size());
        assertEquals(1L, responses.get(0).getOrderId());
        assertEquals(2L, responses.get(1).getOrderId());
        assertEquals("PENDING", responses.get(0).getStatus());
        assertEquals("DELIVERED", responses.get(1).getStatus());

        verify(userRepository).findById(1L);
        verify(orderRepository).findByUser(user);
    }

    @Test
    void getOrdersByUser_ReturnsEmptyList_WhenNoOrders() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(orderRepository.findByUser(user)).thenReturn(Collections.emptyList());

        // When
        List<OrderResponse> responses = orderService.getOrdersByUser(1L);

        // Then
        assertNotNull(responses);
        assertTrue(responses.isEmpty());

        verify(userRepository).findById(1L);
        verify(orderRepository).findByUser(user);
    }

    @Test
    void getOrdersByUser_ThrowsException_WhenUserNotFound() {
        // Given
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> orderService.getOrdersByUser(999L)
        );

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(999L);
        verify(orderRepository, never()).findByUser(any(User.class));
    }

    @Test
    void getOrdersByUser_ReturnsCorrectOrderItems() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(orderRepository.findByUser(user)).thenReturn(Collections.singletonList(order));

        // When
        List<OrderResponse> responses = orderService.getOrdersByUser(1L);

        // Then
        assertNotNull(responses);
        assertEquals(1, responses.size());

        OrderResponse response = responses.get(0);
        assertEquals(2, response.getItems().size());

        OrderResponse.OrderItemResponse item1 = response.getItems().get(0);
        assertEquals(1L, item1.getProductId());
        assertEquals("Laptop", item1.getProductName());
        assertEquals(2, item1.getQuantity());
        assertEquals(999.99, item1.getUnitPrice(), 0.01);

        OrderResponse.OrderItemResponse item2 = response.getItems().get(1);
        assertEquals(2L, item2.getProductId());
        assertEquals("Mouse", item2.getProductName());
        assertEquals(3, item2.getQuantity());
        assertEquals(29.99, item2.getUnitPrice(), 0.01);
    }
}