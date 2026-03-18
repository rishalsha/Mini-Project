import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  File,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Props {
  onUpload: (content: string, mimeType: string) => void;
  isLoading: boolean;
  isEmployer?: boolean;
  canViewPortfolio?: boolean;
  onViewPortfolio?: () => void;
}

const UploadSection: React.FC<Props> = ({
  onUpload,
  isLoading,
  isEmployer,
  canViewPortfolio,
  onViewPortfolio,
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "text">("upload");
  const [textInput, setTextInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        alert(
          "We currently process DOCX via copy-paste. Please use the 'Paste Text' tab for DOCX content, or upload a PDF."
        );
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result as string, file.type);
      };
      reader.readAsDataURL(file);
    }

    // Allow re-uploading the same file by clearing the input value
    e.target.value = "";
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onUpload(textInput, "text/plain");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          {isEmployer ? (
            <>
              Screen <span className="text-indigo-600">Candidate</span> Resume
            </>
          ) : (
            <>
              Turn your Resume into a{" "}
              <span className="text-indigo-600">Portfolio</span>
            </>
          )}
        </h1>
        <p className="text-lg text-slate-600">
          {isEmployer
            ? "Upload a candidate's resume (PDF) to generate a portfolio view and get AI-powered compatibility analysis."
            : "Upload your resume (PDF) to generate a professional website and get AI-powered career insights instantly."}
        </p>
      </div>

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="h-80 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <div className="text-slate-600 font-medium animate-pulse">
              {isEmployer
                ? "Analyzing Candidate Profile..."
                : "Analyzing Resume & Market Trends..."}
            </div>
            <div className="text-xs text-slate-400 max-w-xs text-center">
              We are generating the portfolio view and searching for match data.
            </div>
          </div>
        ) : (
          <>
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === "upload"
                    ? "bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <File size={18} /> Upload PDF
              </button>
              <button
                onClick={() => setActiveTab("text")}
                className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === "text"
                    ? "bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <FileText size={18} /> Paste Text
              </button>
            </div>

            <div className="p-8">
              {activeTab === "upload" ? (
                <div
                  className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    fileInputRef.current?.click();
                  }}
                >
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">
                    Click to Upload Resume
                  </h3>
                  <p className="text-sm text-slate-500 text-center">
                    Supports PDF (Preferred) & Images
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,image/*,.docx"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100">
                    <AlertCircle size={14} className="mt-0.5" />
                    For DOCX files, please copy and paste the text content below
                    for best results.
                  </div>
                  <textarea
                    className="w-full h-64 p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none text-sm font-mono text-slate-700"
                    placeholder="Paste resume content here..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                  <button
                    onClick={handleTextSubmit}
                    disabled={!textInput.trim()}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Analyze Resume
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <p className="mt-8 text-xs text-slate-400">
        Powered by Gemini
      </p>

      {!isEmployer && canViewPortfolio && onViewPortfolio && (
        <button
          onClick={onViewPortfolio}
          className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700 underline"
        >
          View existing portfolio
        </button>
      )}
    </div>
  );
};

export default UploadSection;
