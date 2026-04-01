package com.example.Service;

import java.util.List;
import java.util.Optional;

import com.example.Entity.Committee;
import com.example.Entity.Roles;

public interface RolesService {
    List<Roles> getAllRoles();
    Optional<Roles> getRoleById(Integer id);
    List<Roles> getRolesByCommittee(Committee committee);
    List<Roles> getRolesByCommitteeId(Integer committeeId);
    List<Roles> getRolesByRoleName(String roleName);
    Roles saveRole(Roles role);
    void deleteRole(Integer id);
    Roles updateRole(Integer id, Roles roleDetails);
}