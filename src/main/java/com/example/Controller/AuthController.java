package com.example.Controller;

import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.Entity.Committee;
import com.example.Entity.Login;
import com.example.Entity.Roles;
import com.example.Entity.Users;
import com.example.Repository.LoginRepository;
import com.example.Repository.RolesRepository;
import com.example.Repository.UsersRepository;
import com.example.Response.ResponceBean;
import com.example.Security.JwtUtil;
import com.example.Service.EmailService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private static final long MAX_PROFILE_PHOTO_SIZE_BYTES = 2L * 1024L * 1024L;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private LoginRepository loginRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RolesRepository rolesRepository;

    @Autowired
    private EmailService emailService;

    @Value("${app.file-upload-dir:uploads}")
    private String fileUploadDir;

    @PostMapping("/login")
    public ResponseEntity<ResponceBean<Map<String, Object>>> login(@RequestBody LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(), 
                    loginRequest.getPassword()
                )
            );

            // Get user details
            Login login = loginRepository.findByEmail(loginRequest.getEmail()).orElse(null);
            if (login == null) {
                return ResponseEntity.badRequest()
                    .body(new ResponceBean<>(false, "User not found"));
            }

            // Generate JWT token with role
            String token = jwtUtil.generateToken(loginRequest.getEmail(), login.getRole());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("email", loginRequest.getEmail());
            response.put("role", login.getRole());

            return ResponseEntity.ok(new ResponceBean<>(true, "Login successful", response));

        } catch (AuthenticationException e) {
            return ResponseEntity.badRequest()
                .body(new ResponceBean<>(false, "Invalid credentials"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ResponceBean<Map<String, Object>>> register(@RequestBody RegisterRequest registerRequest) {
        try {
            String requestedRole = registerRequest.getRole() == null
                    ? "STUDENT"
                    : registerRequest.getRole().trim().toUpperCase();

            if (!Set.of("STUDENT", "FACULTY", "ADMIN").contains(requestedRole)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponceBean<>(false, "Invalid role. Allowed roles are STUDENT, FACULTY, ADMIN."));
            }

            if ("ADMIN".equals(requestedRole) && loginRepository.existsByRoleIgnoreCase("ADMIN")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponceBean<>(false, "Only one ADMIN account is allowed."));
            }

            // Check if email already exists
            if (loginRepository.existsByEmail(registerRequest.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(new ResponceBean<>(false, "Email already exists"));
            }

            // Create new login
            Login login = new Login();
            login.setEmail(registerRequest.getEmail());
            login.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            login.setRole(requestedRole);
                Roles role = rolesRepository.findByRoleName(requestedRole)
                    .stream()
                    .findFirst()
                    .orElse(null);
                login.setRoleRef(role);
            loginRepository.save(login);

            // Create new user if provided
            if (registerRequest.getName() != null) {
                Users user = new Users();
                user.setName(registerRequest.getName());
                user.setLogin(login);
                usersRepository.save(user);
            }

            boolean mailSent = false;
            String mailMessage = "Email skipped or not configured";

            // Email is optional and should not block successful registration.
            try {
                mailSent = emailService.sendRegistrationSuccessEmail(registerRequest.getEmail(), registerRequest.getName());
                if (mailSent) {
                    mailMessage = "Registration email sent";
                }
            } catch (Exception mailEx) {
                logger.warn("Registration succeeded but email failed for {}: {}", registerRequest.getEmail(), mailEx.getMessage());
                mailMessage = "Registration completed, but email failed to send";
            }

            Map<String, Object> response = new HashMap<>();
            response.put("email", registerRequest.getEmail());
            response.put("role", login.getRole());
            response.put("mailSent", mailSent);
            response.put("mailMessage", mailMessage);

            return ResponseEntity.ok(new ResponceBean<>(true, "Registration successful", response));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ResponceBean<>(false, "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<ResponceBean<Map<String, Object>>> validateToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        
        try {
            if (token != null) {
                String username = jwtUtil.extractUsername(token);
                String role = jwtUtil.extractRole(token);
                
                Map<String, Object> response = new HashMap<>();
                response.put("valid", true);
                response.put("username", username);
                response.put("role", role);
                
                return ResponseEntity.ok(new ResponceBean<>(true, "Token is valid", response));
            }
        } catch (Exception e) {
            // Token is invalid
        }
        
        return ResponseEntity.badRequest()
            .body(new ResponceBean<>(false, "Invalid token"));
    }

    @PostMapping("/test-email")
    public ResponseEntity<ResponceBean<Map<String, Object>>> sendTestEmail(@RequestBody TestEmailRequest testEmailRequest) {
        if (testEmailRequest.getEmail() == null || testEmailRequest.getEmail().isBlank()) {
            return ResponseEntity.badRequest()
                .body(new ResponceBean<>(false, "Email is required"));
        }

        try {
            boolean sent = emailService.sendRegistrationSuccessEmail(testEmailRequest.getEmail(), testEmailRequest.getName());

            Map<String, Object> response = new HashMap<>();
            response.put("email", testEmailRequest.getEmail());
            response.put("mailSent", sent);
            response.put("mailMessage", sent ? "Test email sent" : "Email skipped because app.mail.enabled=false");

            return ResponseEntity.ok(new ResponceBean<>(true, "Test email processed", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(new ResponceBean<>(false, "Test email failed: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ResponceBean<Map<String, Object>>> getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email == null || email.isBlank() || "anonymousUser".equalsIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponceBean<>(false, "Unauthorized"));
        }

        Login login = loginRepository.findByEmail(email).orElse(null);
        if (login == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponceBean<>(false, "Profile not found"));
        }

        Users user = usersRepository.findByLoginEmail(email).orElse(null);

        Map<String, Object> response = new HashMap<>();
        response.put("email", login.getEmail());
        response.put("role", login.getRole());
        response.put("name", user != null ? user.getName() : "");
        response.put("userId", user != null ? user.getUserId() : null);

        List<Map<String, Object>> committeeMemberships = new ArrayList<>();
        Set<Integer> seenCommitteeIds = new HashSet<>();

        Roles roleRef = login.getRoleRef();
        if (roleRef != null) {
            addCommitteeMembership(committeeMemberships, seenCommitteeIds, roleRef.getCommittee(), roleRef.getRoleName());
        }

        List<Committee> managedCommittees = login.getCommittees();
        if (managedCommittees != null) {
            for (Committee committee : managedCommittees) {
                addCommitteeMembership(committeeMemberships, seenCommitteeIds, committee, "Committee Owner");
            }
        }

        if (!committeeMemberships.isEmpty()) {
            response.put("committeeMemberships", committeeMemberships);
        }

        String photoDataUrl = buildProfilePhotoDataUrl(login.getLoginId());
        if (photoDataUrl != null) {
            response.put("photoDataUrl", photoDataUrl);
        }

        return ResponseEntity.ok(new ResponceBean<>(true, "Profile fetched", response));
    }

    private void addCommitteeMembership(
            List<Map<String, Object>> target,
            Set<Integer> seenCommitteeIds,
            Committee committee,
            String memberRole) {
        if (committee == null || committee.getCommitteeId() == null || seenCommitteeIds.contains(committee.getCommitteeId())) {
            return;
        }

        seenCommitteeIds.add(committee.getCommitteeId());
        Map<String, Object> item = new HashMap<>();
        item.put("committeeId", committee.getCommitteeId());
        item.put("committeeName", committee.getCommitteeName());
        item.put("memberRole", memberRole);
        item.put("facultyInchargeName", committee.getFacultyInchargeName());
        target.add(item);
    }

    @PostMapping(value = "/profile-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResponceBean<Map<String, Object>>> uploadMyProfilePhoto(@RequestParam("photo") MultipartFile photo) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email == null || email.isBlank() || "anonymousUser".equalsIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponceBean<>(false, "Unauthorized"));
        }

        if (photo == null || photo.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ResponceBean<>(false, "Profile photo file is required"));
        }

        if (photo.getSize() > MAX_PROFILE_PHOTO_SIZE_BYTES) {
            return ResponseEntity.badRequest()
                    .body(new ResponceBean<>(false, "Profile photo must be <= 2MB"));
        }

        String rawContentType = photo.getContentType();
        String contentType = rawContentType == null ? "" : rawContentType.toLowerCase();
        if (!contentType.startsWith("image/")) {
            return ResponseEntity.badRequest()
                    .body(new ResponceBean<>(false, "Only image files are allowed"));
        }

        Login login = loginRepository.findByEmail(email).orElse(null);
        if (login == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponceBean<>(false, "Profile not found"));
        }

        try {
            Path profileDir = getProfilePhotoDirectory();
            Files.createDirectories(profileDir);

            removeExistingProfilePhotos(profileDir, login.getLoginId());

            String extension = resolveImageExtension(photo.getOriginalFilename(), contentType);
            Path targetPath = profileDir.resolve("user-" + login.getLoginId() + "." + extension);
            Files.copy(photo.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String photoDataUrl = buildProfilePhotoDataUrl(login.getLoginId());
            Map<String, Object> response = new HashMap<>();
            response.put("photoDataUrl", photoDataUrl);

            return ResponseEntity.ok(new ResponceBean<>(true, "Profile photo updated successfully", response));
        } catch (IOException ex) {
            logger.error("Failed to save profile photo for {}: {}", email, ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponceBean<>(false, "Unable to save profile photo"));
        }
    }

    @DeleteMapping("/profile-photo")
    public ResponseEntity<ResponceBean<Map<String, Object>>> removeMyProfilePhoto() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email == null || email.isBlank() || "anonymousUser".equalsIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponceBean<>(false, "Unauthorized"));
        }

        Login login = loginRepository.findByEmail(email).orElse(null);
        if (login == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponceBean<>(false, "Profile not found"));
        }

        try {
            removeExistingProfilePhotos(getProfilePhotoDirectory(), login.getLoginId());
            return ResponseEntity.ok(new ResponceBean<>(true, "Profile photo removed", new HashMap<>()));
        } catch (IOException ex) {
            logger.error("Failed to remove profile photo for {}: {}", email, ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ResponceBean<>(false, "Unable to remove profile photo"));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<ResponceBean<Map<String, Object>>> changeMyPassword(@RequestBody ChangePasswordRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (email == null || email.isBlank() || "anonymousUser".equalsIgnoreCase(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ResponceBean<>(false, "Unauthorized"));
        }

        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()
                || request.getNewPassword() == null || request.getNewPassword().isBlank()
                || request.getConfirmPassword() == null || request.getConfirmPassword().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(new ResponceBean<>(false, "currentPassword, newPassword and confirmPassword are required"));
        }

        if (request.getNewPassword().length() < 6) {
            return ResponseEntity.badRequest()
                    .body(new ResponceBean<>(false, "New password must be at least 6 characters"));
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest()
                    .body(new ResponceBean<>(false, "New password and confirm password do not match"));
        }

        Login login = loginRepository.findByEmail(email).orElse(null);
        if (login == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponceBean<>(false, "Profile not found"));
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), login.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponceBean<>(false, "Current password is incorrect"));
        }

        login.setPassword(passwordEncoder.encode(request.getNewPassword()));
        loginRepository.save(login);

        Map<String, Object> response = new HashMap<>();
        response.put("email", login.getEmail());
        response.put("role", login.getRole());

        return ResponseEntity.ok(new ResponceBean<>(true, "Password updated successfully", response));
    }

    // DTOs for request bodies
    public static class LoginRequest {
        private String email;
        private String password;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String email;
        private String password;
        private String role;
        private String name;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class TestEmailRequest {
        private String email;
        private String name;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;
        private String confirmPassword;

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

        public String getConfirmPassword() { return confirmPassword; }
        public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    }

    private Path getProfilePhotoDirectory() {
        return Paths.get(fileUploadDir, "profile-photos");
    }

    private void removeExistingProfilePhotos(Path directory, Integer loginId) throws IOException {
        if (!Files.exists(directory)) {
            return;
        }

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(directory, "user-" + loginId + ".*")) {
            for (Path path : stream) {
                Files.deleteIfExists(path);
            }
        }
    }

    private String buildProfilePhotoDataUrl(Integer loginId) {
        try {
            Path directory = getProfilePhotoDirectory();
            if (!Files.exists(directory)) {
                return null;
            }

            try (DirectoryStream<Path> stream = Files.newDirectoryStream(directory, "user-" + loginId + ".*")) {
                for (Path path : stream) {
                    byte[] bytes = Files.readAllBytes(path);
                    String mimeType = Files.probeContentType(path);
                    if (mimeType == null || !mimeType.startsWith("image/")) {
                        mimeType = "image/png";
                    }
                    return "data:" + mimeType + ";base64," + Base64.getEncoder().encodeToString(bytes);
                }
            }
        } catch (IOException ex) {
            logger.warn("Unable to read profile photo for loginId {}: {}", loginId, ex.getMessage());
        }
        return null;
    }

    private String resolveImageExtension(String originalFileName, String contentType) {
        if (contentType.contains("png")) {
            return "png";
        }
        if (contentType.contains("jpeg") || contentType.contains("jpg")) {
            return "jpg";
        }
        if (contentType.contains("webp")) {
            return "webp";
        }

        if (originalFileName != null && originalFileName.contains(".")) {
            String extension = originalFileName.substring(originalFileName.lastIndexOf('.') + 1).toLowerCase();
            if (!extension.isBlank()) {
                return extension;
            }
        }

        return "png";
    }
}