package com.portfolio.backend.controller;

import com.portfolio.backend.dto.ErrorResponse;
import com.portfolio.backend.dto.ParseResponse;
import com.portfolio.backend.dto.PortfolioData;
import com.portfolio.backend.dto.ResumeAnalysis;
import com.portfolio.backend.entity.Portfolio;
import com.portfolio.backend.entity.ResumeAnalysisEntity;
import com.portfolio.backend.service.DocumentParserService;
import com.portfolio.backend.service.GeminiService;
import com.portfolio.backend.service.PortfolioService;
import com.portfolio.backend.repository.ResumeAnalysisRepository;
import com.portfolio.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = { "http://localhost:3210", "http://localhost:5173", "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost:3001" })
public class ResumeController {

    private final DocumentParserService documentParserService;
    private final GeminiService geminiService;
    private final PortfolioService portfolioService;
    private final ResumeAnalysisRepository resumeAnalysisRepository;
    private final UserRepository userRepository;

    public ResumeController(DocumentParserService documentParserService,
            GeminiService geminiService,
            PortfolioService portfolioService,
            ResumeAnalysisRepository resumeAnalysisRepository,
            UserRepository userRepository) {
        this.documentParserService = documentParserService;
        this.geminiService = geminiService;
        this.portfolioService = portfolioService;
        this.resumeAnalysisRepository = resumeAnalysisRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/parse")
    public ResponseEntity<?> parseResume(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "text", required = false) String text,
            @RequestParam(value = "userEmail", required = false) String userEmail) {

        try {
            String resumeText;
            MultipartFile resumeFile = null;

            if (file != null && !file.isEmpty()) {
                System.out.println("Processing file: " + file.getOriginalFilename());
                resumeText = documentParserService.extractText(file);
                resumeFile = file;
            } else if (text != null && !text.isEmpty()) {
                System.out.println("Processing text input");
                resumeText = text;
            } else {
                return ResponseEntity.badRequest().build();
            }

            if (resumeText == null || resumeText.trim().isEmpty()) {
                ErrorResponse error = new ErrorResponse(
                        "No readable text was found in the uploaded resume. Please upload a text-based PDF or use Paste Text.");
                return ResponseEntity.badRequest().body(error);
            }

            System.out.println("Parsing resume with Gemini...");
            PortfolioData portfolio = geminiService.parseResume(resumeText);

            // Validate parsed data quality - reject obvious address/location misparses
            if (portfolio.getFullName() == null || portfolio.getFullName().trim().isEmpty()) {
                ErrorResponse error = new ErrorResponse(
                    "Failed to parse resume properly. The AI service may be unavailable. Please verify Gemini API configuration and try again.");
                return ResponseEntity.status(503).body(error);
            }

            String nameLC = portfolio.getFullName().toLowerCase();
            if (nameLC.contains("house") || nameLC.contains("street") || nameLC.contains("road") ||
                    nameLC.contains("avenue") || nameLC.contains("blvd") || nameLC.contains("apt") ||
                    nameLC.contains("apartment") || nameLC.contains("suite") || nameLC.contains("unit") ||
                    portfolio.getFullName().matches(".*\\d{3,}.*")) { // Only reject if 3+ consecutive digits (like zip
                                                                      // code)
                ErrorResponse error = new ErrorResponse(
                    "Failed to parse resume properly. The AI service may be unavailable. Please verify Gemini API configuration and try again.");
                return ResponseEntity.status(503).body(error);
            }

            // Super relaxed validation: Check if email OR any part of the name matches
            if (userEmail != null && !userEmail.trim().isEmpty()) {
                String userEmailLC = userEmail.trim().toLowerCase();
                String resumeTextLC = resumeText.toLowerCase();

                boolean match = resumeTextLC.contains(userEmailLC);

                if (!match) {
                    // Try matching by name parts if email isn't found
                    String userName = userRepository.findByEmail(userEmail)
                            .map(com.portfolio.backend.entity.User::getName)
                            .orElse("");

                    if (!userName.isEmpty()) {
                        String[] nameParts = userName.toLowerCase().split("\\s+");
                        for (String part : nameParts) {
                            if (part.length() > 2 && resumeTextLC.contains(part)) {
                                match = true;
                                break;
                            }
                        }
                    }
                }

                if (!match) {
                    ErrorResponse error = new ErrorResponse(
                            "Resume validation failed. We couldn't find your name or email in the uploaded document.");
                    return ResponseEntity.badRequest().body(error);
                }

                // If AI parsed a different email (or failed to parse one),
                // override it with the verified account email
                if (portfolio.getEmail() == null || !portfolio.getEmail().trim().equalsIgnoreCase(userEmailLC)) {
                    portfolio.setEmail(userEmail.trim());
                }
            }

            System.out.println("Analyzing resume with Gemini...");
            ResumeAnalysis analysis = geminiService.analyzeResume(resumeText);

            ParseResponse response = new ParseResponse();
            response.setPortfolio(portfolio);
            response.setAnalysis(analysis);

            // Save to PostgreSQL database
            System.out.println("Saving portfolio to database...");
            Portfolio savedPortfolio = portfolioService.savePortfolio(response, resumeFile);
            System.out.println("Portfolio saved with ID: " + savedPortfolio.getId());

            // Set the saved portfolio ID in the response
            portfolio.setId(savedPortfolio.getId());
            response.setPortfolio(portfolio);

            // Persist analysis per user (if available)
            userRepository.findByEmail(portfolio.getEmail()).ifPresent(user -> {
                ResumeAnalysisEntity ra = new ResumeAnalysisEntity();
                ra.setUser(user);
                ra.setResumeText(resumeText);
                ra.setAnalysisScores("{\"overall\":" + (analysis.getScore() == null ? 0 : analysis.getScore()) + "}");
                ra.setStrengths(com.fasterxml.jackson.databind.json.JsonMapper.builder().build()
                        .valueToTree(analysis.getStrengths()).toString());
                ra.setWeaknesses(com.fasterxml.jackson.databind.json.JsonMapper.builder().build()
                        .valueToTree(analysis.getWeaknesses()).toString());
                ra.setIdentifiedSkills(com.fasterxml.jackson.databind.json.JsonMapper.builder().build()
                        .valueToTree(portfolio.getSkills()).toString());
                ra.setRecommendedSkills("[]");
                resumeAnalysisRepository.save(ra);
            });

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Error processing resume: " + e.getMessage());
            e.printStackTrace();
            // Return a proper error response
            ErrorResponse error = new ErrorResponse(
                    "Unable to process resume. Please verify Gemini API configuration and try again. Error: "
                            + e.getMessage());
            return ResponseEntity.status(503).body(error);
        }
    }

    @org.springframework.transaction.annotation.Transactional
    @PostMapping("/clear-and-reanalyze")
    public ResponseEntity<?> clearAndReanalyze(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "text", required = false) String text,
            @RequestParam(value = "userEmail", required = false) String userEmail) {

        // Remove existing portfolio and analysis for this email to force a fresh AI
        // parse
        if (userEmail != null && !userEmail.trim().isEmpty()) {
            System.out.println("Clearing existing data to force re-analysis: " + userEmail);

            // Clear portfolio
            portfolioService.deletePortfolioByEmail(userEmail);

            // Clear analysis history
            userRepository.findByEmail(userEmail).ifPresent(user -> {
                resumeAnalysisRepository.deleteByUser(user);
            });
        }

        return parseResume(file, text, userEmail);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Resume API is running");
    }
}
