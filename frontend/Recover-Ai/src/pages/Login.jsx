import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { Icons } from "../components/Icons";

function Login() {
  const [role, setRole] = useState("patient"); // 'patient' or 'doctor'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/login", { email, password });
      const user = response.data;

      localStorage.setItem("recover-ai-user", JSON.stringify(user));

      if (user.role === "doctor") {
        navigate("/doctor/dashboard");
      } else {
        navigate("/patient/dashboard");
      }

      // Force page reload or state change to sync nav headers
      window.dispatchEvent(new Event("storage"));

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        "Authentication failed. Please verify credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-10 px-4">
      {/* Dynamic Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-accent-primary/10 blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent-secondary/5 blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-bg-card/75 backdrop-blur-xl border border-border-main rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-300">

        {/* Glowing border effects */}
        <div className="absolute -top-[1.5px] left-1/4 right-1/4 h-[3px] bg-gradient-to-r from-transparent via-accent-primary to-transparent" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary mb-4 shadow-[0_0_15px_var(--glow-primary)]">
            <Icons.Doctor className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-text-main">
            Recover AI Portal
          </h1>
          <p className="text-xs text-text-muted mt-1 font-bold tracking-wider uppercase">
            Intelligent Recovery Companion
          </p>
        </div>

        {/* Auth Role Select Tab */}
        <div className="grid grid-cols-2 p-1.5 bg-white/5 border border-border-main/50 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setRole("patient");
              setError(null);
            }}
            className={`py-2 text-xs font-extrabold rounded-lg transition-all duration-300 cursor-pointer ${role === "patient"
                ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/30 shadow-md"
                : "text-text-muted hover:text-text-main"
              }`}
          >
            Patient Access
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("doctor");
              setError(null);
            }}
            className={`py-2 text-xs font-extrabold rounded-lg transition-all duration-300 cursor-pointer ${role === "doctor"
                ? "bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/30 shadow-md"
                : "text-text-muted hover:text-text-main"
              }`}
          >
            Clinical Staff
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border bg-red-500/10 border-red-500/30 text-red-400 text-xs font-semibold flex items-start gap-2.5 animate-[fadeIn_0.3s_ease-out]">
            <Icons.Alert className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === "doctor" ? "doctor.jenkins@recoverai.com" : "vivek@patient.com"}
              className="w-full bg-white/5 border border-border-main focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 rounded-xl px-4 py-3 text-sm text-text-main outline-none transition-all duration-300 font-medium"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-border-main focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 rounded-xl px-4 py-3 text-sm text-text-main outline-none transition-all duration-300 font-medium"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r ${role === "doctor"
                ? "from-accent-secondary to-purple-500 shadow-[0_4px_20px_rgba(167,139,250,0.15)]"
                : "from-accent-primary to-accent-secondary shadow-[0_4px_20px_rgba(34,211,238,0.15)]"
              } hover:opacity-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer mt-2`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Authenticating Portal...</span>
              </>
            ) : (
              <>
                <span>Portal Login</span>
                <Icons.ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {role === "patient" && (
          <div className="mt-8 pt-6 border-t border-border-main/50 text-center text-xs text-text-muted font-bold">
            New patient?{" "}
            <Link to="/register" className="text-accent-primary hover:underline">
              Create a Clinical Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
