package com.portfolio.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resume_analyses")
public class ResumeAnalysisEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "resume_text", columnDefinition = "TEXT", nullable = false)
    private String resumeText;

    @Column(name = "analysis_scores", columnDefinition = "TEXT")
    private String analysisScores; // JSON string

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths; // JSON array string

    @Column(name = "weaknesses", columnDefinition = "TEXT")
    private String weaknesses; // JSON array string

    @Column(name = "identified_skills", columnDefinition = "TEXT")
    private String identifiedSkills; // JSON array string

    @Column(name = "recommended_skills", columnDefinition = "TEXT")
    private String recommendedSkills; // JSON array string

    @Column(name = "analyzed_at", nullable = false)
    private LocalDateTime analyzedAt;

    @PrePersist
    void onAnalyze() {
        if (analyzedAt == null) {
            analyzedAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getResumeText() { return resumeText; }
    public void setResumeText(String resumeText) { this.resumeText = resumeText; }
    public String getAnalysisScores() { return analysisScores; }
    public void setAnalysisScores(String analysisScores) { this.analysisScores = analysisScores; }
    public String getStrengths() { return strengths; }
    public void setStrengths(String strengths) { this.strengths = strengths; }
    public String getWeaknesses() { return weaknesses; }
    public void setWeaknesses(String weaknesses) { this.weaknesses = weaknesses; }
    public String getIdentifiedSkills() { return identifiedSkills; }
    public void setIdentifiedSkills(String identifiedSkills) { this.identifiedSkills = identifiedSkills; }
    public String getRecommendedSkills() { return recommendedSkills; }
    public void setRecommendedSkills(String recommendedSkills) { this.recommendedSkills = recommendedSkills; }
    public LocalDateTime getAnalyzedAt() { return analyzedAt; }
    public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
}
