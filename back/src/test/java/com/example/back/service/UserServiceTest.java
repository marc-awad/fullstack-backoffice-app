package com.example.back.service;

import com.example.back.dto.AuthResponse;
import com.example.back.dto.LoginRequest;
import com.example.back.dto.RegisterRequest;
import com.example.back.dto.UpdateUserRequest;
import com.example.back.dto.UserResponse;
import com.example.back.exception.InvalidCredentialsException;
import com.example.back.exception.UserAlreadyExistsException;
import com.example.back.model.Role;
import com.example.back.model.User;
import com.example.back.repository.UserRepository;
import com.example.back.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserService userService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        // Préparation des données de test
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password123");

        user = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encodedPassword")
                .roles(Collections.singleton(Role.USER))
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ========================================
    // Tests pour register()
    // ========================================

    @Test
    void register_Success() {
        // Given
        when(userRepository.findByUsername(registerRequest.getUsername())).thenReturn(Optional.empty());
        when(userRepository.findAll()).thenReturn(Collections.emptyList());
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        // When
        userService.register(registerRequest);

        // Then
        verify(userRepository).findByUsername(registerRequest.getUsername());
        verify(userRepository).findAll();
        verify(passwordEncoder).encode(registerRequest.getPassword());
        verify(userRepository).save(argThat(savedUser ->
                savedUser.getUsername().equals(registerRequest.getUsername()) &&
                        savedUser.getEmail().equals(registerRequest.getEmail()) &&
                        savedUser.getPassword().equals("encodedPassword") &&
                        savedUser.getRoles().contains(Role.USER) &&
                        savedUser.isEnabled()
        ));
    }

    @Test
    void register_ThrowsException_WhenUsernameAlreadyExists() {
        // Given
        when(userRepository.findByUsername(registerRequest.getUsername())).thenReturn(Optional.of(user));

        // When & Then
        UserAlreadyExistsException exception = assertThrows(
                UserAlreadyExistsException.class,
                () -> userService.register(registerRequest)
        );

        assertEquals("Username already taken", exception.getMessage());
        verify(userRepository).findByUsername(registerRequest.getUsername());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_ThrowsException_WhenEmailAlreadyExists() {
        // Given
        User existingUser = User.builder()
                .id(2L)
                .username("otheruser")
                .email("test@example.com")
                .build();

        when(userRepository.findByUsername(registerRequest.getUsername())).thenReturn(Optional.empty());
        when(userRepository.findAll()).thenReturn(Collections.singletonList(existingUser));

        // When & Then
        UserAlreadyExistsException exception = assertThrows(
                UserAlreadyExistsException.class,
                () -> userService.register(registerRequest)
        );

        assertEquals("Email already registered", exception.getMessage());
        verify(userRepository).findByUsername(registerRequest.getUsername());
        verify(userRepository).findAll();
        verify(userRepository, never()).save(any(User.class));
    }

    // ========================================
    // Tests pour authenticate()
    // ========================================

    @Test
    void authenticate_Success() {
        // Given
        when(userRepository.findByUsername(loginRequest.getUsername())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(eq("testuser"), anyList())).thenReturn("jwt-token-123");

        // When
        AuthResponse response = userService.authenticate(loginRequest);

        // Then
        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals("jwt-token-123", response.getToken());

        verify(userRepository).findByUsername(loginRequest.getUsername());
        verify(passwordEncoder).matches(loginRequest.getPassword(), user.getPassword());
        verify(jwtUtil).generateToken(eq("testuser"), argThat(authorities ->
                authorities.stream().anyMatch(auth ->
                        auth instanceof SimpleGrantedAuthority &&
                                ((SimpleGrantedAuthority) auth).getAuthority().equals("ROLE_USER")
                )
        ));
    }

    @Test
    void authenticate_ThrowsException_WhenUsernameNotFound() {
        // Given
        when(userRepository.findByUsername(loginRequest.getUsername())).thenReturn(Optional.empty());

        // When & Then
        InvalidCredentialsException exception = assertThrows(
                InvalidCredentialsException.class,
                () -> userService.authenticate(loginRequest)
        );

        assertEquals("Invalid username or password", exception.getMessage());
        verify(userRepository).findByUsername(loginRequest.getUsername());
        verify(passwordEncoder, never()).matches(anyString(), anyString());
        verify(jwtUtil, never()).generateToken(anyString(), anyList());
    }

    @Test
    void authenticate_ThrowsException_WhenPasswordIsIncorrect() {
        // Given
        when(userRepository.findByUsername(loginRequest.getUsername())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())).thenReturn(false);

        // When & Then
        InvalidCredentialsException exception = assertThrows(
                InvalidCredentialsException.class,
                () -> userService.authenticate(loginRequest)
        );

        assertEquals("Invalid username or password", exception.getMessage());
        verify(userRepository).findByUsername(loginRequest.getUsername());
        verify(passwordEncoder).matches(loginRequest.getPassword(), user.getPassword());
        verify(jwtUtil, never()).generateToken(anyString(), anyList());
    }

    // ========================================
    // Tests pour getUsers()
    // ========================================

    @Test
    void getUsers_Success() {
        // Given
        User user2 = User.builder()
                .id(2L)
                .username("user2")
                .email("user2@example.com")
                .password("password")
                .roles(Collections.singleton(Role.USER))
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .build();

        List<User> users = Arrays.asList(user, user2);
        Page<User> userPage = new PageImpl<>(users, PageRequest.of(0, 10), users.size());

        when(userRepository.findAll(any(PageRequest.class))).thenReturn(userPage);

        // When
        Page<UserResponse> result = userService.getUsers(0, 10);

        // Then
        assertNotNull(result);
        assertEquals(2, result.getTotalElements());
        assertEquals(2, result.getContent().size());
        assertEquals("testuser", result.getContent().get(0).getUsername());
        assertEquals("user2", result.getContent().get(1).getUsername());

        verify(userRepository).findAll(any(PageRequest.class));
    }

    @Test
    void getUsers_ReturnsEmptyPage_WhenNoUsers() {
        // Given
        Page<User> emptyPage = new PageImpl<>(Collections.emptyList(), PageRequest.of(0, 10), 0);
        when(userRepository.findAll(any(PageRequest.class))).thenReturn(emptyPage);

        // When
        Page<UserResponse> result = userService.getUsers(0, 10);

        // Then
        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
        assertTrue(result.getContent().isEmpty());

        verify(userRepository).findAll(any(PageRequest.class));
    }

    // ========================================
    // Tests pour updateUser()
    // ========================================

    @Test
    void updateUser_Success() {
        // Given
        UpdateUserRequest updateRequest = new UpdateUserRequest();
        updateRequest.setEnabled(false);
        updateRequest.setRoles(Set.of(Role.ADMIN, Role.USER));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        // When
        UserResponse response = userService.updateUser(1L, updateRequest);

        // Then
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("testuser", response.getUsername());

        verify(userRepository).findById(1L);
        verify(userRepository).save(argThat(savedUser ->
                !savedUser.isEnabled() &&
                        savedUser.getRoles().contains(Role.ADMIN) &&
                        savedUser.getRoles().contains(Role.USER)
        ));
    }

    @Test
    void updateUser_ThrowsException_WhenUserNotFound() {
        // Given
        UpdateUserRequest updateRequest = new UpdateUserRequest();
        updateRequest.setEnabled(false);
        updateRequest.setRoles(Collections.singleton(Role.USER));

        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userService.updateUser(999L, updateRequest)
        );

        assertEquals("User not found", exception.getMessage());
        verify(userRepository).findById(999L);
        verify(userRepository, never()).save(any(User.class));
    }
}