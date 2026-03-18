package com.portfolio.backend.controller;

import com.portfolio.backend.dto.AdministratorRegistrationRequest;
import com.portfolio.backend.entity.Administrator;
import com.portfolio.backend.entity.Employer;
import com.portfolio.backend.entity.User;
import com.portfolio.backend.repository.AdministratorRepository;
import com.portfolio.backend.repository.EmployerRepository;
import com.portfolio.backend.repository.PortfolioRepository;
import com.portfolio.backend.repository.ResumeAnalysisRepository;
import com.portfolio.backend.repository.UserRepository;
import com.portfolio.backend.service.AdministratorService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.lang.management.ManagementFactory;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = { "http://localhost:3210", "http://localhost:5173", "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost:3001" })
public class AdministratorController {

    private final AdministratorService administratorService;
    private final AdministratorRepository administratorRepository;
    private final UserRepository userRepository;
    private final EmployerRepository employerRepository;
    private final PortfolioRepository portfolioRepository;
    private final ResumeAnalysisRepository resumeAnalysisRepository;

    public AdministratorController(
            AdministratorService administratorService,
            AdministratorRepository administratorRepository,
            UserRepository userRepository,
            EmployerRepository employerRepository,
            PortfolioRepository portfolioRepository,
            ResumeAnalysisRepository resumeAnalysisRepository) {
        this.administratorService = administratorService;
        this.administratorRepository = administratorRepository;
        this.userRepository = userRepository;
        this.employerRepository = employerRepository;
        this.portfolioRepository = portfolioRepository;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
    }

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@Valid @RequestBody AdministratorRegistrationRequest request) {
        try {
            Administrator administrator = administratorService.register(
                    request.getName().trim(),
                    request.getEmail().trim().toLowerCase(),
                    request.getPassword());
            return ResponseEntity.ok(toAdminResponse(administrator));
        } catch (Exception e) {
            if (e.getMessage() != null && e.getMessage().contains("unique constraint") ||
                    e.getMessage() != null && e.getMessage().contains("already exists")) {
                return ResponseEntity.status(409).body(Map.of("error", "Email already registered"));
            }
            return ResponseEntity.status(500).body(Map.of("error", "Registration failed"));
        }
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        String password = body.getOrDefault("password", "");
        if (email.isEmpty() || password.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Optional<Administrator> admin = administratorService.login(email.trim().toLowerCase(), password);
        return admin.<ResponseEntity<?>>map(administrator -> ResponseEntity.ok(toAdminResponse(administrator)))
                .orElseGet(() -> ResponseEntity.status(401).build());
    }

    @GetMapping("/auth/administrator")
    public ResponseEntity<?> getAdminByEmail(@RequestParam("email") String email) {
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return administratorService.findByEmail(email.trim().toLowerCase())
                .<ResponseEntity<?>>map(administrator -> ResponseEntity.ok(toAdminResponse(administrator)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/auth/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || password == null) {
            return ResponseEntity.badRequest().build();
        }
        boolean updated = administratorService.updatePassword(email.trim().toLowerCase(), password);
        if (updated) {
            return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
        } else {
            return ResponseEntity.status(404).body(Map.of("error", "Administrator not found"));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllManagedUsers() {
        List<Map<String, Object>> users = new ArrayList<>();

        for (User user : userRepository.findAll()) {
            users.add(toCandidateSummary(user));
        }

        for (Employer employer : employerRepository.findAll()) {
            users.add(toEmployerSummary(employer));
        }

        users.sort(Comparator.comparing(u -> String.valueOf(u.get("email")), String.CASE_INSENSITIVE_ORDER));
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/candidate/{id}")
    public ResponseEntity<?> deleteCandidate(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        resumeAnalysisRepository.deleteByUser(user);
        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "Candidate deleted successfully"));
    }

    @DeleteMapping("/users/employer/{id}")
    public ResponseEntity<?> deleteEmployer(@PathVariable Long id) {
        if (!employerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        employerRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Employer deleted successfully"));
    }

    @GetMapping("/monitor/summary")
    public ResponseEntity<Map<String, Object>> getSystemSummary() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timestamp", Instant.now());
        response.put("uptimeSeconds", ManagementFactory.getRuntimeMXBean().getUptime() / 1000);
        response.put("administrators", administratorRepository.count());
        response.put("candidates", userRepository.count());
        response.put("employers", employerRepository.count());
        response.put("portfolios", portfolioRepository.count());
        response.put("resumeAnalyses", resumeAnalysisRepository.count());
        response.put("status", "UP");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/monitor/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("timestamp", Instant.now());
        response.put("databaseReachable", true);
        response.put("service", "Administrator API");
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> toAdminResponse(Administrator administrator) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", administrator.getId());
        response.put("name", administrator.getName());
        response.put("email", administrator.getEmail());
        response.put("role", administrator.getRole());
        response.put("createdAt", administrator.getCreatedAt());
        return response;
    }

    private Map<String, Object> toCandidateSummary(User user) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("accountType", "candidate");
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("registeredAt", user.getRegisteredAt());
        return response;
    }

    private Map<String, Object> toEmployerSummary(Employer employer) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("accountType", "employer");
        response.put("id", employer.getId());
        response.put("name", employer.getName());
        response.put("email", employer.getEmail());
        response.put("companyName", employer.getCompanyName());
        response.put("createdAt", employer.getCreatedAt());
        return response;
    }
}