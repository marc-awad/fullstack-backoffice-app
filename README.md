# Fullstack Backoffice Application

Application de gestion de commerce en ligne (backoffice) développée avec Spring Boot et React + TypeScript.

## Description

Cette application fullstack permet la gestion complète d'une plateforme e-commerce avec trois niveaux d'accès :

- **Public** : Consultation des produits
- **Utilisateur connecté** : Passage de commandes, suivi des commandes, gestion du profil
- **Administrateur** : Gestion complète des produits, utilisateurs, commandes et statistiques

## Fonctionnalités

### Interface Publique

- Consultation du catalogue de produits avec images (Unsplash)
- Filtrage par catégorie (5 catégories disponibles)
- Recherche de produits
- Pagination
- Détail des produits

### Espace Utilisateur

- Inscription et connexion (JWT)
- Création de commandes avec panier
- Consultation de l'historique des commandes
- Gestion du profil personnel
- Modification des informations

### Espace Administrateur

- **Dashboard** avec statistiques en temps réel :
  - Chiffre d'affaires total
  - Nombre total de commandes
  - Nombre de produits
  - Nombre d'utilisateurs
  - Commandes récentes (7 derniers jours)
  - Produits en stock faible (< 5 unités)
- **Gestion CRUD complète des produits** (création, modification, suppression)
- **Gestion des utilisateurs** (modification de rôles et statut)
- **Visualisation des tendances** (ventes, nouveaux clients, taux de conversion)

## Technologies Utilisées

### Backend

