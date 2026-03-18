package com.portfolio.backend.controller;

import com.portfolio.backend.dto.EmployerRegistrationRequest;
import com.portfolio.backend.entity.Employer;
import com.portfolio.backend.service.EmployerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/employer/auth")
@CrossOrigin(origins = { "http://localhost:3210", "http://localhost:5173", "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost:3001" })
public class EmployerAuthController {

    private final EmployerService employerService;

    public EmployerAuthController(EmployerService employerService) {
        this.employerService = employerService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody EmployerRegistrationRequest request) {
        try {
            Employer employer = employerService.register(
                    request.getName().trim(),
                    request.getEmail().trim().toLowerCase(),
                    request.getPassword(),
                    request.getCompanyName());
            return ResponseEntity.ok(employer);
        } catch (Exception e) {
            if ((e.getMessage() != null && e.getMessage().contains("unique constraint")) ||
                    (e.getMessage() != null && e.getMessage().contains("already exists"))) {
                return ResponseEntity.status(409).body(Map.of("error", "Email already registered"));
            }
            return ResponseEntity.status(500).body(Map.of("error", "Registration failed"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Employer> login(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        String password = body.getOrDefault("password", "");
        if (email.isEmpty() || password.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Optional<Employer> employer = employerService.login(email, password);
        return employer.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(401).build());
    }

    @GetMapping("/employer")
    public ResponseEntity<Employer> getEmployerByEmail(@RequestParam("email") String email) {
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return employerService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || password == null) {
            return ResponseEntity.badRequest().build();
        }
        boolean updated = employerService.updatePassword(email, password);
        if (updated) {
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "Employer not found"));
        }
    }
}