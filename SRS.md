# Software Requirements Specification (SRS)

## AutoFolio - AI-Powered Portfolio Generator

**Version:** 1.0  
**Date:** December 21, 2025  
**Status:** Draft

---

## 1. INTRODUCTION

### 1.1 Purpose

This Software Requirements Specification (SRS) document describes the functional and non-functional requirements for AutoFolio, an AI-powered portfolio generation system. The document is intended for developers, stakeholders, QA engineers, and project managers involved in the development and maintenance of the application.

### 1.2 Scope

AutoFolio is a comprehensive web application that transforms professional resumes into interactive portfolio websites with AI-driven career insights. The system includes:

- Intelligent resume parsing and analysis using local LLM (Gemini)
- Automated portfolio generation from resume data
- Career analytics and job recommendations
- Dual-role user management (Candidates and Employers)
- Persistent data storage with PostgreSQL

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition                          |
| ---- | ----------------------------------- |
| SRS  | Software Requirements Specification |
| LLM  | Large Language Model                |
| AI   | Artificial Intelligence             |
| API  | Application Programming Interface   |
| REST | Representational State Transfer     |
| JWT  | JSON Web Token                      |
| PDF  | Portable Document Format            |
| DOCX | Microsoft Word Document Format      |
| ORM  | Object-Relational Mapping           |
| JPA  | Java Persistence API                |
| CORS | Cross-Origin Resource Sharing       |

### 1.4 Document Overview

This document is organized into the following sections:

- Overall Description (Section 2)
- System Features (Section 3)
- External Interface Requirements (Section 4)
- System Features and Requirements (Section 5)
- Non-Functional Requirements (Section 6)
- Data Requirements (Section 7)
- Acceptance Criteria (Section 8)

---

## 2. OVERALL DESCRIPTION

### 2.1 Product Perspective

AutoFolio is a standalone web-based application consisting of:

- **Frontend:** React 18 + TypeScript + Vite (single-page application)
- **Backend:** Spring Boot 3.2 with Java 17 (REST API)
- **Database:** PostgreSQL 14+ (relational database)
- **AI Engine:** Gemini with gemini-2.5-flash (local LLM)

The system operates as an integrated solution where the frontend communicates with the backend via REST APIs, and the backend orchestrates data processing using the local Gemini instance.

### 2.2 Product Functions

The primary functions of AutoFolio include:

1. **User Authentication & Authorization**

   - Candidate registration and login
   - Employer registration and login
   - Password hashing and secure session management

2. **Resume Management**

   - Upload resumes in multiple formats (PDF, DOCX, TXT)
   - Parse and extract structured data from resumes
   - Store resume data in the database

3. **AI-Powered Analysis**

   - Resume scoring and evaluation
   - Skill extraction and categorization
   - Career improvement suggestions
   - Job recommendations based on profile

4. **Portfolio Generation**

   - Auto-generate professional portfolio websites
   - Customize portfolio appearance
   - Export/view portfolio

5. **Employer Features**
   - Browse candidate portfolios
   - View candidate profiles
   - Job posting and management

### 2.3 User Classes and Characteristics

| User Class    | Role         | Characteristics                                    | Frequency of Use |
| ------------- | ------------ | -------------------------------------------------- | ---------------- |
| Candidate     | Job seeker   | Uploads resume, views analysis, manages portfolio  | Daily            |
| Employer      | Recruiter    | Browses portfolios, posts jobs, reviews candidates | Weekly           |
| Administrator | System Admin | Manages system, monitors health                    | As needed        |

### 2.4 Operating Environment

- **Frontend:** Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Backend Server:** Linux/Windows with Java 17 runtime
- **Database Server:** PostgreSQL 14+
- **LLM Service:** Gemini running locally or on accessible server
- **Network:** Internet connectivity for user access
- **Development Environment:** Node.js 18+, Maven 3.8+

### 2.5 Design and Implementation Constraints

- Local LLM inference (no external API dependency)
- PostgreSQL database requirement
- Java 17+ for backend
- React 18+ for frontend
- Separation of frontend and backend (REST API)
- BCrypt for password hashing
- Apache Tika for document parsing

### 2.6 Assumptions and Dependencies

