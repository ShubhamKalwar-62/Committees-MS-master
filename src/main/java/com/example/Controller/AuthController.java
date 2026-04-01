package com.example.Controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Entity.Login;
import com.example.Entity.Roles;
import com.example.Entity.Users;
import com.example.Repository.LoginRepository;
import com.example.Repository.RolesRepository;
import com.example.Repository.UsersRepository;
import com.example.Response.ResponceBean;
import com.example.Security.JwtUtil;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RolesRepository rolesRepository;

    @PostMapping("/login")
    public ResponseEntity<ResponceBean<Map<String, Object>>> login(@RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(), 
                    loginRequest.getPassword()
                )
            );

            // Get user details
            Login login = loginRepository.findByEmail(loginRequest.getEmail()).orElse(null);
            if (login == null) {
                return ResponseEntity.badRequest()
                    .body(new ResponceBean<>(false, "User not found"));
            }

            // Generate JWT token with role
            String token = jwtUtil.generateToken(loginRequest.getEmail(), login.getRole());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("email", loginRequest.getEmail());
            response.put("role", login.getRole());

            return ResponseEntity.ok(new ResponceBean<>(true, "Login successful", response));

        } catch (AuthenticationException e) {
            return ResponseEntity.badRequest()
                .body(new ResponceBean<>(false, "Invalid credentials"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ResponceBean<Map<String, Object>>> register(@RequestBody RegisterRequest registerRequest) {
        try {
            // Check if email already exists
            if (loginRepository.existsByEmail(registerRequest.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(new ResponceBean<>(false, "Email already exists"));
            }

            // Create new login
            Login login = new Login();
            login.setEmail(registerRequest.getEmail());
            login.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            login.setRole(registerRequest.getRole() != null ? registerRequest.getRole() : "STUDENT");
            if (registerRequest.getRole() != null) {
                Roles role = rolesRepository.findByRoleName(registerRequest.getRole())
                        .stream()
                        .findFirst()
                        .orElse(null);
                login.setRoleRef(role);
            }
            loginRepository.save(login);

            // Create new user if provided
            if (registerRequest.getName() != null) {
                Users user = new Users();
                user.setName(registerRequest.getName());
                user.setLogin(login);
                usersRepository.save(user);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("email", registerRequest.getEmail());
            response.put("role", login.getRole());

            return ResponseEntity.ok(new ResponceBean<>(true, "Registration successful", response));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ResponceBean<>(false, "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<ResponceBean<Map<String, Object>>> validateToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        
        try {
            if (token != null) {
                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);
                
                Map<String, Object> response = new HashMap<>();
                response.put("valid", true);
                response.put("username", username);
                response.put("role", role);
                
                return ResponseEntity.ok(new ResponceBean<>(true, "Token is valid", response));
            }
        } catch (Exception e) {
            // Token is invalid
        }
        
        return ResponseEntity.badRequest()
            .body(new ResponceBean<>(false, "Invalid token"));
    }

    // DTOs for request bodies
    public static class LoginRequest {
        private String email;
        private String password;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String email;
        private String password;
        private String role;
        private String name;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
}