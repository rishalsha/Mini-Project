# Portfolio Generator Backend

Spring Boot backend with Gemini integration for AI-powered resume parsing.

## Prerequisites

- Java 17+
- Maven 3.6+
- Gemini API key

## Setup Gemini

1. Get a Gemini API key from Google AI Studio.
2. Add it to a `.env` file in the project root or `backend` directory:

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

3. Or export it before starting the backend:

```bash
export GEMINI_API_KEY=your_api_key_here
```

4. (Optional) Set a model override:

```bash
export GEMINI_MODEL=gemini-2.5-flash
```

## Build & Run

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend will start on http://localhost:8080

## API Endpoints

### Parse Resume

**POST** `/api/resume/parse`

**Parameters:**

- `file` (multipart): PDF/DOCX/TXT file
- OR `text` (string): Plain text resume

**Response:**

```json
{
  "portfolio": { ... },
  "analysis": { ... }
}
```

### Health Check

**GET** `/api/resume/health`

Returns: "Resume API is running"
