package com.example.Controller;

import com.example.Entity.Committee;
import com.example.Response.ResponceBean;
import com.example.Service.CommitteeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/committees")
@Tag(name = "Committee Management", description = "APIs for managing committees")
public class CommitteeController {
    
    @Autowired
    private CommitteeService committeeService;
    
    @GetMapping
    @Operation(summary = "Get all committees", description = "Retrieve all committees")
    public ResponseEntity<ResponceBean<List<Committee>>> getAllCommittees() {
        List<Committee> committees = committeeService.getAllCommittees();
        return ResponseEntity.ok(ResponceBean.success("Committees retrieved successfully", committees));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get committee by ID", description = "Retrieve a specific committee by ID")
    public ResponseEntity<ResponceBean<Committee>> getCommitteeById(@PathVariable Integer id) {
        Optional<Committee> committee = committeeService.getCommitteeById(id);
        if (committee.isPresent()) {
            return ResponseEntity.ok(ResponceBean.success("Committee retrieved successfully", committee.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Committee not found"));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search committees by name", description = "Search committees by name containing keyword")
    public ResponseEntity<ResponceBean<List<Committee>>> searchCommitteesByName(@RequestParam String name) {
        List<Committee> committees = committeeService.getCommitteesByNameContaining(name);
        return ResponseEntity.ok(ResponceBean.success("Committees found", committees));
    }
    
    @GetMapping("/faculty/{facultyName}")
    @Operation(summary = "Get committees by faculty", description = "Get committees by faculty in-charge name")
    public ResponseEntity<ResponceBean<List<Committee>>> getCommitteesByFaculty(@PathVariable String facultyName) {
        List<Committee> committees = committeeService.getCommitteesByFacultyName(facultyName);
        return ResponseEntity.ok(ResponceBean.success("Committees retrieved successfully", committees));
    }
    
    @PostMapping
    @Operation(summary = "Create new committee", description = "Create a new committee")
    public ResponseEntity<ResponceBean<Committee>> createCommittee(@RequestBody Committee committee) {
        Committee savedCommittee = committeeService.saveCommittee(committee);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponceBean.success("Committee created successfully", savedCommittee));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update committee", description = "Update an existing committee")
    public ResponseEntity<ResponceBean<Committee>> updateCommittee(@PathVariable Integer id, @RequestBody Committee committeeDetails) {
        Committee updatedCommittee = committeeService.updateCommittee(id, committeeDetails);
        if (updatedCommittee != null) {
            return ResponseEntity.ok(ResponceBean.success("Committee updated successfully", updatedCommittee));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Committee not found"));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete committee", description = "Delete a committee")
    public ResponseEntity<ResponceBean<String>> deleteCommittee(@PathVariable Integer id) {
        Optional<Committee> committee = committeeService.getCommitteeById(id);
        if (committee.isPresent()) {
            committeeService.deleteCommittee(id);
            return ResponseEntity.ok(ResponceBean.success("Committee deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Committee not found"));
    }
}