- **Java 17**
- **Spring Boot 3.4.1**
- **Spring Security** avec authentification JWT
- **Spring Data JPA** (persistence)
- **Spring Validation** (validation des données)
- **MySQL 8.0** (base de données)
- **Maven** (gestion des dépendances)
- **Lombok** (réduction du boilerplate)
- **Thymeleaf** (template engine)
- **SpringDoc OpenAPI 2.7.0** (documentation API Swagger)
- **JWT (jjwt) 0.12.5** (tokens d'authentification)

### Frontend

- **React 19.2.0**
- **TypeScript 5.9.3**
- **React Router v7.12.0** (navigation)
- **Axios 1.13.2** (requêtes HTTP)
- **Vite 7.2.4** (build tool)
- **Lucide React 0.562.0** (icônes)
- **React Hot Toast 2.6.0** (notifications)
- **CSS3** (styling personnalisé)

### Tests et Qualité

- **JUnit 5.10.1** (tests unitaires)
- **Mockito 5.7.0** (mocking)
- **AssertJ 3.24.2** (assertions fluides)
- **JaCoCo 0.8.11** (couverture de code à 70% minimum)
- **Maven Surefire 3.2.3** (exécution des tests)

## Structure de la Base de Données

### Tables principales

#### `users`

| Colonne    | Type         | Contraintes            | Description                 |
| ---------- | ------------ | ---------------------- | --------------------------- |
| id         | BIGINT       | PK, Auto-increment     | Identifiant unique          |
| username   | VARCHAR(255) | NOT NULL, UNIQUE       | Nom d'utilisateur           |
| email      | VARCHAR(255) | NOT NULL, UNIQUE       | Email                       |
| password   | VARCHAR(255) | NOT NULL               | Mot de passe hashé (BCrypt) |
| enabled    | BOOLEAN      | NOT NULL, DEFAULT true | Compte actif/désactivé      |
| created_at | DATETIME     | NOT NULL               | Date de création            |
| roles      | (Collection) | EAGER                  | USER et/ou ADMIN            |

#### `products`

| Colonne        | Type         | Contraintes        | Description               |
| -------------- | ------------ | ------------------ | ------------------------- |
| id             | BIGINT       | PK, Auto-increment | Identifiant unique        |
| name           | VARCHAR(255) | NOT NULL           | Nom du produit            |
| description    | TEXT         |                    | Description détaillée     |
| price          | DOUBLE       | NOT NULL, MIN 0    | Prix unitaire             |
| stock_quantity | INT          | NOT NULL, MIN 0    | Quantité en stock         |
| category_id    | BIGINT       | FK → categories    | Catégorie du produit      |
| created_at     | DATETIME     |                    | Date de création          |
| lien_image     | VARCHAR(500) |                    | URL de l'image (Unsplash) |

#### `categories`

| Colonne | Type         | Contraintes        | Description         |
| ------- | ------------ | ------------------ | ------------------- |
| id      | BIGINT       | PK, Auto-increment | Identifiant unique  |
| name    | VARCHAR(255) | NOT NULL           | Nom de la catégorie |

#### `orders`

| Colonne      | Type     | Contraintes        | Description                                        |
| ------------ | -------- | ------------------ | -------------------------------------------------- |
| id           | BIGINT   | PK, Auto-increment | Identifiant unique                                 |
| user_id      | BIGINT   | FK → users         | Utilisateur                                        |
| order_date   | DATETIME | DEFAULT NOW()      | Date de la commande                                |
| total_amount | DOUBLE   | NOT NULL, MIN 0    | Montant total                                      |
| status       | ENUM     | DEFAULT PENDING    | PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED |

#### `order_items`

| Colonne    | Type   | Contraintes | Description                            |
| ---------- | ------ | ----------- | -------------------------------------- |
| order_id   | BIGINT | FK → orders | Commande associée                      |
| product_id | BIGINT |             | ID du produit                          |
| quantity   | INT    | MIN 1       | Quantité commandée                     |
| price      | DOUBLE |             | Prix unitaire au moment de la commande |

### Relations

- Un utilisateur peut avoir plusieurs commandes (1:N)
- Une commande contient plusieurs produits via order_items (N:N)
- Un produit appartient à une catégorie (N:1)

### Catégories par défaut

1. Électronique
2. Vêtements
3. Alimentation
4. Livres
5. Sport

## Installation et Exécution

### Prérequis

- **Java JDK 17** ou supérieur
- **Node.js 18+** et npm
- **MySQL 8.0+**
- **Git**

### 1. Cloner le repository

```bash
git clone https://github.com/marc-awad/fullstack-backoffice-app.git
cd fullstack-backoffice-app
```

### 2. Configuration de la base de données

#### Créer la base de données MySQL

```sql
CREATE DATABASE fullstack_backoffice_db;
```

#### Configurer les credentials

Modifiez `back/src/main/resources/application.properties` :

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/fullstack_backoffice_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=votre_mot_de_passe
```

### 3. Installation et lancement du Backend

```bash
cd back

# Avec Maven Wrapper (recommandé)
./mvnw clean install
./mvnw spring-boot:run

# Ou avec Maven installé
mvn clean install
mvn spring-boot:run
```

Le backend sera accessible sur **`http://localhost:8080`**

**Documentation API Swagger** : `http://localhost:8080/swagger-ui/index.html`

### 4. Installation et lancement du Frontend

```bash
cd front

# Installation des dépendances
npm install

# Lancement en mode développement
npm run dev
```

Le frontend sera accessible sur **`http://localhost:5173`**

### 5. Configuration de l'environnement Frontend

Le fichier `.env` est déjà configuré dans le projet :

```env
VITE_API_URL=http://localhost:8080/api
```

## Comptes par défaut

Après le premier lancement, des données de test sont automatiquement créées par `DataInitializer.java` :

### Administrateur

- **Email** : `admin@example.com`
- **Mot de passe** : `admin123`
- **Rôles** : ADMIN, USER

### Utilisateur standard

- **Email** : `user@example.com`
- **Mot de passe** : `password123`
- **Rôle** : USER

### Données de démonstration

- **15 produits** répartis dans 5 catégories avec images Unsplash
- **5 catégories** : Électronique, Vêtements, Alimentation, Livres, Sport
- Les auto-increments sont réinitialisés à 1 au premier lancement

## Tests

### Lancer tous les tests

```bash
cd back
./mvnw test
```

### Tests disponibles

- **UserServiceTest** : 11 tests (création, mise à jour, gestion des rôles)
- **ProductServiceTest** : 14 tests (CRUD, validation, stock)
- **OrderServiceTest** : 16 tests (création, calcul, statuts)

### Couverture de code

Le projet utilise **JaCoCo** avec un minimum de **70% de couverture** :

```bash
./mvnw test jacoco:report
```

Rapport disponible dans : `target/site/jacoco/index.html`

## Structure du Projet

### Backend (`/back`)

```
src/main/java/com/example/back/
├── config/
│   ├── DataInitializer.java     # Initialisation des données de test
│   └── OpenApiConfig.java       # Configuration Swagger
├── controller/
│   ├── AdminController.java     # Endpoints admin (/api/admin/*)
│   ├── AuthController.java      # Authentification (/api/auth/*)
│   ├── HomeController.java      # Page d'accueil
│   ├── OrderController.java     # Gestion des commandes
│   ├── ProductController.java   # Consultation des produits
│   └── UserController.java      # Gestion du profil utilisateur
├── dto/
│   ├── AdminStatsDTO.java       # Statistiques du dashboard
│   ├── AuthResponse.java
│   ├── LoginRequest.java
│   ├── OrderRequest.java
│   ├── OrderResponse.java
│   ├── ProductRequest.java
│   ├── ProductResponse.java
│   ├── RegisterRequest.java
│   ├── UpdateOwnProfileRequest.java
│   ├── UpdateUserRequest.java
│   ├── UserProfileResponse.java
│   └── UserResponse.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── InvalidCredentialsException.java
│   ├── ProductNotFoundException.java
│   └── UserAlreadyExistsException.java
├── model/
│   ├── Categorie.java
│   ├── Order.java
│   ├── OrderItem.java
│   ├── OrderStatus.java         # PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
│   ├── Product.java
│   ├── Role.java                # USER, ADMIN
│   └── User.java
├── repository/
│   ├── CategorieRepository.java
│   ├── OrderRepository.java
│   ├── ProductRepository.java
│   └── UserRepository.java
├── security/
│   ├── CustomUserDetailsService.java
│   ├── JwtAuthenticationFilter.java
│   ├── JwtUtil.java
│   └── SecurityConfig.java      # Configuration CORS + JWT
└── service/
    ├── OrderService.java
    ├── ProductService.java
    └── UserService.java
```

### Frontend (`/front`)

```
src/
├── api/
│   └── axios.ts                 # Configuration Axios + intercepteurs
├── components/
│   ├── CategoryFilter.tsx       # Filtre par catégorie
│   ├── Header.tsx               # Header avec navigation
│   ├── Layout.tsx               # Layout principal
│   ├── Pagination.tsx           # Composant de pagination
│   ├── ProductCard.tsx          # Carte produit
│   ├── ProductFormModal.tsx     # Modal CRUD produit (admin)
│   ├── SearchBar.tsx            # Barre de recherche
│   └── UserFormModal.tsx        # Modal modification utilisateur (admin)
├── guards/
│   ├── AdminGuard.tsx           # Protection des routes admin
│   ├── AdminRoute.tsx
│   ├── AuthGuard.tsx            # Protection des routes utilisateur
│   └── ProtectedRoute.tsx
├── hooks/
│   └── useErrorHandler.ts       # Gestion centralisée des erreurs
├── models/
│   ├── AuthResponse.ts
│   ├── Category.ts
│   ├── CreateOrderRequest.ts
│   ├── JwtPayload.ts
│   ├── Order.ts
│   ├── OrderItem.ts
│   ├── Page.ts
│   ├── Product.ts
│   └── User.ts
├── pages/
│   ├── AdminDashboard.tsx       # Dashboard admin avec stats
│   ├── AdminProducts.tsx        # Gestion des produits
│   ├── AdminUsers.tsx           # Gestion des utilisateurs
│   ├── Home.tsx                 # Page d'accueil publique
│   ├── Login.tsx
│   ├── MyOrders.tsx             # Historique des commandes
│   ├── NewOrder.tsx             # Création de commande
│   ├── ProductDetail.tsx        # Détail d'un produit
│   ├── Profile.tsx              # Profil utilisateur
│   ├── Register.tsx
│   └── Unauthorized.tsx
├── router/
│   └── AppRouter.tsx            # Configuration des routes
├── services/
│   ├── adminService.ts          # API admin (stats, users)
│   ├── authService.ts           # Authentification JWT
│   ├── errorHandler.ts          # Gestion des erreurs HTTP
│   ├── orderService.ts          # API commandes
│   ├── productService.ts        # API produits
│   ├── toastService.ts          # Notifications toast
│   └── userService.ts           # API utilisateur
└── style/
    ├── AdminDashboard.css
    ├── AdminProducts.css
    ├── AdminUsers.css
    ├── Header.css
    ├── Home.css
    ├── Layout.css
    ├── MyOrders.css
    ├── NewOrder.css
    ├── ProductDetail.css
    ├── ProductFormModal.css
    └── Profile.css
```

## Sécurité

### Backend

- **Authentification JWT** avec tokens Bearer
- **Hachage BCrypt** pour les mots de passe
- **Configuration CORS** : autorise uniquement `http://localhost:5173`
- **Session stateless** (pas de cookies de session)
- **Protection par rôles** avec `@PreAuthorize`
- **Validation des données** avec Bean Validation

### Routes protégées

```java
/api/auth/**           → Public
/api/products (GET)    → Public
/api/admin/**          → ROLE_ADMIN
/api/orders/**         → Authentifié
/api/user/**           → Authentifié
```

### Frontend

- **Guards de navigation** (AuthGuard, AdminGuard)
- **Intercepteur Axios** pour ajouter le token JWT
- **Décodage JWT** manuel (pas de librairie externe)
- **Gestion des tokens expirés** avec redirection automatique
- **Stockage localStorage** du token

## API Endpoints Principaux

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion (retourne JWT)

### Produits (Public)

- `GET /api/products?page=0&size=10&category=&search=` - Liste paginée
- `GET /api/products/{id}` - Détail d'un produit

### Produits (Admin)

- `POST /api/admin/products` - Créer un produit
- `PUT /api/admin/products/{id}` - Modifier un produit
- `DELETE /api/admin/products/{id}` - Supprimer un produit

### Commandes

- `POST /api/orders` - Créer une commande (USER)
- `GET /api/orders` - Mes commandes (USER)

### Administration

- `GET /api/admin/stats` - Statistiques du dashboard
  - `totalProducts` : nombre total de produits
  - `totalUsers` : nombre total d'utilisateurs
  - `totalOrders` : nombre total de commandes
  - `totalRevenue` : chiffre d'affaires total
  - `recentOrders` : commandes des 7 derniers jours
  - `lowStockProducts` : produits avec stock < 5
- `GET /api/admin/users?page=0&size=10` - Liste des utilisateurs
- `PUT /api/admin/users/{id}` - Modifier un utilisateur (rôles, statut)

## Captures d'écran

Voir le dossier `/screenshots` pour les captures d'écran de l'application.

## Vidéo de démonstration

Lien vers la vidéo : [In Coming]

## Problèmes connus et solutions

### Port déjà utilisé

**Backend (port 8080)** :

```properties
# Modifier dans application.properties
server.port=8081
```

**Frontend (port 5173)** :
Vite proposera automatiquement le port suivant disponible.

### Erreur de connexion à MySQL

Vérifiez que :

1. MySQL est démarré : `mysql.server start` (Mac) ou via services Windows
2. La base `fullstack_backoffice_db` existe
3. Les credentials dans `application.properties` sont corrects
4. Le paramètre `allowPublicKeyRetrieval=true` est présent dans l'URL

### Erreur CORS

Si vous changez le port frontend, mettez à jour `SecurityConfig.java` :

```java
config.setAllowedOrigins(Arrays.asList("http://localhost:VOTRE_PORT"));
```

### Token JWT expiré

Les tokens expirent après un certain temps. Déconnectez-vous et reconnectez-vous.

## Scripts disponibles

### Backend

```bash
./mvnw clean install      # Compiler le projet
./mvnw spring-boot:run    # Lancer l'application
./mvnw test               # Lancer les tests
./mvnw jacoco:report      # Générer le rapport de couverture
```

### Frontend

```bash
npm install               # Installer les dépendances
npm run dev              # Lancer en mode développement
npm run build            # Build de production
npm run preview          # Preview du build
npm run lint             # Linter le code
```

## Fonctionnalités implémentées

### Exigences minimales

- [x] Backend REST API avec Spring Boot
- [x] Frontend React + TypeScript
- [x] Base de données MySQL
- [x] Authentification JWT
- [x] CRUD complet sur les produits
- [x] Gestion des utilisateurs
- [x] Gestion des commandes
- [x] Interface publique
- [x] Interface utilisateur connecté
- [x] Interface administrateur
- [x] Tests unitaires (41 tests)
- [x] Documentation API (Swagger)

### Fonctionnalités bonus

- [x] Dashboard admin avec statistiques en temps réel
- [x] Filtres et recherche avancés
- [x] Pagination
- [x] Gestion du stock
- [x] Images des produits (Unsplash)
- [x] Notifications toast
- [x] Gestion des erreurs centralisée
- [x] Validation complète des données
- [x] Design responsive moderne
- [x] Couverture de code à 70%+

## Licence

Ce projet est réalisé dans le cadre d'un projet académique à SUP DE VINCI.

## Auteur

**Marc AWAD** - SUP DE VINCI

---

**Note technique** : Ce projet utilise Spring Boot 3.4.1 avec Java 17, React 19.2.0, et suit les bonnes pratiques de développement fullstack avec une architecture MVC côté backend et une architecture par composants côté frontend.
