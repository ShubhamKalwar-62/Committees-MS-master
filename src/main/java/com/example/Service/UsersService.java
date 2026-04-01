package com.example.Service;

import java.util.List;
import java.util.Optional;

import com.example.Entity.Login;
import com.example.Entity.Users;

public interface UsersService {
    List<Users> getAllUsers();
    Optional<Users> getUserById(Integer id);
    Optional<Users> getUserByEmail(String email);
    List<Users> getUsersByLogin(Login login);
    List<Users> getUsersByNameContaining(String name);
    Users saveUser(Users user);
    void deleteUser(Integer id);
    Users updateUser(Integer id, Users userDetails);
}