- **Assumptions:**

  - Users have access to modern web browsers
  - Gemini is installed and running before application startup
  - PostgreSQL is installed and configured
  - Network connectivity is available
  - Users have valid resume files (PDF, DOCX, or TXT)

- **Dependencies:**
  - Gemini gemini-2.5-flash model availability
  - PostgreSQL 14+
  - Spring Boot 3.2.0
  - React 18+
  - Apache Tika for document parsing

---

## 3. SYSTEM FEATURES

### 3.1 User Authentication and Account Management

#### 3.1.1 User Registration

**ID:** AF-AUTH-001  
**Title:** User Registration

**Description:**  
Users can create new accounts with email and password for either Candidate or Employer role.

**Requirements:**

- Users must provide valid email address
- Password must meet security requirements (minimum 8 characters, contain uppercase, lowercase, number)
- Email must be unique in the system
- Password must be hashed using BCrypt before storage
- System must send confirmation email (optional enhancement)
- Registration must be role-specific (Candidate vs Employer)

**Acceptance Criteria:**

- ✓ User can create account with valid email and password
- ✓ System rejects duplicate email addresses
- ✓ System rejects weak passwords
- ✓ Password is hashed before database storage
- ✓ User profile created with correct role

#### 3.1.2 User Login

**ID:** AF-AUTH-002  
**Title:** User Login and Session Management

**Description:**  
Registered users can log in with their credentials to access the application.

**Requirements:**

- Users must enter email and password
- System validates credentials against database
- Successful login creates authenticated session
- Failed login attempts logged for security
- Session timeout after inactivity
- Support for JWT token-based authentication

**Acceptance Criteria:**

- ✓ User can log in with correct credentials
- ✓ System rejects invalid credentials
- ✓ Authenticated users can access protected resources
- ✓ Unauthenticated users redirected to login
- ✓ Session maintains authentication state

#### 3.1.3 Password Management

**ID:** AF-AUTH-003  
**Title:** Password Reset and Recovery

**Description:**  
Users can reset forgotten passwords securely.

**Requirements:**

- Password reset via email link
- Reset links expire after 24 hours
- New password must meet security requirements
- Password change must be verified

**Acceptance Criteria:**

- ✓ User can request password reset
- ✓ Reset link sent to registered email
- ✓ Link expires after 24 hours
- ✓ New password set successfully

---

### 3.2 Resume Upload and Processing

#### 3.2.1 Resume Upload

**ID:** AF-RESUME-001  
**Title:** Resume File Upload

**Description:**  
Candidates can upload their resume files for processing.

**Requirements:**

- Support file formats: PDF, DOCX, TXT
- File size limit: 10 MB
- Upload must require authentication
- File stored securely on server
- File metadata recorded (upload time, file name, file type)
- Support drag-and-drop upload interface

**Acceptance Criteria:**

- ✓ User can upload PDF, DOCX, or TXT files
- ✓ System rejects files larger than 10 MB
- ✓ System rejects unsupported file formats
- ✓ File successfully stored with metadata
- ✓ Upload progress displayed to user

#### 3.2.2 Resume Parsing

**ID:** AF-RESUME-002  
**Title:** Automated Resume Content Extraction

**Description:**  
System automatically parses uploaded resume files to extract structured data.

**Requirements:**

- Parse PDF, DOCX, and TXT files using Apache Tika
- Extract key sections: contact, summary, experience, skills, education, projects
- Handle various resume formats and layouts
- Maintain original formatting information
- Support both structured and unstructured resume formats
- Timeout after 30 seconds for large files
- Error handling for corrupted files

**Acceptance Criteria:**

- ✓ System extracts text from uploaded resume
- ✓ Key information identified correctly
- ✓ Structured data stored in database
- ✓ System handles malformed files gracefully
- ✓ Parsing completes within timeout

#### 3.2.3 AI-Powered Resume Analysis

**ID:** AF-RESUME-003  
**Title:** Resume Scoring and Analysis via Gemini

**Description:**  
System analyzes resume content using local LLM to provide insights and recommendations.

**Requirements:**

