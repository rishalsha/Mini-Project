package com.portfolio.backend.controller;

import com.portfolio.backend.entity.Portfolio;
import com.portfolio.backend.repository.PortfolioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/portfolios")
@CrossOrigin(origins = { "http://localhost:3210", "http://localhost:5173", "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost:3001" })
public class PortfolioController {

    private final PortfolioRepository portfolioRepository;

    public PortfolioController(PortfolioRepository portfolioRepository) {
        this.portfolioRepository = portfolioRepository;
    }

    @GetMapping
    public ResponseEntity<List<Portfolio>> getAllPortfolios() {
        // Get all portfolios, grouped by email (latest only)
        List<Portfolio> allPortfolios = portfolioRepository.findAll();

        // Filter to keep only the latest portfolio per email
        java.util.Map<String, Portfolio> uniquePortfolios = new java.util.HashMap<>();
        for (Portfolio p : allPortfolios) {
            String email = p.getEmail() != null ? p.getEmail().toLowerCase() : "";
            if (email.isEmpty() || p.getFullName() == null || p.getFullName().trim().isEmpty()) {
                continue; // Skip incomplete portfolios
            }

            Portfolio existing = uniquePortfolios.get(email);
            if (existing == null ||
                    (p.getUpdatedAt() != null && existing.getUpdatedAt() != null &&
                            p.getUpdatedAt().isAfter(existing.getUpdatedAt()))) {
                uniquePortfolios.put(email, p);
            }
        }

        return ResponseEntity.ok(new java.util.ArrayList<>(uniquePortfolios.values()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Portfolio>> searchPortfolios(@RequestParam("name") String name) {
        List<Portfolio> portfolios = portfolioRepository.findByFullNameContainingIgnoreCase(name);
        return ResponseEntity.ok(portfolios);
    }

    @GetMapping("/{email}")
    public ResponseEntity<Portfolio> getPortfolioByEmail(@PathVariable String email) {
        return portfolioRepository
                .findLatestNonEmptyByEmail(email)
                .or(() -> portfolioRepository.findFirstByEmailIgnoreCaseOrderByUpdatedAtDesc(email))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-email")
    public ResponseEntity<Portfolio> getPortfolioByEmailQuery(@RequestParam("email") String email) {
        return portfolioRepository
                .findLatestNonEmptyByEmail(email)
                .or(() -> portfolioRepository.findFirstByEmailIgnoreCaseOrderByUpdatedAtDesc(email))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/resume")
    public ResponseEntity<Resource> downloadResume(@PathVariable Long id) {
        try {
            Portfolio portfolio = portfolioRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Portfolio not found"));

            return buildResumeResponse(portfolio);
        } catch (Exception e) {
            System.err.println("Error downloading resume: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/by-email/resume")
    public ResponseEntity<Resource> downloadLatestResumeByEmail(@RequestParam("email") String email) {
        try {
            Portfolio portfolio = portfolioRepository
                    .findFirstByEmailIgnoreCaseOrderByUpdatedAtDesc(email)
                    .orElseThrow(() -> new RuntimeException("Portfolio not found"));

            return buildResumeResponse(portfolio);
        } catch (Exception e) {
            System.err.println("Error downloading resume: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    private ResponseEntity<Resource> buildResumeResponse(Portfolio portfolio) {
        try {
            if (portfolio.getResumeFilePath() == null) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get("uploads/resumes/" + portfolio.getResumeFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String filename = portfolio.getFullName() != null
                        ? portfolio.getFullName().replace(" ", "_") + "_Resume.pdf"
                        : "Resume.pdf";

                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                        .header(HttpHeaders.CONTENT_TYPE, "application/pdf")
                        .body(resource);
            }

            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error building resume response: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
