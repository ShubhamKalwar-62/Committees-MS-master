package com.example.Service;

import com.example.Entity.Login;
import com.example.Repository.LoginRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LoginService {
    
    @Autowired
    private LoginRepository loginRepository;
    
    public List<Login> getAllLogins() {
        return loginRepository.findAll();
    }
    
    public Optional<Login> getLoginById(Integer id) {
        return loginRepository.findById(id);
    }
    
    public Optional<Login> getLoginByEmail(String email) {
        return loginRepository.findByEmail(email);
    }
    
    public Optional<Login> authenticateUser(String email, String password) {
        return loginRepository.findByEmailAndPassword(email, password);
    }
    
    public Login saveLogin(Login login) {
        return loginRepository.save(login);
    }
    
    public boolean existsByEmail(String email) {
        return loginRepository.existsByEmail(email);
    }
    
    public void deleteLogin(Integer id) {
        loginRepository.deleteById(id);
    }
    
    public Login updateLogin(Integer id, Login loginDetails) {
        Optional<Login> existingLogin = loginRepository.findById(id);
        if (existingLogin.isPresent()) {
            Login login = existingLogin.get();
            login.setEmail(loginDetails.getEmail());
            login.setPassword(loginDetails.getPassword());
            return loginRepository.save(login);
        }
        return null;
    }
}