- Use Gemini gemini-2.5-flash model for analysis
- Generate resume score (0-100)
- Extract skills and categorize by level (Beginner, Intermediate, Advanced)
- Identify strengths and areas for improvement
- Provide actionable recommendations
- Estimate years of experience
- Identify industry and job roles match
- Cache analysis results
- Handle Gemini service unavailability gracefully

**Acceptance Criteria:**

- ✓ Resume receives score between 0-100
- ✓ Skills extracted and categorized
- ✓ Recommendations generated
- ✓ Analysis completes in reasonable time (< 60 seconds)
- ✓ Results stored and retrievable
- ✓ System degrades gracefully if Gemini unavailable

---

### 3.3 Portfolio Generation

#### 3.3.1 Automatic Portfolio Creation

**ID:** AF-PORTFOLIO-001  
**Title:** Automated Portfolio Website Generation

**Description:**  
System creates a professional portfolio website from parsed resume data.

**Requirements:**

- Generate portfolio from resume data
- Portfolio includes sections: About, Experience, Skills, Projects, Education
- Responsive design for mobile/tablet/desktop
- Professional templates available
- Portfolio is web-accessible
- Unique URL for each portfolio
- Share-friendly portfolio links
- Portfolio preview functionality

**Acceptance Criteria:**

- ✓ Portfolio created automatically after resume parsing
- ✓ Portfolio displays all key resume sections
- ✓ Portfolio is responsive and mobile-friendly
- ✓ Portfolio accessible via unique URL
- ✓ Users can preview portfolio before publishing

#### 3.3.2 Portfolio Customization

**ID:** AF-PORTFOLIO-002  
**Title:** Portfolio Personalization and Theming

**Description:**  
Users can customize their portfolio appearance and content.

**Requirements:**

- Template selection (multiple themes)
- Color scheme customization
- Font selection
- Content editing (sections, descriptions)
- Profile picture upload
- Social media links integration
- Custom domain support (optional)
- Portfolio preview in real-time

**Acceptance Criteria:**

- ✓ User can select different portfolio templates
- ✓ User can customize colors and fonts
- ✓ Changes reflected in real-time preview
- ✓ Customizations saved to database

---

### 3.4 Job Recommendations

#### 3.4.1 Personalized Job Matching

**ID:** AF-JOBS-001  
**Title:** AI-Powered Job Recommendations

**Description:**  
System recommends suitable job positions based on candidate profile and skills.

**Requirements:**

- Analyze candidate skills and experience
- Match against job descriptions in database
- Rank jobs by relevance score
- Consider location preferences
- Consider experience level match
- Update recommendations weekly
- Handle new job postings in recommendation engine

**Acceptance Criteria:**

- ✓ System generates job recommendations
- ✓ Recommendations ranked by relevance
- ✓ Recommendations consider skill match
- ✓ User can view recommended jobs
- ✓ User can save/apply to recommended jobs

#### 3.4.2 Job Database and Posting

**ID:** AF-JOBS-002  
**Title:** Job Posting Management (Employer Feature)

**Description:**  
Employers can post and manage job openings.

**Requirements:**

- Job posting form with required fields
- Fields: title, description, requirements, location, salary, job type
- Draft and publish workflow
- Edit and delete posted jobs
- Application tracking
- Employer dashboard to view applications
- Filter and search applications

**Acceptance Criteria:**

- ✓ Employer can post new jobs
- ✓ Job displays in platform and recommendations
- ✓ Employer can view applications
- ✓ Employer can manage job postings

---

### 3.5 Employer Features

#### 3.5.1 Candidate Portfolio Browse

**ID:** AF-EMPLOYER-001  
**Title:** Employer Candidate Search and Portfolio Viewing

**Description:**  
Employers can search for candidates and view their portfolios.

**Requirements:**

- Search candidates by skills, location, experience
- Filter by job title and experience level
- View candidate portfolio and resume
- Contact candidate via messaging (optional)
- Save candidate to shortlist
- Rate/bookmark candidates
- Generate recruitment reports

**Acceptance Criteria:**

- ✓ Employer can search candidates effectively
- ✓ Employer can view candidate portfolios
- ✓ Employer can shortlist candidates
- ✓ Employer can track shortlisted candidates

#### 3.5.2 Employer Dashboard

**ID:** AF-EMPLOYER-002  
**Title:** Employer Management Dashboard

