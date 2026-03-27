# AutoFolio Career AI

Full-stack AI resume analysis and portfolio generation platform.

This repository contains:
- A React + TypeScript + Vite frontend
- A Spring Boot backend with PostgreSQL persistence
- Gemini-powered resume parsing and analysis

## Project Specs

- Frontend: React 19, TypeScript, Vite 6
- Backend: Spring Boot 3.2, Java 17, Maven
- Database: PostgreSQL
- AI: Google Gemini API
- File parsing: Apache Tika + PDFBox
- Auth model: Email + password (BCrypt hashing)
- Roles: Candidate, Employer, Administrator

## Repository Structure

```text
.
├── App.tsx
├── index.tsx
├── components/
│   ├── AuthPage.tsx
│   ├── UploadSection.tsx
│   ├── PortfolioView.tsx
│   ├── AnalysisDashboard.tsx
│   ├── EmployerDashboard.tsx
│   └── AdminDashboard.tsx
├── services/
│   ├── api.ts
│   └── gemini.ts
├── backend/
│   ├── pom.xml
│   ├── src/main/java/com/portfolio/backend/
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   ├── entity/
│   │   ├── dto/
│   │   └── config/
│   └── src/main/resources/application.properties
├── .env.example
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- Java 17+
- Maven 3.8+
- PostgreSQL 14+
- Gemini API key

## Environment Configuration (Single Root `.env`)

Use one `.env` file at repository root.

1. Copy `.env.example` to `.env`.
2. Fill in your real values.

Expected variables:

```env
VITE_API_URL=http://localhost:8080

DB_URL=jdbc:postgresql://localhost:5432/portfolio_db
DB_USERNAME=postgres
DB_PASSWORD=postgres

GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3210
```

Note: Backend config imports root `.env` via `backend/src/main/resources/application.properties`.

## Setup

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Create PostgreSQL database

```sql
CREATE DATABASE portfolio_db;
```

### 3. Build backend

```bash
cd backend
mvn clean install -DskipTests
```

## Run Locally

Open two terminals.

### Terminal A: backend

```bash
cd backend
mvn spring-boot:run
```

Backend default URL: `http://localhost:8080`

Health check:

```bash
curl http://localhost:8080/api/resume/health
```

### Terminal B: frontend

```bash
npm run dev
```

Frontend default URL: `http://localhost:5173`

## API Overview

### Candidate auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/user?email=...`
- `POST /api/auth/reset-password`

### Employer auth

- `POST /api/employer/auth/register`
- `POST /api/employer/auth/login`
- `GET /api/employer/auth/employer?email=...`
- `POST /api/employer/auth/reset-password`

### Administrator

- `POST /api/admin/auth/register`
- `POST /api/admin/auth/login`
- `GET /api/admin/auth/administrator?email=...`
- `POST /api/admin/auth/reset-password`
- `GET /api/admin/users`
- `DELETE /api/admin/users/candidate/{id}`
- `DELETE /api/admin/users/employer/{id}`
- `GET /api/admin/monitor/summary`
- `GET /api/admin/monitor/health`

### Resume and portfolio

- `POST /api/resume/parse` (multipart `file` or `text`, optional `userEmail`)
- `POST /api/resume/clear-and-reanalyze`
- `GET /api/resume/health`
- `GET /api/portfolios`
- `GET /api/portfolios/search?name=...`
- `GET /api/portfolios/{email}`
- `GET /api/portfolios/by-email?email=...`
- `GET /api/portfolios/{id}/resume`
- `GET /api/portfolios/by-email/resume?email=...`

## Notes

- Uploaded files are stored under `uploads/` and ignored by git.
- `backend/target/` and frontend `dist/` are build artifacts and ignored.
- Keep secrets only in root `.env` (not committed).
