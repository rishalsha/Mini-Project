package com.portfolio.backend.dto;

public class ParseResponse {
    private PortfolioData portfolio;
    private ResumeAnalysis analysis;

    public PortfolioData getPortfolio() {
        return portfolio;
    }

    public void setPortfolio(PortfolioData portfolio) {
        this.portfolio = portfolio;
    }

    public ResumeAnalysis getAnalysis() {
        return analysis;
    }

    public void setAnalysis(ResumeAnalysis analysis) {
        this.analysis = analysis;
    }
}
