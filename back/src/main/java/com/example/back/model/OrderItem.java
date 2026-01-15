package com.example.back.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem implements Serializable {

    private Long productId;

    private String productName;

    private int quantity;

    private double unitPrice;
}
