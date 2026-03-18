import { PortfolioData, ResumeAnalysis } from "../types";

const GEMINI_MODEL =
  (import.meta as any)?.env?.VITE_GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_KEY =
  (import.meta as any)?.env?.VITE_GEMINI_API_KEY ||
  (process as any)?.env?.GEMINI_API_KEY ||
  (process as any)?.env?.API_KEY ||
  "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Parses the resume text to extract structured portfolio data using Gemini.
 */
export const parseResumeToPortfolio = async (
  input: string,
  mimeType: string
): Promise<PortfolioData> => {
  const prompt = `
You are an expert resume parser. Extract data from the provided resume and return ONLY valid JSON matching this structure (no markdown, no extra text):

{
  "fullName": "string",
  "headline": "string (job title/role)",
  "about": "string (compelling professional bio)",
  "location": "string",
  "email": "string",
  "phone": "string",
  "linkedin": "string (URL)",
  "github": "string (URL)",
  "website": "string (URL)",
  "skills": [
    {
      "name": "string",
      "level": number (0-100),
      "category": "frontend|backend|design|soft-skills|tools|other"
    }
  ],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "period": "string (e.g. Jan 2020 - Present)",
      "description": "string"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "year": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "link": "string (URL)"
    }
  ]
}

Resume content:
${input}

Return ONLY the JSON object, nothing else.`;

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Missing Gemini API key. Set VITE_GEMINI_API_KEY.");
    }

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Clean up markdown formatting if present
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Find JSON object in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }
    
    const rawData = JSON.parse(jsonMatch[0]) as Partial<PortfolioData>;

    // Sanitize and provide defaults
    return {
      fullName: rawData.fullName || "Portfolio",
      headline: rawData.headline || "",
      about: rawData.about || "",
      location: rawData.location || "",
      email: rawData.email || "",
      phone: rawData.phone,
      linkedin: rawData.linkedin,
      github: rawData.github,
      website: rawData.website,
      skills: Array.isArray(rawData.skills) ? rawData.skills : [],
      experience: Array.isArray(rawData.experience) ? rawData.experience : [],
      education: Array.isArray(rawData.education) ? rawData.education : [],
      projects: Array.isArray(rawData.projects) ? rawData.projects : [],
    };
  } catch (error) {
    console.error("Error parsing resume with Gemini:", error);
    throw new Error("Failed to parse resume. Please try again.");
  }
};

/**
 * Analyzes the resume using Gemini.
 */
export const analyzeResumeAndSearchJobs = async (
  input: string,
  mimeType: string
): Promise<ResumeAnalysis> => {
  const prompt = `
Analyze this candidate's resume and provide career insights. Return ONLY valid JSON (no markdown):

{
  "score": number (0-100 based on clarity, impact, completeness),
  "summary": "string (overall critique)",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "marketOutlook": "string (current demand for these skills)",
  "jobRecommendations": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "matchReason": "string"
    }
  ]
}

Resume content:
${input}

Return ONLY the JSON object.`;

  try {
    if (!GEMINI_API_KEY) {
      throw new Error("Missing Gemini API key. Set VITE_GEMINI_API_KEY.");
    }

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    
    // Clean up markdown formatting
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    // Find JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const rawData = JSON.parse(jsonMatch[0]) as Partial<ResumeAnalysis>;

    return {
      score: typeof rawData.score === "number" ? rawData.score : 0,
      summary: rawData.summary || "Analysis unavailable.",
      strengths: Array.isArray(rawData.strengths) ? rawData.strengths : [],
      weaknesses: Array.isArray(rawData.weaknesses) ? rawData.weaknesses : [],
      marketOutlook: rawData.marketOutlook || "Market data unavailable.",
      jobRecommendations: Array.isArray(rawData.jobRecommendations)
        ? rawData.jobRecommendations
        : [],
    };
  } catch (error) {
    console.error("Error analyzing resume with Gemini:", error);
    return {
      score: 0,
      summary: "Could not analyze resume. Please try again.",
      strengths: [],
      weaknesses: [],
      marketOutlook: "N/A",
      jobRecommendations: [],
    };
  }
};
