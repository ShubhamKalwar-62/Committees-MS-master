package com.example.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.Entity.Login;

@Repository
public interface LoginRepository extends JpaRepository<Login, Integer> {
    
    Optional<Login> findByEmail(String email);
    
    @Query("SELECT l FROM Login l WHERE l.email = :email AND l.password = :password")
    Optional<Login> findByEmailAndPassword(@Param("email") String email, @Param("password") String password);
    
    boolean existsByEmail(String email);

    boolean existsByRoleIgnoreCase(String role);
}