**Description:**  
Comprehensive dashboard for employer operations.

**Requirements:**

- Job posting overview
- Application tracking
- Candidate shortlist management
- Analytics and metrics (applications received, hired, etc.)
- Team collaboration features (if multi-user)
- Communication center

**Acceptance Criteria:**

- ✓ Dashboard displays all posted jobs
- ✓ Dashboard shows application statistics
- ✓ Employer can manage applications and shortlist
- ✓ Analytics displayed clearly

---

### 3.6 User Dashboards

#### 3.6.1 Candidate Dashboard

**ID:** AF-DASHBOARD-001  
**Title:** Candidate Home Dashboard

**Description:**  
Central hub for candidate to manage profile and view insights.

**Requirements:**

- Resume management section
- Portfolio overview
- Resume score and analysis
- Job recommendations widget
- Application tracker
- Profile completion percentage
- Activity history
- Settings management

**Acceptance Criteria:**

- ✓ Dashboard loads successfully for authenticated user
- ✓ All widgets display relevant data
- ✓ User can navigate to sub-features
- ✓ Dashboard responsive on all devices

#### 3.6.2 Analysis Dashboard

**ID:** AF-DASHBOARD-002  
**Title:** Resume Analysis and Insights Dashboard

**Description:**  
Detailed analytics and recommendations for resume improvement.

**Requirements:**

- Resume score breakdown
- Skills assessment with proficiency levels
- Experience analysis
- Recommendations for improvement
- Comparison with industry standards
- Trends and suggestions for career growth
- Charts and visualizations

**Acceptance Criteria:**

- ✓ Analysis displays scores and breakdowns
- ✓ Recommendations are actionable
- ✓ Charts render correctly
- ✓ Data updates reflect latest resume

---

## 4. EXTERNAL INTERFACE REQUIREMENTS

### 4.1 User Interfaces

#### 4.1.1 Web Application Interface

- **Technology:** React 18 + TypeScript
- **Styling:** CSS with Tailwind or similar framework
- **Responsiveness:** Mobile-first approach
- **Accessibility:** WCAG 2.1 Level AA compliance
- **Cross-browser support:** Chrome, Firefox, Safari, Edge (latest 2 versions)

#### 4.1.2 Key UI Components

- Authentication pages (Login, Register, Password Reset)
- Dashboard pages (Candidate, Employer, Analysis)
- Resume upload interface
- Portfolio builder and viewer
- Job recommendation display
- Search and filter interfaces
- Profile management pages
- Settings pages

### 4.2 Hardware Interfaces

- Standard computers/laptops with web browsers
- Mobile devices (iOS/Android via responsive web)
- Server hardware for backend and database
- Local machine for Gemini LLM service

### 4.3 Software Interfaces

#### 4.3.1 Backend REST API

**Base URL:** `http://localhost:8080` (development)

**Key Endpoints:**

| Method | Endpoint                     | Purpose                 |
| ------ | ---------------------------- | ----------------------- |
| POST   | `/api/auth/register`         | User registration       |
| POST   | `/api/auth/login`            | User login              |
| POST   | `/api/auth/logout`           | User logout             |
| POST   | `/api/auth/refresh`          | Token refresh           |
| POST   | `/api/resume/upload`         | Resume file upload      |
| POST   | `/api/resume/parse`          | Parse resume content    |
| GET    | `/api/resume/analysis`       | Get resume analysis     |
| GET    | `/api/portfolio`             | Get user portfolio      |
| PUT    | `/api/portfolio`             | Update portfolio        |
| GET    | `/api/jobs/recommendations`  | Get job recommendations |
| GET    | `/api/jobs`                  | List all jobs           |
| POST   | `/api/jobs`                  | Post new job (employer) |
| GET    | `/api/employer/applications` | View applications       |
| GET    | `/api/user/profile`          | Get user profile        |
| PUT    | `/api/user/profile`          | Update user profile     |
| GET    | `/api/health`                | Health check            |

#### 4.3.2 Gemini LLM Interface

- **Service URL:** `https://generativelanguage.googleapis.com`
- **Model:** gemini-2.5-flash
- **API Endpoint:** `/api/generate`
- **Request Format:** JSON with prompt and parameters
- **Response Format:** JSON streaming response

