package com.example.Controller;

import com.example.Entity.Users;
import com.example.Response.ResponceBean;
import com.example.Service.UsersService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "APIs for managing users")
public class UsersController {
    
    @Autowired
    private UsersService usersService;
    
    @GetMapping
    @Operation(summary = "Get all users", description = "Retrieve all users")
    public ResponseEntity<ResponceBean<List<Users>>> getAllUsers() {
        List<Users> users = usersService.getAllUsers();
        return ResponseEntity.ok(ResponceBean.success("Users retrieved successfully", users));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve a specific user by ID")
    public ResponseEntity<ResponceBean<Users>> getUserById(@PathVariable Integer id) {
        Optional<Users> user = usersService.getUserById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(ResponceBean.success("User retrieved successfully", user.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("User not found"));
    }
    
    @GetMapping("/email/{email}")
    @Operation(summary = "Get user by email", description = "Retrieve user by email address")
    public ResponseEntity<ResponceBean<Users>> getUserByEmail(@PathVariable String email) {
        Optional<Users> user = usersService.getUserByEmail(email);
        if (user.isPresent()) {
            return ResponseEntity.ok(ResponceBean.success("User retrieved successfully", user.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("User not found"));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search users by name", description = "Search users by name containing keyword")
    public ResponseEntity<ResponceBean<List<Users>>> searchUsersByName(@RequestParam String name) {
        List<Users> users = usersService.getUsersByNameContaining(name);
        return ResponseEntity.ok(ResponceBean.success("Users found", users));
    }
    
    @PostMapping
    @Operation(summary = "Create new user", description = "Create a new user")
    public ResponseEntity<ResponceBean<Users>> createUser(@RequestBody Users user) {
        Users savedUser = usersService.saveUser(user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponceBean.success("User created successfully", savedUser));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update user", description = "Update an existing user")
    public ResponseEntity<ResponceBean<Users>> updateUser(@PathVariable Integer id, @RequestBody Users userDetails) {
        Users updatedUser = usersService.updateUser(id, userDetails);
        if (updatedUser != null) {
            return ResponseEntity.ok(ResponceBean.success("User updated successfully", updatedUser));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("User not found"));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user", description = "Delete a user")
    public ResponseEntity<ResponceBean<String>> deleteUser(@PathVariable Integer id) {
        Optional<Users> user = usersService.getUserById(id);
        if (user.isPresent()) {
            usersService.deleteUser(id);
            return ResponseEntity.ok(ResponceBean.success("User deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("User not found"));
    }
}