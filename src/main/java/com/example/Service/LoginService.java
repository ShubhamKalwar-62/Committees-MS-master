package com.example.Service;

import java.util.List;
import java.util.Optional;

import com.example.Entity.Login;

public interface LoginService {
    List<Login> getAllLogins();
    Optional<Login> getLoginById(Integer id);
    Optional<Login> getLoginByEmail(String email);
    Optional<Login> authenticateUser(String email, String password);
    Login saveLogin(Login login);
    boolean existsByEmail(String email);
    void deleteLogin(Integer id);
    Login updateLogin(Integer id, Login loginDetails);
}