#### 4.3.3 Database Interface

- **Type:** PostgreSQL 14+
- **Connection Method:** JDBC via Spring Data JPA
- **Connection Pool:** HikariCP (default in Spring Boot)
- **ORM:** Hibernate (via Spring Data JPA)

### 4.4 Communication Interfaces

- **Protocol:** HTTP/HTTPS (REST API)
- **Data Format:** JSON for API requests/responses
- **Authentication:** JWT tokens or session-based
- **CORS:** Enabled for frontend origin
- **SSL/TLS:** HTTPS in production

---

## 5. SYSTEM FEATURES AND REQUIREMENTS

### 5.1 Functional Requirements

#### 5.1.1 Authentication Module (AF-AUTH)

- **Requirement:** FR-AUTH-001 - User Registration
  - Users must provide email, password, and role
  - Email must be unique
  - Password validation with BCrypt hashing
- **Requirement:** FR-AUTH-002 - User Login
  - Authentication via email/password
  - Session management
  - JWT token generation and validation
- **Requirement:** FR-AUTH-003 - Password Reset
  - Email-based password recovery
  - Token expiration (24 hours)
- **Requirement:** FR-AUTH-004 - Role-Based Access Control
  - Different permissions for Candidate vs Employer roles
  - Admin role for system management

#### 5.1.2 Resume Module (AF-RESUME)

- **Requirement:** FR-RESUME-001 - File Upload
  - Support PDF, DOCX, TXT formats
  - File size validation (max 10 MB)
  - Secure file storage
- **Requirement:** FR-RESUME-002 - Document Parsing
  - Extract text from documents using Apache Tika
  - Preserve formatting metadata
  - Handle multiple resume formats
- **Requirement:** FR-RESUME-003 - AI Analysis
  - Resume scoring (0-100)
  - Skill extraction and categorization
  - Recommendation generation
  - Integration with Gemini LLM

#### 5.1.3 Portfolio Module (AF-PORTFOLIO)

- **Requirement:** FR-PORTFOLIO-001 - Auto Generation
  - Generate from resume data
  - Create web-accessible portfolios
  - Unique URL per portfolio
- **Requirement:** FR-PORTFOLIO-002 - Customization
  - Template selection
  - Theme/color customization
  - Content editing
  - Preview functionality

#### 5.1.4 Job Recommendation Module (AF-JOBS)

- **Requirement:** FR-JOBS-001 - Job Matching
  - AI-powered job recommendations
  - Relevance ranking
  - Skill-based matching
- **Requirement:** FR-JOBS-002 - Job Posting (Employer)
  - Post job openings
  - Manage job listings
  - Track applications

#### 5.1.5 Dashboard Module (AF-DASHBOARD)

- **Requirement:** FR-DASHBOARD-001 - Candidate Dashboard
  - Profile overview
  - Resume analysis summary
  - Job recommendations widget
  - Application tracker
- **Requirement:** FR-DASHBOARD-002 - Employer Dashboard
  - Posted jobs overview
  - Application management
  - Candidate shortlist
  - Recruitment analytics

### 5.2 Data Management Requirements

#### 5.2.1 Data Storage

- **Database:** PostgreSQL
- **ORM:** Spring Data JPA
- **Migration:** Liquibase or Flyway (optional)

#### 5.2.2 Data Security

- **Passwords:** BCrypt hashing (minimum 12 rounds)
- **Sensitive Data:** Encrypted at rest (optional enhancement)
- **Data Access:** Role-based access control (RBAC)
- **Audit Trail:** Log all user actions (optional enhancement)

#### 5.2.3 File Management

- **Storage Location:** Server file system or cloud storage
- **File Naming:** Secure naming (avoid exposing sensitive info)
- **Access Control:** Authenticated users only
- **Retention:** Delete old files after 30 days (configurable)

---

## 6. NON-FUNCTIONAL REQUIREMENTS

### 6.1 Performance Requirements

#### 6.1.1 Response Time

- **API Response:** < 500 ms for standard queries
- **Resume Parsing:** < 30 seconds for typical resume (5 pages)
- **AI Analysis:** < 60 seconds for resume scoring
- **Portfolio Load:** < 2 seconds
- **Page Load:** < 3 seconds for frontend pages

