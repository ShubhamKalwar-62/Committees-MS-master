package com.example.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Entity.Login;
import com.example.Entity.Users;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.UsersRepository;

@Service
public class UsersServiceImpl implements UsersService {

    @Autowired
    private UsersRepository usersRepository;

    @Override
    public List<Users> getAllUsers() {
        return usersRepository.findAll();
    }

    @Override
    public Optional<Users> getUserById(Integer id) {
        return usersRepository.findById(Objects.requireNonNull(id, "id must not be null"));
    }

    @Override
    public Optional<Users> getUserByEmail(String email) {
        return usersRepository.findByEmail(email);
    }

    @Override
    public List<Users> getUsersByLogin(Login login) {
        return usersRepository.findByLogin(login);
    }

    @Override
    public List<Users> getUsersByNameContaining(String name) {
        return usersRepository.findByNameContaining(name);
    }

    @Override
    public Users saveUser(Users user) {
        return usersRepository.save(Objects.requireNonNull(user, "user must not be null"));
    }

    @Override
    public void deleteUser(Integer id) {
        usersRepository.deleteById(Objects.requireNonNull(id, "id must not be null"));
    }

    @Override
    public Users updateUser(Integer id, Users userDetails) {
        Optional<Users> existingUser = usersRepository.findById(Objects.requireNonNull(id, "id must not be null"));
        if (existingUser.isPresent()) {
            Users user = existingUser.get();
            user.setName(userDetails.getName());
            user.setLogin(userDetails.getLogin());
            return usersRepository.save(user);
        }
        throw new ResourceNotFoundException("User not found with id: " + id);
    }
}
