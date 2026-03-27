import React, { useState } from "react";
import { User, UserRole } from "../types";
import {
  API_BASE_DISPLAY,
  loginUser,
  registerUser,
  fetchUserByEmail,
  loginEmployer,
  registerEmployer,
  fetchEmployerByEmail,
  resetUserPassword,
  resetEmployerPassword,
  loginAdministrator,
  registerAdministrator,
  fetchAdministratorByEmail,
  resetAdministratorPassword,
} from "../services/api";
import {
  Briefcase,
  User as UserIcon,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Shield,
} from "lucide-react";

interface Props {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<Props> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const validatePassword = (pwd: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push("At least 8 characters");
    if (pwd.length > 64) errors.push("Maximum 64 characters");
    if (!/[a-z]/.test(pwd)) errors.push("Lowercase letter");
    if (!/[A-Z]/.test(pwd)) errors.push("Uppercase letter");
    if (!/\d/.test(pwd)) errors.push("Number");
    if (!/[^A-Za-z0-9]/.test(pwd)) errors.push("Special character");
    if (/\s/.test(pwd)) errors.push("No spaces allowed");
    return { isValid: errors.length === 0, errors };
  };

  const passwordValidation = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isForgotPassword) {
        if (role === "candidate") {
          await resetUserPassword(email, password);
        } else if (role === "employer") {
          await resetEmployerPassword(email, password);
        } else {
          await resetAdministratorPassword(email, password);
        }
        setSuccess("Password updated successfully. You can now log in.");
        setIsForgotPassword(false);
        setIsLogin(true);
        return;
      }

      let authed: User | null = null;
      if (role === "candidate") {
        if (isLogin) {
          authed = await loginUser(email, password);
        } else {
          authed = await registerUser(name, email, password);
        }
        // Ensure we have the latest user data with the correct name
        authed = await fetchUserByEmail(email);
        authed.role = "candidate";
      } else {
        if (role === "employer") {
          if (isLogin) {
            authed = await loginEmployer(email, password);
          } else {
            authed = await registerEmployer(name, email, password);
          }
          authed = await fetchEmployerByEmail(email);
          authed.role = "employer";
        } else {
          if (isLogin) {
            authed = await loginAdministrator(email, password);
          } else {
            authed = await registerAdministrator(name, email, password);
          }
          authed = await fetchAdministratorByEmail(email);
          authed.role = "administrator";
        }
      }

      if (authed) {
        onLogin(authed);
      } else {
        setError("Authentication failed");
      }
    } catch (err: any) {
      const msg = err?.message || "Authentication failed";
      const status = err?.status;
      const fieldErrors = err?.fieldErrors as Record<string, string> | undefined;
      console.error("Auth error details:", err);

      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        const orderedFields = ["name", "email", "password", "companyName"];
        const orderedMessages = orderedFields
          .filter((key) => fieldErrors[key])
          .map((key) => fieldErrors[key]);
        const remainingMessages = Object.entries(fieldErrors)
          .filter(([key]) => !orderedFields.includes(key))
          .map(([, value]) => value);
        const allMessages = [...orderedMessages, ...remainingMessages];
        setError(allMessages.join(" "));
      } else if (msg.includes("Failed to fetch")) {
        setError(
          "Cannot connect to the backend server. Please make sure the API is running at " +
          API_BASE_DISPLAY
        );
      } else if (status === 409 || msg.includes("Email already registered") || msg.includes("409")) {
        setError("This email is already registered. Please log in instead.");
      } else if (status === 401 || msg.includes("401")) {
        setError("Invalid email or password.");
      } else if (status === 404 && isForgotPassword) {
        setError(`No ${role} account found with this email.`);
      } else if (status === 400) {
        setError("Please check your input and try again.");
      } else if (status === 500 && msg && msg !== "Authentication failed") {
        setError(msg);
      } else if (status === 500 && !isLogin && !isForgotPassword) {
        setError("Registration failed due to a server error. Please try again in a moment.");
      } else if (status === 500) {
        setError("Server error. Please try again in a moment.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side: Branding */}
        <div className="md:w-1/2 bg-slate-900 p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 z-0"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 transform translate-x-1/3 -translate-y-1/3"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white">
                <Sparkles size={20} />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                AutoFolio
              </span>
            </div>

            <h2 className="text-4xl font-extrabold text-white mb-6 leading-tight">
              {role === "candidate"
                ? "Launch your career with an AI-powered portfolio."
                : role === "employer"
                  ? "Access our curated talent pool."
                  : "Manage users and monitor platform health."}
            </h2>
            <p className="text-slate-400 text-lg">
              {role === "candidate"
                ? "Upload your resume and get a professional website + job market analysis in seconds."
                : role === "employer"
                  ? "Log in to browse pre-vetted candidates or screen new resumes instantly."
                  : "Use the administrator console to manage candidate/employer accounts and monitor system status."}
            </p>
          </div>

          <div className="relative z-10 mt-12 pr-3 md:pr-6">
            <div className="flex gap-2 md:gap-3">
              <button
                onClick={() => {
                  setRole("candidate");
                  setError(null);
                }}
                className={`flex-1 min-w-0 py-3 px-2 md:px-3 rounded-xl text-xs md:text-sm font-bold transition-all border-2 flex items-center justify-center gap-1.5 md:gap-2 ${role === "candidate"
                  ? "bg-white text-slate-900 border-white"
                  : "bg-transparent text-slate-400 border-slate-700 hover:border-slate-600"
                  }`}
              >
                <UserIcon size={18} /> Candidate
              </button>
              <button
                onClick={() => {
                  setRole("employer");
                  setError(null);
                }}
                className={`flex-1 min-w-0 py-3 px-2 md:px-3 rounded-xl text-xs md:text-sm font-bold transition-all border-2 flex items-center justify-center gap-1.5 md:gap-2 ${role === "employer"
                  ? "bg-white text-slate-900 border-white"
                  : "bg-transparent text-slate-400 border-slate-700 hover:border-slate-600"
                  }`}
              >
                <Briefcase size={18} /> Employer
              </button>
              <button
                onClick={() => {
                  setRole("administrator");
                  setError(null);
                }}
                className={`flex-1 min-w-0 py-3 px-2 md:px-3 rounded-xl text-xs md:text-sm font-bold transition-all border-2 flex items-center justify-center gap-1.5 md:gap-2 ${role === "administrator"
                  ? "bg-white text-slate-900 border-white"
                  : "bg-transparent text-slate-400 border-slate-700 hover:border-slate-600"
                  }`}
              >
                <Shield size={18} /> Admin
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {isForgotPassword
                ? "Reset Password"
                : isLogin
                  ? "Welcome back"
                  : "Create an account"}
            </h3>
            <p className="text-slate-500">
              {isForgotPassword
                ? "Enter your email and new password."
                : isLogin
                  ? "Enter your details to access your account."
                  : `Sign up as a ${role} to get started.`}
            </p>
          </div>

          {success && (
            <div className="mb-6 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-emerald-100">
              <Sparkles size={16} />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isForgotPassword && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon
                    className="absolute left-3 top-3.5 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900"
                    placeholder="Your Full Name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900"
                  placeholder="Your Email Address"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                {isForgotPassword ? "New Password" : "Password"}
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3.5 text-slate-400"
                  size={18}
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-lg focus:ring-2 focus:border-indigo-500 outline-none transition-all text-slate-900 ${
                    password && !passwordValidation.isValid
                      ? "border-red-300 focus:ring-red-500"
                      : password && passwordValidation.isValid
                        ? "border-emerald-300 focus:ring-emerald-500"
                        : "border-slate-200 focus:ring-indigo-500"
                  }`}
                  placeholder={isForgotPassword ? "Enter New Password" : "Your Password"}
                />
              </div>

              {password && !isLogin && !isForgotPassword && (
                <div className="mt-2 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-700 mb-1">Password must contain:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { text: "At least 8 characters", check: password.length >= 8 },
                      { text: "Uppercase letter", check: /[A-Z]/.test(password) },
                      { text: "Lowercase letter", check: /[a-z]/.test(password) },
                      { text: "Number", check: /\d/.test(password) },
                      { text: "Special character", check: /[^A-Za-z0-9]/.test(password) },
                      { text: "No spaces", check: !/\s/.test(password) },
                    ].map((req, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            req.check
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-300 text-slate-500"
                          }`}
                        >
                          {req.check ? "✓" : "○"}
                        </div>
                        <span className={req.check ? "text-emerald-700" : "text-slate-600"}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {isLogin && role === "administrator" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setIsLogin(false);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-4 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4 ${
                !isLogin && !isForgotPassword && password && !passwordValidation.isValid
                  ? "bg-slate-300 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
              }`}
              disabled={loading || (!isLogin && !isForgotPassword && password && !passwordValidation.isValid)}
            >
              {loading
                ? "Please wait..."
                : isForgotPassword
                  ? "Reset Password"
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}{" "}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              {isForgotPassword ? (
                <button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setIsLogin(true);
                    setError(null);
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Back to login
                </button>
              ) : isLogin && role === "administrator" ? null : (
                <>
                  {isLogin
                    ? "Don't have an account?"
                    : "Already have an account?"}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="ml-2 font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    {isLogin ? "Sign up" : "Log in"}
                  </button>
                </>
              )}
            </p>
          </div>


        </div>
      </div>
    </div>
  );
};

export default AuthPage;
