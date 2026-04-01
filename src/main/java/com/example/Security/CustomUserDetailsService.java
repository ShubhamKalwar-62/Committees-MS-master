package com.example.Security;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.Entity.Login;
import com.example.Repository.LoginRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private LoginRepository loginRepository;
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Login login = loginRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        
        List<GrantedAuthority> authorities = new ArrayList<>();
        
        // Use the role from the Login entity
        String role = login.getRole() != null ? login.getRole() : "STUDENT";
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
        
        return new User(login.getEmail(), login.getPassword(), authorities);
    }
    
    public String getUserRole(String email) {
        Login login = loginRepository.findByEmail(email).orElse(null);
        if (login != null && login.getRole() != null) {
            return login.getRole();
        }
        return "STUDENT"; // Default role
    }
}