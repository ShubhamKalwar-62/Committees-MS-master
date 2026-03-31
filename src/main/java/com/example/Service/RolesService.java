package com.example.Service;

import com.example.Entity.Roles;
import com.example.Entity.Committee;
import com.example.Repository.RolesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RolesService {
    
    @Autowired
    private RolesRepository rolesRepository;
    
    public List<Roles> getAllRoles() {
        return rolesRepository.findAll();
    }
    
    public Optional<Roles> getRoleById(Integer id) {
        return rolesRepository.findById(id);
    }
    
    public List<Roles> getRolesByCommittee(Committee committee) {
        return rolesRepository.findByCommittee(committee);
    }
    
    public List<Roles> getRolesByCommitteeId(Integer committeeId) {
        return rolesRepository.findByCommitteeId(committeeId);
    }
    
    public List<Roles> getRolesByRoleName(String roleName) {
        return rolesRepository.findByRoleNameContaining(roleName);
    }
    
    public Roles saveRole(Roles role) {
        return rolesRepository.save(role);
    }
    
    public void deleteRole(Integer id) {
        rolesRepository.deleteById(id);
    }
    
    public Roles updateRole(Integer id, Roles roleDetails) {
        Optional<Roles> existingRole = rolesRepository.findById(id);
        if (existingRole.isPresent()) {
            Roles role = existingRole.get();
            role.setRoleName(roleDetails.getRoleName());
            return rolesRepository.save(role);
        }
        return null;
    }
}