import React, { useEffect, useState } from "react";
import { CandidateProfile, PortfolioData } from "../types";
import { getAllPortfolios } from "../services/api";
import { Search, MapPin, ChevronRight, User } from "lucide-react";

interface Props {
  onSelectCandidate: (profile: CandidateProfile) => void;
  onScreenNew: () => void;
}

const EmployerDashboard: React.FC<Props> = ({
  onSelectCandidate,
  onScreenNew,
}) => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError("");
      const portfolios = await getAllPortfolios();

      // Deduplicate by email and keep the latest updatedAt/createdAt
      const uniqueByEmail = new Map<string, CandidateProfile>();

      portfolios.forEach((p: any) => {
        const email = (p.email || "").trim().toLowerCase();
        const fullName = (p.fullName || "").trim();
        if (!email || !fullName) return; // skip incomplete entries

        const portfolio: PortfolioData = {
          id: p.id,
          fullName,
          headline: p.headline || p.resumeSummary || "No headline available",
          about: p.about || p.resumeSummary || "",
          location: p.location || "",
          email,
          phone: p.phone || "",
          linkedin: p.linkedin || "",
          github: p.github || "",
          website: p.website || "",
          skills: parseJson<PortfolioData["skills"]>(p.skillsJson, []),
          experience: parseJson<PortfolioData["experience"]>(
            p.experienceJson,
            []
          ),
          education: parseJson<PortfolioData["education"]>(p.educationJson, []),
          projects: parseJson<PortfolioData["projects"]>(p.projectsJson, []),
        };

        const lastUpdated =
          p.updatedAt || p.createdAt || new Date().toISOString();
        const timestamp = toTimestamp(lastUpdated);

        const existing = uniqueByEmail.get(email);
        if (!existing || toTimestamp(existing.lastUpdated) < timestamp) {
          uniqueByEmail.set(email, {
            user: {
              id: String(p.id || email),
              email,
              name: portfolio.fullName,
              role: "candidate" as const,
            },
            portfolio,
            analysis: null, // employers should not see analysis
            lastUpdated,
          });
        }
      });

      setCandidates(Array.from(uniqueByEmail.values()));
    } catch (err: any) {
      console.error("Failed to load portfolios:", err);
      setError(err.message || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const parseJson = <T,>(jsonStr: string | null, fallback: T): T => {
    if (!jsonStr) return fallback;
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed as T;
    } catch {
      return fallback;
    }
  };

  const toTimestamp = (value: string | null | undefined): number => {
    if (!value) return 0;
    const t = Date.parse(value);
    return Number.isNaN(t) ? 0 : t;
  };

  const filteredCandidates = candidates.filter(
    (c) =>
      c.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.portfolio?.headline || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (c.portfolio?.about || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      c.portfolio?.skills.some((s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Candidate Talent Pool
            </h1>
            <p className="text-slate-500 mt-2">
              Browse registered candidates and view their AI-analyzed profiles.
            </p>
            {error && <p className="text-red-600 text-sm mt-2">⚠️ {error}</p>}
          </div>
          <button
            onClick={onScreenNew}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200"
          >
            Screen New Resume (PDF)
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-8 flex items-center gap-4">
          <Search className="text-slate-400 ml-2" />
          <input
            type="text"
            placeholder="Search candidates by name, skill, or role..."
            className="flex-1 bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Candidates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((profile) => (
            <div
              key={profile.user.id}
              onClick={() => onSelectCandidate(profile)}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {profile.user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {profile.user.name}
                    </h3>
                    <div className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full w-fit mt-1">
                      Registered Candidate
                    </div>
                  </div>
                </div>
                {profile.analysis?.score && (
                  <div className={`flex flex-col items-end`}>
                    <span
                      className={`text-xl font-bold ${
                        profile.analysis.score >= 80
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                    >
                      {profile.analysis.score}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">
                      Match Score
                    </span>
                  </div>
                )}
              </div>

              <h4 className="text-sm font-semibold text-slate-700 mb-2 line-clamp-1">
                {profile.portfolio?.headline}
              </h4>

              {profile.portfolio?.location && (
                <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
                  <MapPin size={14} /> {profile.portfolio.location}
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-6">
                {profile.portfolio?.skills.slice(0, 3).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md"
                  >
                    {skill.name}
                  </span>
                ))}
                {(profile.portfolio?.skills.length || 0) > 3 && (
                  <span className="text-xs font-medium text-slate-400 px-2 py-1">
                    +{(profile.portfolio?.skills.length || 0) - 3} more
                  </span>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-indigo-600 font-semibold text-sm">
                View Full Profile
                <ChevronRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          ))}
        </div>

        {filteredCandidates.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <User size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium">
              No candidates found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
