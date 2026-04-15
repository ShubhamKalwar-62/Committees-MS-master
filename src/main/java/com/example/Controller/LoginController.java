package com.example.Controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Entity.Login;
import com.example.Response.ResponceBean;
import com.example.Service.EmailService;
import com.example.Service.LoginService;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/login")
@Tag(name = "Login Management", description = "APIs for user authentication and login management")
public class LoginController {
    
    @Autowired
    private LoginService loginService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;
    
    @GetMapping
    @Operation(summary = "Get all logins", description = "Retrieve all login records")
    public ResponseEntity<ResponceBean<List<Login>>> getAllLogins() {
        List<Login> logins = loginService.getAllLogins();
        return ResponseEntity.ok(ResponceBean.success("Logins retrieved successfully", logins));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get login by ID", description = "Retrieve a specific login by ID")
    public ResponseEntity<ResponceBean<Login>> getLoginById(@PathVariable Integer id) {
        Optional<Login> login = loginService.getLoginById(id);
        if (login.isPresent()) {
            return ResponseEntity.ok(ResponceBean.success("Login retrieved successfully", login.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Login not found"));
    }
    
    @GetMapping("/email/{email}")
    @Operation(summary = "Get login by email", description = "Retrieve login by email address")
    public ResponseEntity<ResponceBean<Login>> getLoginByEmail(@PathVariable String email) {
        Optional<Login> login = loginService.getLoginByEmail(email);
        if (login.isPresent()) {
            return ResponseEntity.ok(ResponceBean.success("Login retrieved successfully", login.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Login not found"));
    }
    
    @PostMapping("/authenticate")
    @Operation(summary = "Authenticate user", description = "Authenticate user with email and password")
    public ResponseEntity<ResponceBean<Login>> authenticateUser(@RequestBody Login loginRequest) {
        Optional<Login> login = loginService.authenticateUser(loginRequest.getEmail(), loginRequest.getPassword());
        if (login.isPresent()) {
            return ResponseEntity.ok(ResponceBean.success("Authentication successful", login.get()));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ResponceBean.error("Invalid credentials"));
    }
    
    @PostMapping
    @Operation(summary = "Create new login", description = "Create a new login account")
    public ResponseEntity<ResponceBean<Login>> createLogin(@RequestBody Login login) {
        if (loginService.existsByEmail(login.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ResponceBean.error("Email already exists"));
        }
        Login savedLogin = loginService.saveLogin(login);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponceBean.success("Login created successfully", savedLogin));
    }

    @PostMapping("/admin/reset-password")
    @Operation(summary = "Admin forgot-password reset", description = "Admin resets password for STUDENT or FACULTY forgot-password requests")
    public ResponseEntity<ResponceBean<Map<String, Object>>> adminResetPassword(@RequestBody ForgotPasswordResetRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim();
        String role = request.getRole() == null ? "" : request.getRole().trim().toUpperCase();
        String newPassword = request.getNewPassword() == null ? "" : request.getNewPassword().trim();

        if (email.isBlank() || role.isBlank() || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(ResponceBean.error("Email, role, and newPassword are required"));
        }

        if (!"STUDENT".equals(role) && !"FACULTY".equals(role)) {
            return ResponseEntity.badRequest().body(ResponceBean.error("Only STUDENT and FACULTY roles are allowed"));
        }

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(ResponceBean.error("Password must be at least 6 characters"));
        }

        Optional<Login> loginOptional = loginService.getLoginByEmail(email);
        if (loginOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Login not found"));
        }

        Login login = loginOptional.get();
        String actualRole = login.getRole() == null ? "" : login.getRole().trim().toUpperCase();
        if (!role.equals(actualRole)) {
            return ResponseEntity.badRequest().body(ResponceBean.error("Role mismatch for this email"));
        }

        login.setPassword(passwordEncoder.encode(newPassword));
        loginService.saveLogin(login);

        boolean mailSent;
        String mailMessage;
        try {
            mailSent = emailService.sendForgotPasswordResetEmail(email, role);
            mailMessage = mailSent
                    ? "Password reset completed and email notification sent"
                    : "Password reset completed (email notifications disabled)";
        } catch (MailException ex) {
            mailSent = false;
            mailMessage = "Password reset completed, but email notification failed";
        }

        Map<String, Object> response = Map.of(
                "email", email,
                "role", role,
                "mailSent", mailSent,
                "mailMessage", mailMessage
        );

        return ResponseEntity.ok(ResponceBean.success("Forgot-password reset completed", response));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update login", description = "Update an existing login")
    public ResponseEntity<ResponceBean<Login>> updateLogin(@PathVariable Integer id, @RequestBody Login loginDetails) {
        Login updatedLogin = loginService.updateLogin(id, loginDetails);
        if (updatedLogin != null) {
            return ResponseEntity.ok(ResponceBean.success("Login updated successfully", updatedLogin));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Login not found"));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Patch login", description = "Partially update login account")
    public ResponseEntity<ResponceBean<Login>> patchLogin(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> updates) {
        Optional<Login> existing = loginService.getLoginById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Login not found"));
        }
        try {
            updates.remove("loginId");
            updates.remove("createdAt");
            Login patched = objectMapper.updateValue(existing.get(), updates);
            Login saved = loginService.saveLogin(patched);
            return ResponseEntity.ok(ResponceBean.success("Login patched successfully", saved));
        } catch (IllegalArgumentException | JsonMappingException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponceBean.error("Invalid patch payload", ex.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete login", description = "Delete a login account")
    public ResponseEntity<ResponceBean<String>> deleteLogin(@PathVariable Integer id) {
        Optional<Login> login = loginService.getLoginById(id);
        if (login.isPresent()) {
            loginService.deleteLogin(id);
            return ResponseEntity.ok(ResponceBean.success("Login deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Login not found"));
    }

    public static class ForgotPasswordResetRequest {
        private String email;
        private String role;
        private String newPassword;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}