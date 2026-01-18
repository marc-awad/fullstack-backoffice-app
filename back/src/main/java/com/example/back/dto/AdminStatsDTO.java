package com.example.back.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDTO {
    private Long totalProducts;
    private Long totalUsers;
    private Long totalOrders;
    private Double totalRevenue;
    private Long recentOrders;
    private Long lowStockProducts;
}