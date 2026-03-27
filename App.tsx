import React, { useState, useEffect } from "react";
import UploadSection from "./components/UploadSection";
import PortfolioView from "./components/PortfolioView";
import AuthPage from "./components/AuthPage";
import EmployerDashboard from "./components/EmployerDashboard";
import AdminDashboard from "./components/AdminDashboard";
import {
  PortfolioData,
  ResumeAnalysis,
  ViewMode,
  User,
  CandidateProfile,
} from "./types";
import { API_BASE, getPortfolioByEmail } from "./services/api";
import { Eye, EyeOff, LogOut, User as UserIcon, ArrowLeft } from "lucide-react";

const API_URL = `${API_BASE}/api/resume`;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("upload");
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(
    null
  );
  const [analysisData, setAnalysisData] = useState<ResumeAnalysis | null>(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === "candidate") {
        // Load candidate's saved portfolio from backend if it exists
        (async () => {
          setLoadingPortfolio(true);
          try {
            const p = await getPortfolioByEmail(user.email);
            if (p) {
              const portfolio = mapPortfolioDto(p);
              if (!isPortfolioEmpty(portfolio)) {
                setPortfolioData(portfolio);
                setAnalysisData(mapAnalysisDto(p)); // Load saved analysis
                setViewMode("portfolio");
                setLoadingPortfolio(false);
                return;
              }
            }
          } catch (err) {
            console.warn("No saved portfolio for user or fetch failed", err);
          }
          setPortfolioData(null);
          setAnalysisData(null);
          setViewMode("upload");
          setLoadingPortfolio(false);
          return;
        })();
      } else {
        if (user.role === "employer") {
          setViewMode("employer-dashboard");
        } else {
          setViewMode("admin-dashboard");
        }
        setLoadingPortfolio(false);
      }
    } else {
      setLoadingPortfolio(false);
    }
  }, [user]);

  const handleUpload = async (content: string, mimeType: string) => {
    setViewMode("analyzing");
    try {
      const formData = new FormData();

      if (mimeType.startsWith("text/")) {
        // Send as text parameter
        formData.append("text", content);
      } else {
        // Convert base64 to file for PDF/DOCX
        const base64Data = content.split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const filename = mimeType.includes("pdf")
          ? "resume.pdf"
          : "resume.docx";
        formData.append("file", blob, filename);
      }

      // Add user email to form data for validation
      if (user?.email) {
        formData.append("userEmail", user.email);
      }

      const response = await fetch(`${API_URL}/clear-and-reanalyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.message ||
          errorData?.error ||
          `Server error: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const portfolio = data.portfolio;
      const analysis = data.analysis;

      // Validate response before setting state
      if (
        !portfolio ||
        !portfolio.fullName ||
        portfolio.fullName.trim() === ""
      ) {
        throw new Error(
          "Failed to parse resume properly. The AI service may be unavailable. Please verify Gemini API configuration and try again."
        );
      }

      setPortfolioData(portfolio);
      setAnalysisData(analysis);

      // For candidates show their portfolio view; employers just screen
      setViewMode("portfolio");
    } catch (error: any) {
      console.error("Error processing resume:", error);
      let errorMessage = error.message || "Something went wrong while processing the resume. Please try again.";

      if (errorMessage.includes("Failed to fetch")) {
        errorMessage = `Cannot connect to the backend server. Please make sure the API is running at ${API_BASE} and try again.`;
      }

      alert(errorMessage);
      setViewMode("upload");
    }
  };

  const handleSelectCandidate = (profile: CandidateProfile) => {
    setPortfolioData(profile.portfolio);
    setAnalysisData(profile.analysis);
    setViewMode("portfolio");
  };

  const handleLogout = () => {
    setUser(null);
    setPortfolioData(null);
    setAnalysisData(null);
    setViewMode("upload");
  };

  const toggleView = () => {
    if (!portfolioData) return;
    if (viewMode === "portfolio") {
      setViewMode("employer");
    } else {
      setViewMode("portfolio");
    }
  };

  const mapPortfolioDto = (p: any): PortfolioData => ({
    id: p.id,
    fullName: p.fullName || "",
    headline: p.headline || p.resumeSummary || "",
    about: p.about || p.resumeSummary || "",
    location: p.location || "",
    email: p.email || "",
    phone: p.phone || "",
    linkedin: p.linkedin || "",
    github: p.github || "",
    website: p.website || "",
    skills: safeParse(p.skillsJson, []),
    experience: safeParse(p.experienceJson, []),
    education: safeParse(p.educationJson, []),
    projects: safeParse(p.projectsJson, []),
  });

  const mapAnalysisDto = (p: any): ResumeAnalysis | null => {
    if (!p.resumeScore && !p.resumeSummary) return null;
    return {
      score: p.resumeScore || 0,
      summary: p.resumeSummary || "",
      strengths: safeParse(p.strengthsJson, []),
      weaknesses: safeParse(p.weaknessesJson, []),
      marketOutlook: p.marketOutlook || "",
      jobRecommendations: safeParse(p.jobRecommendationsJson, []),
    };
  };

  // Treat empty/placeholder portfolio as missing so we show upload instead of a blank template
  const isPortfolioEmpty = (p: PortfolioData) => {
    const hasName = p.fullName?.trim().length > 0;
    const hasAbout = p.about?.trim().length > 0;
    const hasExperience = (p.experience?.length || 0) > 0;
    const hasProjects = (p.projects?.length || 0) > 0;
    const hasSkills = (p.skills?.length || 0) > 0;
    return !(hasName || hasAbout || hasExperience || hasProjects || hasSkills);
  };

  const safeParse = <T,>(json: string | null | undefined, fallback: T): T => {
    if (!json) return fallback;
    try {
      const parsed = JSON.parse(json);
      return parsed as T;
    } catch {
      return fallback;
    }
  };

  // If not logged in, show Auth Page
  if (!user) {
    return <AuthPage onLogin={setUser} />;
  }

  // While fetching existing portfolio for candidate, show minimal loader
  if (loadingPortfolio && user.role === "candidate") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-700">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-sm font-medium">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  // Employer view applies only to employer accounts
  const isEmployerView = user.role === "employer";

  return (
    <div className="relative">
      {/* App Header - Only show on non-portfolio pages or as absolute positioned */}
      {(viewMode === "employer-dashboard" ||
        viewMode === "admin-dashboard" ||
        viewMode === "upload" ||
        viewMode === "analyzing") && (
          <div className="fixed top-0 left-0 right-0 h-16 bg-white/0 z-50 flex items-center justify-between px-6 pointer-events-none">
            <div className="pointer-events-auto bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-sm border border-slate-200 mt-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <UserIcon size={16} />
              </div>
              <div className="text-sm">
                <span className="font-bold text-slate-900 block leading-tight">
                  {user.name}
                </span>
                <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                  {user.role} Account
                </span>
              </div>
            </div>

            <div className="pointer-events-auto flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-sm border border-slate-200 mt-4 text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        )}

      {/* User info in portfolio view - top left */}
      {(viewMode === "portfolio" || viewMode === "employer") && (
        <>
          <div className="fixed top-24 left-6 z-[70]">
            <div className="bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-sm border border-slate-200 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <UserIcon size={16} />
              </div>
              <div className="text-sm">
                <span className="font-bold text-slate-900 block leading-tight">
                  {user.name}
                </span>
                <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
                  {user.role} Account
                </span>
              </div>
            </div>
          </div>
          <div className="fixed top-24 right-6 z-[70]">
            <button
              onClick={handleLogout}
              className="bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-sm border border-slate-200 text-sm font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </>
      )}

      {/* Main Content Router */}
      {viewMode === "employer-dashboard" && user.role === "employer" && (
        <EmployerDashboard
          onSelectCandidate={handleSelectCandidate}
          onScreenNew={() => setViewMode("upload")}
        />
      )}

      {viewMode === "admin-dashboard" && user.role === "administrator" && (
        <AdminDashboard />
      )}

      {(viewMode === "upload" || viewMode === "analyzing") && user.role !== "administrator" && (
        <UploadSection
          onUpload={handleUpload}
          isLoading={viewMode === "analyzing"}
          isEmployer={user.role === "employer"}
          canViewPortfolio={!!portfolioData && user.role === "candidate"}
          onViewPortfolio={() => setViewMode("portfolio")}
        />
      )}

      {(viewMode === "portfolio" || viewMode === "employer") &&
        portfolioData && (
          <>
            <PortfolioView
              data={portfolioData}
              analysis={analysisData}
              isEmployerView={isEmployerView}
            />

            {/* Candidate: re-upload & re-analyze */}
            {user.role === "candidate" && (
              <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3">
                <button
                  className="bg-indigo-600 text-white px-4 py-3 rounded-full text-sm font-bold shadow-lg hover:bg-indigo-700 transition-colors"
                  onClick={() => {
                    setViewMode("upload");
                  }}
                >
                  Re-upload & Re-analyze
                </button>
              </div>
            )}

            {/* Back to Dashboard Button - Only show for Employer viewing portfolio */}
            {user.role === "employer" && viewMode !== "employer-dashboard" && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
                <button
                  onClick={() => {
                    setPortfolioData(null);
                    setAnalysisData(null);
                    setViewMode("employer-dashboard");
                  }}
                  className="bg-slate-900/90 backdrop-blur text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> Back to Dashboard
                </button>
              </div>
            )}
          </>
        )}
    </div>
  );
};

export default App;
