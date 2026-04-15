package com.example.Controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.Entity.Committee;
import com.example.Entity.Roles;
import com.example.Repository.CommitteeRepository;
import com.example.Response.ResponceBean;
import com.example.Service.RolesService;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/roles")
@Tag(name = "Role Management", description = "APIs for managing committee roles")
public class RolesController {
    
    @Autowired
    private RolesService rolesService;

    @Autowired
    private CommitteeRepository committeeRepository;

    @Autowired
    private ObjectMapper objectMapper;
    
    @GetMapping
    @Operation(summary = "Get all roles", description = "Retrieve all roles")
    public ResponseEntity<ResponceBean<List<Roles>>> getAllRoles() {
        List<Roles> roles = rolesService.getAllRoles();
        return ResponseEntity.ok(ResponceBean.success("Roles retrieved successfully", roles));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get role by ID", description = "Retrieve a specific role by ID")
    public ResponseEntity<ResponceBean<Roles>> getRoleById(@PathVariable Integer id) {
        Optional<Roles> role = rolesService.getRoleById(id);
        if (role.isPresent()) {
            return ResponseEntity.ok(ResponceBean.success("Role retrieved successfully", role.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Role not found"));
    }
    
    @GetMapping("/committee/{committeeId}")
    @Operation(summary = "Get roles by committee", description = "Retrieve roles by committee ID")
    public ResponseEntity<ResponceBean<List<Roles>>> getRolesByCommittee(@PathVariable Integer committeeId) {
        List<Roles> roles = rolesService.getRolesByCommitteeId(committeeId);
        return ResponseEntity.ok(ResponceBean.success("Roles retrieved successfully", roles));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search roles by name", description = "Search roles by name containing keyword")
    public ResponseEntity<ResponceBean<List<Roles>>> searchRolesByName(@RequestParam String name) {
        List<Roles> roles = rolesService.getRolesByRoleName(name);
        return ResponseEntity.ok(ResponceBean.success("Roles found", roles));
    }
    
    @PostMapping
    @Operation(summary = "Create new role", description = "Create a new role")
    public ResponseEntity<ResponceBean<Roles>> createRole(@RequestBody Map<String, Object> payload) {
        Roles role = new Roles();
        role.setRoleName(payload.get("roleName") != null ? String.valueOf(payload.get("roleName")) : null);

        Integer committeeId = extractCommitteeId(payload);
        if (committeeId != null) {
            Committee committee = committeeRepository.findById(committeeId).orElse(null);
            role.setCommittee(committee);
        }

        Roles savedRole = rolesService.saveRole(role);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponceBean.success("Role created successfully", savedRole));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update role", description = "Update an existing role")
    public ResponseEntity<ResponceBean<Roles>> updateRole(@PathVariable Integer id, @RequestBody Map<String, Object> payload) {
        Optional<Roles> existing = rolesService.getRoleById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponceBean.error("Role not found"));
        }

        Roles role = existing.get();
        if (payload.get("roleName") != null) {
            role.setRoleName(String.valueOf(payload.get("roleName")));
        }

        Integer committeeId = extractCommitteeId(payload);
        if (committeeId != null) {
            Committee committee = committeeRepository.findById(committeeId).orElse(null);
            role.setCommittee(committee);
        }

        Roles updatedRole = rolesService.saveRole(role);
        if (updatedRole != null) {
            return ResponseEntity.ok(ResponceBean.success("Role updated successfully", updatedRole));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Role not found"));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Patch role", description = "Partially update a role")
    public ResponseEntity<ResponceBean<Roles>> patchRole(@PathVariable Integer id, @RequestBody java.util.Map<String, Object> updates) {
        Optional<Roles> existing = rolesService.getRoleById(id);
        if (existing.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ResponceBean.error("Role not found"));
        }
        try {
            updates.remove("roleId");
            updates.remove("createdAt");
            Integer committeeId = extractCommitteeId(updates);
            updates.remove("committeeId");
            updates.remove("committee");
            Roles patched = objectMapper.updateValue(existing.get(), updates);
            if (committeeId != null) {
                Committee committee = committeeRepository.findById(committeeId).orElse(null);
                patched.setCommittee(committee);
            }
            Roles saved = rolesService.saveRole(patched);
            return ResponseEntity.ok(ResponceBean.success("Role patched successfully", saved));
        } catch (IllegalArgumentException | JsonMappingException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ResponceBean.error("Invalid patch payload", ex.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete role", description = "Delete a role")
    public ResponseEntity<ResponceBean<String>> deleteRole(@PathVariable Integer id) {
        Optional<Roles> role = rolesService.getRoleById(id);
        if (role.isPresent()) {
            rolesService.deleteRole(id);
            return ResponseEntity.ok(ResponceBean.success("Role deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Role not found"));
    }

    private Integer extractCommitteeId(Map<String, Object> payload) {
        Object committeeIdObj = payload.get("committeeId");
        if (committeeIdObj != null) {
            return Integer.valueOf(String.valueOf(committeeIdObj));
        }

        Object committeeObj = payload.get("committee");
        if (committeeObj instanceof Map<?, ?> committeeMap) {
            Object nestedId = committeeMap.get("committeeId");
            if (nestedId != null) {
                return Integer.valueOf(String.valueOf(nestedId));
            }
        }
        return null;
    }
}