package com.example.back.dto;

import com.example.back.model.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;

@Data
public class UpdateUserRequest {

    @NotNull(message = "Enabled status is required")
    private Boolean enabled;

    @NotNull(message = "Roles are required")
    private Set<Role> roles;
}
