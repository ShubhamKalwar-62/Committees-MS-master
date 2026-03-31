package com.example.Repository;

import com.example.Entity.Roles;
import com.example.Entity.Committee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RolesRepository extends JpaRepository<Roles, Integer> {
    
    List<Roles> findByCommittee(Committee committee);
    
    List<Roles> findByRoleName(String roleName);
    
    @Query("SELECT r FROM Roles r WHERE r.committee.committeeId = :committeeId")
    List<Roles> findByCommitteeId(@Param("committeeId") Integer committeeId);
    
    @Query("SELECT r FROM Roles r WHERE r.roleName LIKE %:roleName%")
    List<Roles> findByRoleNameContaining(@Param("roleName") String roleName);
}