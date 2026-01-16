package com.example.back.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDTO {

    private long totalProducts;
    private long totalUsers;
    private long totalOrders;
    private double totalRevenue;
    private long recentOrders;
    private long lowStockProducts;
}
