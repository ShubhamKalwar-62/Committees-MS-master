package com.example.Controller;

import com.example.Entity.Login;
import com.example.Response.ResponceBean;
import com.example.Service.LoginService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/login")
@Tag(name = "Login Management", description = "APIs for user authentication and login management")
public class LoginController {
    
    @Autowired
    private LoginService loginService;
    
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
}