#### 6.1.2 Throughput

- **Concurrent Users:** Support minimum 100 concurrent users
- **Requests Per Second:** Handle 50+ req/sec
- **Database Connections:** Connection pool size 10-20

#### 6.1.3 Resource Utilization

- **Memory:** Backend < 512 MB, Frontend < 100 MB
- **CPU:** Efficient background processing
- **Disk Space:** Configurable file storage with cleanup

### 6.2 Scalability Requirements

- **Horizontal Scaling:** Stateless API design
- **Database Scaling:** Prepared for read replicas
- **Caching:** Redis for frequently accessed data (optional)
- **Load Balancing:** Compatible with load balancers

### 6.3 Availability and Reliability

#### 6.3.1 Uptime

- **Target Uptime:** 99% (allowing 7+ hours downtime per month)
- **Backup Strategy:** Daily database backups
- **Recovery Time Objective (RTO):** < 2 hours
- **Recovery Point Objective (RPO):** < 1 hour

#### 6.3.2 Fault Tolerance

- **Database Failover:** Connection pooling and retry logic
- **Gemini Fallback:** Graceful degradation if LLM unavailable
- **Error Handling:** Comprehensive exception handling
- **Logging:** Detailed application and error logs

### 6.4 Security Requirements

#### 6.4.1 Authentication

- **Method:** JWT tokens with secure transmission
- **Token Expiration:** 24 hours for access token
- **Refresh Token:** 30 days validity
- **HTTPS:** Required for production
- **CORS:** Restrict to known origins

#### 6.4.2 Authorization

- **Role-Based Access Control (RBAC)**
  - Candidate: Upload resume, view portfolio, job search
  - Employer: Post jobs, view candidates, manage applications
  - Admin: System management and monitoring

#### 6.4.3 Data Protection

- **Password Hashing:** BCrypt (cost factor ≥ 12)
- **SQL Injection Prevention:** Parameterized queries (JPA)
- **CSRF Protection:** Token-based protection
- **XSS Prevention:** Input validation and output encoding
- **File Upload Security:** Validate file types and scan for malware (optional)

#### 6.4.4 Compliance

- **GDPR:** Data privacy and user rights
- **Data Deletion:** User account deletion with data removal
- **Terms of Service:** Acceptance on registration
- **Privacy Policy:** Clear data usage policies

### 6.5 Maintainability Requirements

- **Code Quality:** Modular, well-documented codebase
- **Testing:** Unit tests (>80% coverage goal)
- **Version Control:** Git with branching strategy
- **Documentation:** API docs, setup guides, architecture diagrams
- **Logging:** Structured logging for debugging
- **Monitoring:** Application health checks and metrics

### 6.6 Usability Requirements

- **Ease of Use:** Intuitive UI with clear workflows
- **Accessibility:** WCAG 2.1 Level AA compliance
- **Mobile Responsiveness:** Fully functional on mobile devices
- **Error Messages:** Clear, actionable error messages
- **Help Documentation:** In-app help and tutorials
- **Localization:** Base for multi-language support (optional)

### 6.7 Compatibility Requirements

- **Browser Compatibility:**

  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+

- **Operating Systems:**

  - Windows 10/11
  - macOS 10.15+
  - Linux (Ubuntu 20.04+)

- **Database Compatibility:**
  - PostgreSQL 14+

---

## 7. DATA REQUIREMENTS

### 7.1 Database Schema

#### 7.1.1 Core Tables

**Users Table**

```
users
├── id (BIGINT, PK)
├── email (VARCHAR(255), UNIQUE, NOT NULL)
├── name (VARCHAR(255), NOT NULL)
├── password_hash (VARCHAR(60), NOT NULL)
├── role (ENUM: CANDIDATE, EMPLOYER)
├── registered_at (TIMESTAMP, NOT NULL)
├── updated_at (TIMESTAMP)
├── resume_file_path (VARCHAR(255))
├── profile_picture (VARCHAR(255))
└── is_active (BOOLEAN, DEFAULT: true)
```

**Portfolio Table**

