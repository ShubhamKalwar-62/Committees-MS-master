package com.example.Service;

import com.example.Entity.Users;
import com.example.Entity.Login;
import com.example.Repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsersService {
    
    @Autowired
    private UsersRepository usersRepository;
    
    public List<Users> getAllUsers() {
        return usersRepository.findAll();
    }
    
    public Optional<Users> getUserById(Integer id) {
        return usersRepository.findById(id);
    }
    
    public Optional<Users> getUserByEmail(String email) {
        return usersRepository.findByEmail(email);
    }
    
    public List<Users> getUsersByLogin(Login login) {
        return usersRepository.findByLogin(login);
    }
    
    public List<Users> getUsersByNameContaining(String name) {
        return usersRepository.findByNameContaining(name);
    }
    
    public Users saveUser(Users user) {
        return usersRepository.save(user);
    }
    
    public void deleteUser(Integer id) {
        usersRepository.deleteById(id);
    }
    
    public Users updateUser(Integer id, Users userDetails) {
        Optional<Users> existingUser = usersRepository.findById(id);
        if (existingUser.isPresent()) {
            Users user = existingUser.get();
            user.setName(userDetails.getName());
            user.setLogin(userDetails.getLogin());
            return usersRepository.save(user);
        }
        return null;
    }
}