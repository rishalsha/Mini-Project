package com.portfolio.backend.dto;

import java.util.List;

public class ResumeAnalysis {
    private Integer score;
    private String summary;
    private List<String> strengths;
    private List<String> weaknesses;
    private String marketOutlook;
    private List<JobRecommendation> jobRecommendations;

    // Getters and Setters
    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }

    public List<String> getWeaknesses() {
        return weaknesses;
    }

    public void setWeaknesses(List<String> weaknesses) {
        this.weaknesses = weaknesses;
    }

    public String getMarketOutlook() {
        return marketOutlook;
    }

    public void setMarketOutlook(String marketOutlook) {
        this.marketOutlook = marketOutlook;
    }

    public List<JobRecommendation> getJobRecommendations() {
        return jobRecommendations;
    }

    public void setJobRecommendations(List<JobRecommendation> jobRecommendations) {
        this.jobRecommendations = jobRecommendations;
    }

    public static class JobRecommendation {
        private String title;
        private String company;
        private String location;
        private String matchReason;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getCompany() {
            return company;
        }

        public void setCompany(String company) {
            this.company = company;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public String getMatchReason() {
            return matchReason;
        }

        public void setMatchReason(String matchReason) {
            this.matchReason = matchReason;
        }
    }
}
