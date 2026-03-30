package com.portfolio.backend.controller;

import com.portfolio.backend.dto.EmployerRegistrationRequest;
import com.portfolio.backend.entity.Employer;
import com.portfolio.backend.service.EmployerService;
import com.portfolio.backend.service.FirebaseIdentityService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/employer/auth")
@CrossOrigin(origins = { "http://localhost:3210", "http://localhost:5173", "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost:3001" })
public class EmployerAuthController {

    private final EmployerService employerService;
    private final FirebaseIdentityService firebaseIdentityService;

    public EmployerAuthController(EmployerService employerService, FirebaseIdentityService firebaseIdentityService) {
        this.employerService = employerService;
        this.firebaseIdentityService = firebaseIdentityService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody EmployerRegistrationRequest request) {
        try {
            if (request.getFirebaseIdToken() == null || request.getFirebaseIdToken().isBlank()) {
                return ResponseEntity.status(401).body(Map.of("error", "Firebase ID token is required"));
            }
            firebaseIdentityService.assertVerifiedIdentity(request.getFirebaseIdToken(), request.getEmail());
            Employer employer = employerService.register(
                    request.getName().trim(),
                    request.getEmail().trim().toLowerCase(),
                    request.getPassword(),
                    request.getCompanyName());
            return ResponseEntity.ok(employer);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            if ((e.getMessage() != null && e.getMessage().contains("unique constraint")) ||
                    (e.getMessage() != null && e.getMessage().contains("already exists"))) {
                return ResponseEntity.status(409).body(Map.of("error", "Email already registered"));
            }
            return ResponseEntity.status(500).body(Map.of("error", "Registration failed"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String password = body.getOrDefault("password", "");
        String firebaseIdToken = body.getOrDefault("firebaseIdToken", "");
        String name = body.getOrDefault("name", "").trim();
        String companyName = body.getOrDefault("companyName", "").trim();

        if (email.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        if (!firebaseIdToken.isEmpty()) {
            try {
                firebaseIdentityService.assertVerifiedIdentity(firebaseIdToken, email);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
            } catch (IllegalStateException e) {
                return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
            }

            Optional<Employer> existing = employerService.findByEmail(email);
            if (existing.isPresent()) {
                return ResponseEntity.ok(existing.get());
            }

            String resolvedName = name.isBlank() ? email.split("@")[0] : name;
            String resolvedCompany = companyName.isBlank() ? "Independent" : companyName;
            String generatedPassword = UUID.randomUUID() + "Aa1!";
            Employer created = employerService.register(resolvedName, email, generatedPassword, resolvedCompany);
            return ResponseEntity.ok(created);
        }

        if (password.isEmpty()) {
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