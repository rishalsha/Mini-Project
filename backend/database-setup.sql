-- PostgreSQL Database Setup for Portfolio Backend

-- Create database (run this as postgres superuser)
-- CREATE DATABASE portfolio_db;

-- Connect to the database
-- \c portfolio_db;

-- The Spring Boot application will automatically create the tables
-- using JPA/Hibernate with ddl-auto=update

-- But you can also create them manually if needed:

CREATE TABLE IF NOT EXISTS portfolios (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    headline VARCHAR(500),
    about TEXT,
    location VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    linkedin VARCHAR(500),
    github VARCHAR(500),
    website VARCHAR(500),
    skills_json TEXT,
    experience_json TEXT,
    education_json TEXT,
    projects_json TEXT,
    resume_score INTEGER,
    resume_summary TEXT,
    strengths_json TEXT,
    weaknesses_json TEXT,
    market_outlook TEXT,
    job_recommendations_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_portfolios_email ON portfolios(email);
CREATE INDEX IF NOT EXISTS idx_portfolios_full_name ON portfolios(full_name);
CREATE INDEX IF NOT EXISTS idx_portfolios_created_at ON portfolios(created_at);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resume_file_path VARCHAR(1000)
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Resume Analyses table
CREATE TABLE IF NOT EXISTS resume_analyses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_text TEXT NOT NULL,
    analysis_scores TEXT,
    strengths TEXT,
    weaknesses TEXT,
    identified_skills TEXT,
    recommended_skills TEXT,
    analyzed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user ON resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_analyzed_at ON resume_analyses(analyzed_at);

-- Job Recommendations table
CREATE TABLE IF NOT EXISTS job_recommendations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_title VARCHAR(500) NOT NULL,
    company_name VARCHAR(500),
    location VARCHAR(500),
    job_description TEXT,
    job_url VARCHAR(2000),
    match_percentage INTEGER,
    scraped_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_job_recs_user ON job_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_job_recs_scraped_at ON job_recommendations(scraped_at);

