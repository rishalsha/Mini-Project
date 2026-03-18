import React from "react";
import { PortfolioData, ResumeAnalysis, Skill } from "../types";
import AnalysisDashboard from "./AnalysisDashboard";
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  Globe,
  ExternalLink,
  Download,
  GraduationCap,
  Award,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Props {
  data: PortfolioData;
  analysis: ResumeAnalysis | null;
  isEmployerView?: boolean;
}

const PortfolioView: React.FC<Props> = ({ data, analysis, isEmployerView }) => {
  // Filter skills for specific sections
  const softSkills =
    data.skills?.filter(
      (s) => s.category === "soft-skills" || s.category === "other"
    ) || [];
  const techSkills =
    data.skills?.filter(
      (s) => s.category !== "soft-skills" && s.category !== "other"
    ) || [];

  const projects = Array.isArray(data.projects) ? data.projects : [];
  const projectsRowRef = React.useRef<HTMLDivElement | null>(null);

  const scrollProjects = (direction: "left" | "right") => {
    const node = projectsRowRef.current;
    if (!node) return;
    const cardWidth = 360; // approximate card width including gap
    const delta = direction === "left" ? -cardWidth : cardWidth;
    node.scrollBy({ left: delta, behavior: "smooth" });
  };

  // Deterministic accent for project cards (avoid random placeholders)
  const projectAccent = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return {
      background: `linear-gradient(135deg, hsl(${hue}, 75%, 70%), hsl(${(hue + 40) % 360
        }, 70%, 55%))`,
    } as React.CSSProperties;
  };

  const handleDownloadResume = async () => {
    try {
      const API_BASE =
        (import.meta as any)?.env?.VITE_API_URL || "http://localhost:8080";

      // Use email-based download to always fetch the latest resume upload
      const downloadUrl = data.email
        ? `${API_BASE}/api/portfolios/by-email/resume?email=${encodeURIComponent(
          data.email
        )}`
        : data.id
          ? `${API_BASE}/api/portfolios/${data.id}/resume`
          : "";

      if (!downloadUrl) {
        alert("Cannot download resume: Portfolio reference not found");
        return;
      }

      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error("Resume file not found");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.fullName.replace(/\s+/g, "_")}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading resume:", error);
      alert(
        "Could not download resume. The original file may not be available."
      );
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="font-bold text-2xl tracking-tight text-slate-900">
            {data.fullName?.split(" ")[0]}
            <span className="text-indigo-600">.dev</span>
          </div>
          <div className="hidden md:flex space-x-10 text-base font-medium text-slate-600">
            <a
              href="#about"
              className="hover:text-indigo-600 transition-colors"
            >
              About
            </a>
            <a
              href="#experience"
              className="hover:text-indigo-600 transition-colors"
            >
              Experience
            </a>
            <a
              href="#projects"
              className="hover:text-indigo-600 transition-colors"
            >
              Projects
            </a>
            <a
              href="#contact"
              className="hover:text-indigo-600 transition-colors"
            >
              Contact
            </a>
          </div>
          {isEmployerView && (
            <button
              onClick={handleDownloadResume}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20"
            >
              <Download size={18} /> Download Resume
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-[90vh] flex flex-col justify-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50/50">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-base font-semibold tracking-wide uppercase">
            {data.headline ? data.headline.split("|")[0] : "Software Engineer"}
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
            Hi, I'm {data.fullName}. <br />
            <span className="text-4xl md:text-6xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              {data.headline ||
                data.about?.split(".")[0] ||
                "I build innovative solutions."}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12 font-light">
            {data.about}
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            {data.github && (
              <a
                href={data.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors text-slate-700 hover:scale-110 transform duration-200"
              >
                <Github size={28} />
              </a>
            )}
            {data.linkedin && (
              <a
                href={data.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors text-blue-600 hover:scale-110 transform duration-200"
              >
                <Linkedin size={28} />
              </a>
            )}
            {data.email && (
              <a
                href={`mailto:${data.email}`}
                className="p-4 bg-indigo-50 rounded-full hover:bg-indigo-100 transition-colors text-indigo-600 hover:scale-110 transform duration-200"
              >
                <Mail size={28} />
              </a>
            )}
            {data.website && (
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors text-emerald-600 hover:scale-110 transform duration-200"
              >
                <Globe size={28} />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* About & Education Section */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Left Column: Education */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <GraduationCap size={24} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Education</h2>
              </div>

              <div className="space-y-8 pl-6 border-l-2 border-slate-100">
                {data.education && data.education.length > 0 ? (
                  data.education.map((edu, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-indigo-500 ring-4 ring-white"></div>
                      <h3 className="text-xl font-bold text-slate-900">
                        {edu.institution}
                      </h3>
                      <div className="text-lg text-indigo-600 font-medium mb-1">
                        {edu.degree}
                      </div>
                      <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {edu.year}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">
                    Education details not listed.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Soft Skills & Philosophy */}
            <div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Award size={24} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">
                  Core Attributes
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {softSkills.length > 0 ? (
                  softSkills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors"
                    >
                      <h4 className="font-bold text-slate-800 mb-1">
                        {skill.name}
                      </h4>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full"
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-slate-500 italic p-4 border border-dashed border-slate-200 rounded-xl">
                    Focusing on communication, leadership, and problem-solving.
                  </div>
                )}
              </div>

              <div className="mt-10 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <div className="flex items-start gap-3">
                  <BookOpen className="text-indigo-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">
                      My Philosophy
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                      I believe in writing clean, maintainable code and building
                      accessible, user-centric interfaces. Continuous learning
                      and adaptation are at the heart of my professional
                      journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Skills Section */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-base font-bold text-slate-400 uppercase tracking-widest mb-10 text-center">
            Technical Proficiency
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {techSkills.map((skill, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 px-6 py-3 rounded-xl shadow-sm flex items-center gap-3 hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                <span className="font-semibold text-slate-700 text-lg">
                  {skill.name}
                </span>
                {/* Visualizing level */}
                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden ml-2">
                  <div
                    className="h-full bg-indigo-500"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl">
              01
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Work Experience
            </h2>
          </div>

          <div className="space-y-16 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-200 before:via-slate-300 before:to-transparent">
            {data.experience?.map((job, idx) => (
              <div
                key={idx}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
              >
                {/* Timeline Dot */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-indigo-500 text-white shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>

                {/* Content Card */}
                <div className="w-[calc(100%-5rem)] md:w-[calc(50%-3rem)] bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-4 gap-2">
                    <h3 className="font-bold text-2xl text-slate-900">
                      {job.role}
                    </h3>
                    <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit whitespace-nowrap">
                      {job.period}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-slate-700 mb-4">
                    {job.company}
                  </div>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    {job.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section
        id="projects"
        className="py-32 px-4 sm:px-6 lg:px-8 bg-slate-50/50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold text-xl">
              02
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Selected Projects
            </h2>
          </div>

          <div className="relative">
            {projects.length > 3 && (
              <button
                onClick={() => scrollProjects("left")}
                className="absolute -left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors z-10"
                aria-label="Previous projects"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            <div
              ref={projectsRowRef}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory pr-2 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {projects.length > 0 ? (
                projects.map((project, idx) => (
                  <div
                    key={idx}
                    className="group bg-white rounded-3xl overflow-hidden border border-slate-200 hover:shadow-2xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-2 min-w-[320px] max-w-[360px] snap-start"
                  >
                    <div
                      className="h-64 relative overflow-hidden"
                      style={projectAccent(project.name)}
                    >
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
                        <span className="text-6xl font-black opacity-20 mb-2 select-none">
                          {project.name.charAt(0)}
                        </span>
                        <span className="text-xl font-semibold drop-shadow-sm line-clamp-2">
                          {project.name}
                        </span>
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-slate-600 text-lg mb-6 flex-1 leading-relaxed">
                        {project.description}
                      </p>

                      {project.link && (
                        <a
                          href={project.link}
                          className="inline-flex items-center text-base font-bold text-indigo-600 hover:text-indigo-700 mt-auto group/link"
                        >
                          View Project{" "}
                          <ExternalLink
                            size={18}
                            className="ml-2 group-hover/link:translate-x-1 transition-transform"
                          />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 bg-white border border-dashed border-slate-200 rounded-3xl text-center text-slate-500 min-w-[320px]">
                  No projects available yet.
                </div>
              )}
            </div>

            {projects.length > 3 && (
              <button
                onClick={() => scrollProjects("right")}
                className="absolute -right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-colors z-10"
                aria-label="Next projects"
              >
                <ChevronRight size={22} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Analysis Section (Private View Only) */}
      {!isEmployerView && analysis && <AnalysisDashboard analysis={analysis} />}

      {/* Footer */}
      <footer
        id="contact"
        className="bg-slate-900 text-white py-32 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Let's work together.
          </h2>
          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            I'm currently looking for new opportunities. Whether you have a
            question or just want to say hi, I'll try my best to get back to
            you!
          </p>
          <a
            href={`mailto:${data.email}`}
            className="inline-flex h-16 items-center justify-center rounded-full bg-indigo-600 px-10 text-xl font-bold text-white transition-all hover:bg-indigo-500 hover:scale-105 shadow-xl shadow-indigo-900/20"
          >
            Say Hello <Mail className="ml-3" size={24} />
          </a>

          <div className="mt-24 pt-12 border-t border-slate-800 text-base text-slate-500 flex flex-col md:flex-row justify-between items-center gap-6">
            <p>
              © {new Date().getFullYear()} {data.fullName}. All rights reserved.
            </p>
            <div className="flex gap-6">
              {data.location && (
                <span className="flex items-center gap-2">
                  <MapPin size={18} /> {data.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PortfolioView;
