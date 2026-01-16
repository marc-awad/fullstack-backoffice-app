package com.example.back.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOwnProfileRequest {

    @NotBlank(message = "Le nom d'utilisateur est requis")
    private String username;

    @Email(message = "L'email doit être valide")
    @NotBlank(message = "L'email est requis")
    private String email;
}