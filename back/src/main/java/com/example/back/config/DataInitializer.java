package com.example.back.config;

import com.example.back.model.Categorie;
import com.example.back.model.Product;
import com.example.back.model.Role;
import com.example.back.model.User;
import com.example.back.repository.CategorieRepository;
import com.example.back.repository.ProductRepository;
import com.example.back.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Initialise la base de données avec des données de test au démarrage de l'application
 * S'exécute uniquement si la base est vide
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategorieRepository categorieRepository;
    private final ProductRepository productRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategorieRepository categorieRepository,
                           ProductRepository productRepository,
                           BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categorieRepository = categorieRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Vérifier si la base de données est déjà remplie
        if (userRepository.count() > 0) {
            System.out.println("✓ Base de données déjà initialisée. Skip de l'initialisation.");
            return;
        }

        System.out.println("========================================");
        System.out.println("  INITIALISATION DES DONNÉES DE TEST");
        System.out.println("========================================");

        // 1. Créer les utilisateurs
        createUsers();

        // 2. Créer les catégories
        createCategories();

        // 3. Créer les produits
        createProducts();

        System.out.println("========================================");
        System.out.println("  ✓ INITIALISATION TERMINÉE AVEC SUCCÈS");
        System.out.println("========================================");
    }

    /**
     * Crée 2 utilisateurs : 1 USER et 1 ADMIN
     */
    private void createUsers() {
        System.out.println("\n→ Création des utilisateurs...");

        // Utilisateur normal
        User user = User.builder()
                .username("user")
                .email("user@example.com")
                .password(passwordEncoder.encode("password123"))
                .roles(Set.of(Role.USER))
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .orders(new HashSet<>())
                .build();

        // Administrateur
        User admin = User.builder()
                .username("admin")
                .email("admin@example.com")
                .password(passwordEncoder.encode("admin123"))
                .roles(Set.of(Role.ADMIN, Role.USER))
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .orders(new HashSet<>())
                .build();

        userRepository.save(user);
        userRepository.save(admin);

        System.out.println("  ✓ 2 utilisateurs créés");
        System.out.println("    - user@example.com / password123 (USER)");
        System.out.println("    - admin@example.com / admin123 (ADMIN)");
    }

    /**
     * Crée 5 catégories de produits
     */
    private void createCategories() {
        System.out.println("\n→ Création des catégories...");

        String[] categoriesNames = {
                "Électronique",
                "Vêtements",
                "Alimentation",
                "Livres",
                "Sport"
        };

        for (String name : categoriesNames) {
            Categorie categorie = Categorie.builder()
                    .name(name)
                    .products(new HashSet<>())
                    .build();
            categorieRepository.save(categorie);
        }

        System.out.println("  ✓ 5 catégories créées : " + String.join(", ", categoriesNames));
    }

    /**
     * Crée 15 produits répartis dans différentes catégories
     */
    private void createProducts() {
        System.out.println("\n→ Création des produits...");

        // Récupérer les catégories
        Categorie electronique = categorieRepository.findByName("Électronique").orElseThrow();
        Categorie vetements = categorieRepository.findByName("Vêtements").orElseThrow();
        Categorie alimentation = categorieRepository.findByName("Alimentation").orElseThrow();
        Categorie livres = categorieRepository.findByName("Livres").orElseThrow();
        Categorie sport = categorieRepository.findByName("Sport").orElseThrow();

        // Produits Électronique
        createProduct("Smartphone Galaxy X", "Smartphone dernière génération avec écran AMOLED", 799.99, 25, electronique);
        createProduct("Ordinateur Portable Pro", "PC portable 15 pouces, processeur i7, 16GB RAM", 1299.99, 15, electronique);
        createProduct("Écouteurs Bluetooth", "Écouteurs sans fil avec réduction de bruit active", 149.99, 50, electronique);

        // Produits Vêtements
        createProduct("T-Shirt Coton Bio", "T-shirt 100% coton biologique, plusieurs coloris", 29.99, 100, vetements);
        createProduct("Jean Slim Fit", "Jean stretch confortable, coupe moderne", 79.99, 60, vetements);
        createProduct("Veste d'Hiver", "Veste chaude et imperméable, isolation thermique", 149.99, 30, vetements);

        // Produits Alimentation
        createProduct("Café Arabica Premium", "Café en grains 1kg, torréfaction artisanale", 24.99, 80, alimentation);
        createProduct("Chocolat Noir 85%", "Tablette de chocolat noir bio, origine Équateur", 4.99, 200, alimentation);
        createProduct("Miel de Montagne", "Miel pur 500g, production locale", 12.99, 45, alimentation);

        // Produits Livres
        createProduct("Guide du Développeur Java", "Manuel complet pour maîtriser Java et Spring Boot", 45.99, 40, livres);
        createProduct("Roman Fantastique - Le Royaume", "Best-seller de fantasy, trilogie complète", 34.99, 70, livres);
        createProduct("Atlas Mondial Illustré", "Atlas géographique avec cartes détaillées", 59.99, 20, livres);

        // Produits Sport
        createProduct("Tapis de Yoga Premium", "Tapis antidérapant 6mm, matériau écologique", 39.99, 55, sport);
        createProduct("Haltères Réglables 20kg", "Set d'haltères ajustables, parfait pour home gym", 89.99, 35, sport);
        createProduct("Ballon de Football Pro", "Ballon officiel taille 5, cuir synthétique", 29.99, 90, sport);

        System.out.println("  ✓ 15 produits créés dans 5 catégories différentes");
    }

    /**
     * Méthode utilitaire pour créer un produit
     */
    private void createProduct(String name, String description, double price, int stock, Categorie category) {
        Product product = Product.builder()
                .name(name)
                .description(description)
                .price(price)
                .stockQuantity(stock)
                .category(category)
                .createdAt(LocalDateTime.now())
                .lienImage(null) // Pas d'images pour l'instant
                .build();

        productRepository.save(product);
    }
}