```
portfolio
├── id (BIGINT, PK)
├── user_id (BIGINT, FK → users)
├── title (VARCHAR(255))
├── description (TEXT)
├── theme (VARCHAR(100))
├── color_scheme (VARCHAR(50))
├── is_published (BOOLEAN, DEFAULT: false)
├── custom_url (VARCHAR(255), UNIQUE)
├── view_count (INT, DEFAULT: 0)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── last_viewed (TIMESTAMP)
```

**Resume Analysis Table**

```
resume_analysis
├── id (BIGINT, PK)
├── user_id (BIGINT, FK → users)
├── score (INT, 0-100)
├── skills (TEXT, JSON array)
├── experience_years (DECIMAL)
├── strengths (TEXT)
├── improvements (TEXT)
├── recommendations (TEXT, JSON array)
├── industry_match (VARCHAR(100))
├── job_roles (TEXT, JSON array)
├── analyzed_at (TIMESTAMP)
└── expires_at (TIMESTAMP, optional)
```

**Jobs Table**

```
jobs
├── id (BIGINT, PK)
├── employer_id (BIGINT, FK → users)
├── title (VARCHAR(255), NOT NULL)
├── description (TEXT, NOT NULL)
├── requirements (TEXT)
├── location (VARCHAR(255))
├── salary_min (DECIMAL)
├── salary_max (DECIMAL)
├── job_type (ENUM: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP)
├── status (ENUM: DRAFT, PUBLISHED, CLOSED)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
├── expires_at (TIMESTAMP)
└── view_count (INT, DEFAULT: 0)
```

**Job Recommendations Table**

```
job_recommendations
├── id (BIGINT, PK)
├── candidate_id (BIGINT, FK → users)
├── job_id (BIGINT, FK → jobs)
├── relevance_score (DECIMAL, 0-100)
├── match_reasons (TEXT, JSON array)
├── recommended_at (TIMESTAMP)
└── user_viewed (BOOLEAN, DEFAULT: false)
```

**Applications Table**

```
applications
├── id (BIGINT, PK)
├── candidate_id (BIGINT, FK → users)
├── job_id (BIGINT, FK → jobs)
├── status (ENUM: PENDING, REVIEWED, SHORTLISTED, REJECTED, ACCEPTED)
├── applied_at (TIMESTAMP)
├── reviewed_at (TIMESTAMP)
├── notes (TEXT)
└── rating (INT, 1-5, nullable)
```

**Employer Table** (optional, for multi-user employers)

```
employers
├── id (BIGINT, PK)
├── user_id (BIGINT, FK → users)
├── company_name (VARCHAR(255))
├── company_description (TEXT)
├── industry (VARCHAR(100))
├── website (VARCHAR(255))
├── logo (VARCHAR(255))
└── created_at (TIMESTAMP)
```

### 7.2 Data Dictionary

#### 7.2.1 Key Data Elements

| Field           | Type         | Required | Validation                 | Description                       |
| --------------- | ------------ | -------- | -------------------------- | --------------------------------- |
| email           | VARCHAR(255) | Yes      | Valid email format, unique | User email address                |
| password_hash   | VARCHAR(60)  | Yes      | BCrypt hash                | Hashed password                   |
| resume_score    | INT          | No       | 0-100                      | Resume quality score              |
| skills          | JSON         | No       | Array of objects           | Extracted skills with proficiency |
| salary_min      | DECIMAL      | No       | > 0                        | Minimum salary for job            |
| relevance_score | DECIMAL      | No       | 0-100                      | Job match relevance percentage    |

### 7.3 Data Retention and Archival

- **User Accounts:** Retain indefinitely (or per GDPR deletion requests)
- **Resume Files:** Keep for 1 year, then archive/delete
- **Analysis Results:** Keep for 6 months
- **Job Applications:** Archive after 1 year
- **Logs:** Retain for 90 days, archive older

### 7.4 Data Privacy and Protection

- **PII Handling:** Encrypt sensitive data
- **Access Logging:** Log all data access
- **Backup:** Encrypted backups
- **GDPR Compliance:** Support data export and deletion

---

## 8. ACCEPTANCE CRITERIA

### 8.1 User Story Template

```
As a [user role]
I want to [action/feature]
So that [benefit/goal]

Acceptance Criteria:
- Criterion 1
- Criterion 2
- Criterion 3

Acceptance Tests:
- Test 1: [test description]
- Test 2: [test description]
```

