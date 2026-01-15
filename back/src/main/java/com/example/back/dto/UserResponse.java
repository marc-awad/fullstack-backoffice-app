package com.example.back.dto;

import com.example.back.model.Role;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private Set<Role> roles;
    private boolean enabled;
    private LocalDateTime createdAt;
}
