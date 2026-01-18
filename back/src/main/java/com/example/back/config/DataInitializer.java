package com.example.back.config;

import com.example.back.model.Categorie;
import com.example.back.model.Product;
import com.example.back.model.Role;
import com.example.back.model.User;
import com.example.back.repository.CategorieRepository;
import com.example.back.repository.ProductRepository;
import com.example.back.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
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
    private final EntityManager entityManager;

    public DataInitializer(UserRepository userRepository,
                           CategorieRepository categorieRepository,
                           ProductRepository productRepository,
                           BCryptPasswordEncoder passwordEncoder,
                           EntityManager entityManager) {
        this.userRepository = userRepository;
        this.categorieRepository = categorieRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
        this.entityManager = entityManager;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Vérifier si la base de données est déjà remplie
        if (userRepository.count() > 0) {
            System.out.println("✓ Base de données déjà initialisée. Skip de l'initialisation.");
            return;
        }

        System.out.println("========================================");
        System.out.println("  INITIALISATION DES DONNÉES DE TEST");
        System.out.println("========================================");

        // Réinitialiser les auto-increments
        resetAutoIncrements();

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
     * Réinitialise les auto-increments de toutes les tables
     */
    private void resetAutoIncrements() {
        System.out.println("\n→ Réinitialisation des auto-increments...");

        try {
            // Réinitialiser l'auto-increment de chaque table
            entityManager.createNativeQuery("ALTER TABLE users AUTO_INCREMENT = 1").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE categories AUTO_INCREMENT = 1").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE products AUTO_INCREMENT = 1").executeUpdate();
            entityManager.createNativeQuery("ALTER TABLE orders AUTO_INCREMENT = 1").executeUpdate();

            System.out.println("  ✓ Auto-increments réinitialisés à 1");
        } catch (Exception e) {
            System.out.println("  ⚠ Impossible de réinitialiser les auto-increments (normal si tables vides)");
        }
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
     * Crée 15 produits répartis dans différentes catégories avec de vraies images
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
        createProduct(
                "Smartphone Galaxy X",
                "Smartphone dernière génération avec écran AMOLED de 6.5 pouces, processeur octa-core, 128GB de stockage",
                799.99,
                25,
                electronique,
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
        );
        createProduct(
                "Ordinateur Portable Pro",
                "PC portable 15 pouces, processeur Intel i7 11ème génération, 16GB RAM DDR4, SSD 512GB",
                1299.99,
                15,
                electronique,
                "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800"
        );
        createProduct(
                "Écouteurs Bluetooth",
                "Écouteurs sans fil avec réduction de bruit active ANC, autonomie 30h, son Hi-Fi",
                149.99,
                50,
                electronique,
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
        );

        // Produits Vêtements
        createProduct(
                "T-Shirt Coton Bio",
                "T-shirt 100% coton biologique certifié GOTS, coupe régulière, plusieurs coloris disponibles",
                29.99,
                100,
                vetements,
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"
        );
        createProduct(
                "Jean Slim Fit",
                "Jean stretch confortable en denim premium, coupe moderne ajustée, délavage authentique",
                79.99,
                60,
                vetements,
                "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"
        );
        createProduct(
                "Veste d'Hiver",
                "Veste chaude et imperméable, isolation thermique 3M Thinsulate, capuche amovible",
                149.99,
                30,
                vetements,
                "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"
        );

        // Produits Alimentation
        createProduct(
                "Café Arabica Premium",
                "Café en grains 1kg, 100% arabica, torréfaction artisanale française, notes chocolatées",
                24.99,
                80,
                alimentation,
                "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800"
        );
        createProduct(
                "Chocolat Noir 85%",
                "Tablette de chocolat noir bio 100g, 85% cacao, origine Équateur, commerce équitable",
                4.99,
                200,
                alimentation,
                "https://images.unsplash.com/photo-1511381939415-e44015466834?w=800"
        );
        createProduct(
                "Miel de Montagne",
                "Miel pur 500g, production locale des Alpes, récolte artisanale, label AOP",
                12.99,
                45,
                alimentation,
                "https://images.unsplash.com/photo-1587049352846-4a222e784510?w=800"
        );

        // Produits Livres
        createProduct(
                "Guide du Développeur Java",
                "Manuel complet 650 pages pour maîtriser Java et Spring Boot, édition 2024 avec exercices pratiques",
                45.99,
                40,
                livres,
                "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800"
        );
        createProduct(
                "Roman Fantastique - Le Royaume",
                "Best-seller de fantasy, trilogie complète en coffret, 1200 pages d'aventures épiques",
                34.99,
                70,
                livres,
                "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800"
        );
        createProduct(
                "Atlas Mondial Illustré",
                "Atlas géographique grand format avec cartes détaillées HD, 400 pages, reliure luxe",
                59.99,
                20,
                livres,
                "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800"
        );

        // Produits Sport
        createProduct(
                "Tapis de Yoga Premium",
                "Tapis antidérapant 6mm d'épaisseur, matériau écologique TPE, dimensions 183x61cm, sac inclus",
                39.99,
                55,
                sport,
                "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800"
        );
        createProduct(
                "Haltères Réglables 20kg",
                "Set d'haltères ajustables par paire, poids de 2.5 à 20kg, système de verrouillage rapide",
                89.99,
                35,
                sport,
                "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800"
        );
        createProduct(
                "Ballon de Football Pro",
                "Ballon officiel FIFA taille 5, cuir synthétique haute qualité, coutures thermocollées",
                29.99,
                90,
                sport,
                "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=800"
        );

        System.out.println("  ✓ 15 produits créés dans 5 catégories différentes avec images");
    }

    /**
     * Méthode utilitaire pour créer un produit
     */
    private void createProduct(String name, String description, double price, int stock, Categorie category, String imageUrl) {
        Product product = Product.builder()
                .name(name)
                .description(description)
                .price(price)
                .stockQuantity(stock)
                .category(category)
                .createdAt(LocalDateTime.now())
                .lienImage(imageUrl)
                .build();

        productRepository.save(product);
    }
}