package com.example.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Entity.Login;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.LoginRepository;

@Service
public class LoginServiceImpl implements LoginService {

    @Autowired
    private LoginRepository loginRepository;

    @Override
    public List<Login> getAllLogins() {
        return loginRepository.findAll();
    }

    @Override
    public Optional<Login> getLoginById(Integer id) {
        return loginRepository.findById(id);
    }

    @Override
    public Optional<Login> getLoginByEmail(String email) {
        return loginRepository.findByEmail(email);
    }

    @Override
    public Optional<Login> authenticateUser(String email, String password) {
        return loginRepository.findByEmailAndPassword(email, password);
    }

    @Override
    public Login saveLogin(Login login) {
        return loginRepository.save(login);
    }

    @Override
    public boolean existsByEmail(String email) {
        return loginRepository.existsByEmail(email);
    }

    @Override
    public void deleteLogin(Integer id) {
        loginRepository.deleteById(id);
    }

    @Override
    public Login updateLogin(Integer id, Login loginDetails) {
        Optional<Login> existingLogin = loginRepository.findById(id);
        if (existingLogin.isPresent()) {
            Login login = existingLogin.get();
            login.setEmail(loginDetails.getEmail());
            login.setPassword(loginDetails.getPassword());
            return loginRepository.save(login);
        }
        throw new ResourceNotFoundException("Login not found with id: " + id);
    }
}
