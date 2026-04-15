package com.example.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Entity.Committee;
import com.example.Entity.Roles;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.RolesRepository;

@Service
public class RolesServiceImpl implements RolesService {

    @Autowired
    private RolesRepository rolesRepository;

    @Override
    public List<Roles> getAllRoles() {
        return rolesRepository.findAll();
    }

    @Override
    public Optional<Roles> getRoleById(Integer id) {
        return rolesRepository.findById(Objects.requireNonNull(id, "id must not be null"));
    }

    @Override
    public List<Roles> getRolesByCommittee(Committee committee) {
        return rolesRepository.findByCommittee(committee);
    }

    @Override
    public List<Roles> getRolesByCommitteeId(Integer committeeId) {
        return rolesRepository.findByCommitteeId(committeeId);
    }

    @Override
    public List<Roles> getRolesByRoleName(String roleName) {
        return rolesRepository.findByRoleNameContaining(roleName);
    }

    @Override
    public Roles saveRole(Roles role) {
        return rolesRepository.save(Objects.requireNonNull(role, "role must not be null"));
    }

    @Override
    public void deleteRole(Integer id) {
        rolesRepository.deleteById(Objects.requireNonNull(id, "id must not be null"));
    }

    @Override
    public Roles updateRole(Integer id, Roles roleDetails) {
        Optional<Roles> existingRole = rolesRepository.findById(Objects.requireNonNull(id, "id must not be null"));
        if (existingRole.isPresent()) {
            Roles role = existingRole.get();
            role.setRoleName(roleDetails.getRoleName());
            return rolesRepository.save(role);
        }
        throw new ResourceNotFoundException("Role not found with id: " + id);
    }
}
