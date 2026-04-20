package com.example.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.Entity.Login;
import com.example.Entity.Users;

@Repository
public interface UsersRepository extends JpaRepository<Users, Integer> {

    @Query("SELECT u FROM Users u JOIN FETCH u.login l LEFT JOIN FETCH l.roleRef")
    List<Users> findAllWithLogin();
    
    List<Users> findByLogin(Login login);
    
    Optional<Users> findByLoginEmail(String email);
    
    @Query("SELECT u FROM Users u WHERE u.name LIKE %:name%")
    List<Users> findByNameContaining(@Param("name") String name);
    
    @Query("SELECT u FROM Users u JOIN u.login l WHERE l.email = :email")
    Optional<Users> findByEmail(@Param("email") String email);
}