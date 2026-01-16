package com.example.back.repository;

import com.example.back.model.Order;
import com.example.back.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);

    // Compter les commandes après une certaine date
    long countByOrderDateAfter(LocalDateTime date);

    // Calculer le revenu total
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o")
    Double sumTotalAmount();
}