package com.example.Security;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.cors.allowed-origins:http://localhost:4200,http://127.0.0.1:4200,http://localhost:*,http://127.0.0.1:*}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/", "/health").permitAll()
                .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/validate", "/api/auth/test-email").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/auth/change-password").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/auth/profile-photo").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/auth/profile-photo").authenticated()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                .requestMatchers("/api/roles/**").hasRole("ADMIN")
                .requestMatchers("/api/login/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/login/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/event-participants").hasAnyRole("ADMIN", "FACULTY", "STUDENT")
                .requestMatchers(HttpMethod.POST, "/api/registrations").hasRole("STUDENT")
                .requestMatchers(HttpMethod.GET, "/api/registrations/pending").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.PATCH, "/api/registrations/*/approve").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.PATCH, "/api/registrations/*/reject").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.POST, "/api/attendance/qr-session/start").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.POST, "/api/attendance/qr-session/*/refresh").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.POST, "/api/attendance/qr-session/*/end").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.GET, "/api/attendance/qr-session/*").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(HttpMethod.POST, "/api/attendance/scan").hasRole("STUDENT")
                .requestMatchers(HttpMethod.PATCH, "/api/announcements/*/read").hasAnyRole("ADMIN", "FACULTY", "STUDENT")
                .requestMatchers(HttpMethod.PATCH, "/api/tasks/*/complete").hasAnyRole("ADMIN", "FACULTY", "STUDENT")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(org.springframework.http.HttpMethod.PATCH, "/api/**").hasAnyRole("ADMIN", "FACULTY")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/**").authenticated()
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()));
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> originPatterns = Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isEmpty())
            .toList();

        configuration.setAllowedOriginPatterns(originPatterns);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}