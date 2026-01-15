package com.example.back.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Controller
public class HomeController {

    /**
     * Endpoint racine de l'application
     * Accessible sans authentification
     * Retourne une page d'accueil avec des informations sur l'API
     */
    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("appName", "Fullstack Backoffice API");
        model.addAttribute("version", "1.0.0");
        model.addAttribute("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));
        model.addAttribute("status", "Running");

        return "home";
    }
}