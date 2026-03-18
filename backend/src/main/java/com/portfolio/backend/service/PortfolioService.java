package com.portfolio.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portfolio.backend.dto.ParseResponse;
import com.portfolio.backend.dto.PortfolioData;
import com.portfolio.backend.dto.ResumeAnalysis;
import com.portfolio.backend.entity.Portfolio;
import com.portfolio.backend.entity.User;
import com.portfolio.backend.repository.PortfolioRepository;
import com.portfolio.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private static final String UPLOAD_DIR = "uploads/resumes/";

    public PortfolioService(PortfolioRepository portfolioRepository, UserRepository userRepository) {
        this.portfolioRepository = portfolioRepository;
        this.userRepository = userRepository;
        this.objectMapper = new ObjectMapper();
        // Create upload directory if it doesn't exist
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (Exception e) {
            System.err.println("Could not create upload directory: " + e.getMessage());
        }
    }

    public Portfolio savePortfolio(ParseResponse parseResponse, MultipartFile resumeFile) {
        try {
            PortfolioData data = parseResponse.getPortfolio();
            ResumeAnalysis analysis = parseResponse.getAnalysis();

            // User must exist to create/update portfolio
            User user = userRepository.findByEmail(data.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found. Please register first."));

            // Check if portfolio already exists for this user
            Portfolio portfolio = portfolioRepository.findByEmailIgnoreCase(data.getEmail())
                    .orElse(new Portfolio());

            // Link portfolio to user
            portfolio.setUser(user);

            // Map portfolio data
            portfolio.setFullName(data.getFullName());
            portfolio.setHeadline(data.getHeadline());
            portfolio.setAbout(data.getAbout());
            portfolio.setLocation(data.getLocation());
            portfolio.setEmail(data.getEmail());
            portfolio.setPhone(data.getPhone());
            portfolio.setLinkedin(data.getLinkedin());
            portfolio.setGithub(data.getGithub());
            portfolio.setWebsite(data.getWebsite());

            // Convert lists to JSON strings
            portfolio.setSkillsJson(objectMapper.writeValueAsString(data.getSkills()));
            portfolio.setExperienceJson(objectMapper.writeValueAsString(data.getExperience()));
            portfolio.setEducationJson(objectMapper.writeValueAsString(data.getEducation()));
            portfolio.setProjectsJson(objectMapper.writeValueAsString(data.getProjects()));

            // Map analysis data
            portfolio.setResumeScore(analysis.getScore());
            portfolio.setResumeSummary(analysis.getSummary());
            portfolio.setStrengthsJson(objectMapper.writeValueAsString(analysis.getStrengths()));
            portfolio.setWeaknessesJson(objectMapper.writeValueAsString(analysis.getWeaknesses()));
            portfolio.setMarketOutlook(analysis.getMarketOutlook());
            portfolio.setJobRecommendationsJson(objectMapper.writeValueAsString(analysis.getJobRecommendations()));

            // Save resume file if provided (replace previous both in storage and DB)
            if (resumeFile != null && !resumeFile.isEmpty()) {
                String originalFilename = resumeFile.getOriginalFilename();
                String extension = (originalFilename != null && originalFilename.contains("."))
                        ? originalFilename.substring(originalFilename.lastIndexOf("."))
                        : ".pdf";

                // Use stable filename per user so each upload overwrites the last
                String filename = user.getId() + "_resume" + extension;
                Path uploadDir = Paths.get(UPLOAD_DIR);
                Files.createDirectories(uploadDir);

                // Delete previous file if it exists and is different
                if (portfolio.getResumeFilePath() != null) {
                    Path oldPath = uploadDir.resolve(portfolio.getResumeFilePath());
                    deleteIfExists(oldPath);
                }

                Path filePath = uploadDir.resolve(filename);
                Files.copy(resumeFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                portfolio.setResumeFilePath(filename);
            }

            return portfolioRepository.save(portfolio);
        } catch (Exception e) {
            System.err.println("Error saving portfolio: " + e.getMessage());
            throw new RuntimeException("Failed to save portfolio", e);
        }
    }

    private void deleteIfExists(Path path) {
        try {
            if (Files.exists(path)) {
                Files.delete(path);
            }
        } catch (Exception e) {
            System.err.println("Could not delete old resume file: " + e.getMessage());
        }
    }

    public Portfolio getPortfolioById(Long id) {
        return portfolioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Portfolio not found with id: " + id));
    }

    public Portfolio getPortfolioByEmail(String email) {
        return portfolioRepository
                .findLatestNonEmptyByEmail(email)
                .or(() -> portfolioRepository.findFirstByEmailIgnoreCaseOrderByUpdatedAtDesc(email))
                .orElseThrow(() -> new RuntimeException("Portfolio not found with email: " + email));
    }

    public void deletePortfolioByEmail(String email) {
        portfolioRepository.findByEmailIgnoreCase(email).ifPresent(p -> {
            // Delete file first
            if (p.getResumeFilePath() != null) {
                deleteIfExists(Paths.get(UPLOAD_DIR).resolve(p.getResumeFilePath()));
            }
            portfolioRepository.delete(p);
        });
    }
}