### 8.2 Feature Acceptance Criteria

#### 8.2.1 Resume Upload Feature

- **Given:** User is logged in as candidate
- **When:** User uploads PDF resume
- **Then:**
  - File successfully saved
  - File metadata recorded
  - Parsing initiated automatically
  - Success message displayed

#### 8.2.2 Resume Analysis Feature

- **Given:** Resume is uploaded and parsed
- **When:** System analyzes resume via Gemini
- **Then:**
  - Score calculated (0-100)
  - Skills extracted with proficiency
  - Recommendations generated
  - Results stored in database
  - User can view results

#### 8.2.3 Portfolio Generation Feature

- **Given:** Resume analysis completed
- **When:** User generates portfolio
- **Then:**
  - Portfolio created with unique URL
  - All resume sections displayed
  - Design is responsive
  - User can customize
  - Portfolio is publicly accessible

#### 8.2.4 Job Recommendation Feature

- **Given:** User profile and skills exist
- **When:** Job recommendation algorithm runs
- **Then:**
  - Relevant jobs recommended
  - Jobs ranked by relevance score
  - User can view recommendations
  - User can apply to jobs

#### 8.2.5 Employer Features

- **Given:** User is logged in as employer
- **When:** Employer posts new job
- **Then:**
  - Job published successfully
  - Job appears in job listings
  - Appears in recommendations
  - Employer can view applications
  - Employer can manage candidates

### 8.3 Quality Metrics

| Metric                    | Target  | Measurement Method  |
| ------------------------- | ------- | ------------------- |
| Code Coverage             | > 80%   | Unit tests          |
| API Response Time         | < 500ms | Performance testing |
| System Uptime             | 99%     | Monitoring tools    |
| User Registration Success | > 99%   | User metrics        |
| Resume Parse Success Rate | > 95%   | Error tracking      |
| AI Analysis Accuracy      | > 85%   | Manual review       |
| Page Load Time            | < 3s    | Performance tools   |
| Mobile Responsiveness     | 100%    | Device testing      |

---

## 9. CONSTRAINTS AND LIMITATIONS

### 9.1 Technical Constraints

- Must use Java 17 for backend
- Must use React 18 for frontend
- Must use PostgreSQL for database
- Must use local Gemini instance
- Single-page application architecture
- REST API only (no GraphQL)

### 9.2 Operational Constraints

- Gemini service must be running for AI features
- PostgreSQL must be accessible
- Minimum 2 GB RAM for backend
- Internet connection required
- File storage on local server

### 9.3 Business Constraints

- Free/open-source technology stack
- No external paid APIs required
- Local LLM for privacy
- Single-region deployment initially

### 9.4 Known Limitations

- AI analysis quality depends on Gemini model capabilities
- Portfolio customization options are templated
- No real-time collaboration features
- No mobile native app (web-based only)
- Job recommendations require sufficient profile data

---

## 10. APPENDICES

### 10.1 Glossary

- **LLM:** Large Language Model - AI model for text generation
- **Gemini:** Open-source platform for running LLMs locally
- **Resume Parsing:** Extracting structured data from resume documents
- **Portfolio:** Personal website showcasing professional profile
- **Token:** Authentication credential (JWT)
- **RBAC:** Role-Based Access Control
- **CORS:** Cross-Origin Resource Sharing

### 10.2 References

- Spring Boot 3.2 Documentation: https://spring.io/projects/spring-boot
- React 18 Documentation: https://react.dev
- PostgreSQL 14 Documentation: https://www.postgresql.org/docs/14
- Gemini Documentation: https://ai.google.dev
- Apache Tika Documentation: https://tika.apache.org

### 10.3 Change History

| Version | Date       | Author | Changes              |
| ------- | ---------- | ------ | -------------------- |
| 1.0     | 2025-12-21 | -      | Initial SRS Document |

### 10.4 Sign-Off

| Role            | Name | Signature | Date |
| --------------- | ---- | --------- | ---- |
| Project Manager |      |           |      |
| Product Owner   |      |           |      |
| Lead Developer  |      |           |      |
| QA Lead         |      |           |      |

---

**End of SRS Document**
