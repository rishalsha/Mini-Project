import React from "react";
import { ResumeAnalysis } from "../types";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  Briefcase,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

interface Props {
  analysis: ResumeAnalysis;
}

const AnalysisDashboard: React.FC<Props> = ({ analysis }) => {
  const scoreData = [
    { name: "Score", value: analysis.score },
    { name: "Remaining", value: 100 - analysis.score },
  ];

  const sanitizedWeaknesses = (analysis.weaknesses || []).filter((item) => {
    const normalized = item.toLowerCase();
    return (
      normalized.trim() !== "" &&
      !normalized.includes("ai analysis failed") &&
      !normalized.includes("results limited")
    );
  });

  const COLORS = ["#4f46e5", "#e2e8f0"]; // Indigo-600, Slate-200

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Private Career Intelligence
          </h2>
          <p className="mt-4 text-xl text-slate-600">
            AI-powered analysis and real-time job market matching based on your
            resume.
          </p>
        </div>

        <div >
          {/* Column 1: Score & Market Outlook */}
          <div className="space-y-8">
            {/* Score Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <h3 className="text-lg font-bold text-slate-700 mb-6">
                Resume Strength
              </h3>
              <div className="h-48 w-48 relative mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scoreData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {scoreData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-extrabold text-slate-900">
                    {analysis.score}
                  </span>
                  <span className="text-sm text-slate-400">/100</span>
                </div>
              </div>
              <div
                className={`px-4 py-2 rounded-full text-sm font-bold ${
                  analysis.score > 80
                    ? "bg-green-100 text-green-700"
                    : analysis.score > 60
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {analysis.score > 80
                  ? "Excellent Profile"
                  : analysis.score > 60
                  ? "Good Foundation"
                  : "Needs Optimization"}
              </div>
            </div>

            {/* Market Outlook */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp className="text-blue-500" /> Market Outlook
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                {analysis.marketOutlook}
              </p>
            </div>
          </div>

          {/* Column 2: Strengths & Weaknesses */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Detailed Feedback
            </h3>

            <div className="mb-8">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-emerald-500" /> Key
                Strengths
              </h4>
              <ul className="space-y-3">
                {analysis.strengths?.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-slate-700 text-lg"
                  >
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" /> Areas for
                Improvement
              </h4>
              <ul className="space-y-3">
                {sanitizedWeaknesses.length > 0 ? (
                  sanitizedWeaknesses.map((w, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-slate-700 text-lg"
                    >
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                      {w}
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-3 text-slate-700 text-lg">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    Add more measurable impact, role-specific keywords, and
                    recent project outcomes to strengthen your profile.
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Column 3: Job Recommendations */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 overflow-hidden">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Briefcase className="text-indigo-600" /> Recommended Roles
            </h3>
            <div className="space-y-6">
              {analysis.jobRecommendations?.map((job, idx) => (
                <div
                  key={idx}
                  className="group border-b border-slate-100 last:border-0 pb-6 last:pb-0"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {job.title}
                    </h4>
                  </div>
                  <div className="text-base text-slate-500 mb-2">
                    {job.company} • {job.location}
                  </div>

                  {job.matchScore && (
                    <div className="mb-3">
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                        {job.matchScore}% Skill Match
                      </span>
                    </div>
                  )}

                  {job.reason && job.reason.trim() !== "" && (
                    <p className="text-sm text-slate-500 mb-3 italic">
                      "{job.reason}"
                    </p>
                  )}

                  {job.url ? (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      View Application <ArrowRight size={14} className="ml-1" />
                    </a>
                  ) : (
                    <span className="text-sm text-slate-400">
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalysisDashboard;
