import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { Icons } from "../components/Icons";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    condition: "",
    recovery_start_date: "",
    doctor_id: ""
  });

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const navigate = useNavigate();

  // Fetch doctors list on load
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get("/auth/doctors");
        setDoctors(response.data);
        if (response.data.length > 0) {
          setFormData((prev) => ({ ...prev, doctor_id: response.data[0].id.toString() }));
        }
      } catch (err) {
        console.error("Failed to load supervising doctors", err);
      }
    };
    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    // Basic Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.age ||
      !formData.condition ||
      !formData.recovery_start_date ||
      !formData.doctor_id
    ) {
      setFeedback({
        type: "error",
        message: "Please fill out all clinical registry fields."
      });
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/register/patient", {
        ...formData,
        age: Number(formData.age),
        doctor_id: Number(formData.doctor_id)
      });

      setFeedback({
        type: "success",
        message: "Patient registration successful! Redirecting to Portal Login..."
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error(err);
      setFeedback({
        type: "error",
        message: err.response?.data?.detail || "Failed to create patient profile. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-8 px-4">
      {/* Ambient glows */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-accent-primary/10 blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-accent-secondary/5 blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-2xl bg-bg-card/75 backdrop-blur-xl border border-border-main rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Glow Top Accent */}
        <div className="absolute -top-[1.5px] left-1/3 right-1/3 h-[3px] bg-gradient-to-r from-transparent via-accent-primary to-transparent" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary mb-3">
            <Icons.Heart className="w-5 h-5 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-main">
            Patient Registry Onboarding
          </h1>
          <p className="text-xs text-text-muted mt-1 font-bold tracking-wider uppercase">
            Initialize Baseline Diagnostic Model
          </p>
        </div>

        {feedback && (
          <div
            className={`mb-6 p-4 rounded-xl border text-sm font-medium flex items-start gap-3 animate-[slideIn_0.3s_ease-out] ${
              feedback.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <Icons.Alert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Section: Credentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Vivek Kumar"
                className="w-full bg-white/5 border border-border-main focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 rounded-xl px-4 py-3 text-sm text-text-main outline-none transition-all duration-300 font-medium"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 28"
                min="1"
                max="120"
                className="w-full bg-white/5 border border-border-main focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 rounded-xl px-4 py-3 text-sm text-text-main outline-none transition-all duration-300 font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. vivek@patient.com"
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create secure password"
                className="w-full bg-white/5 border border-border-main focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 rounded-xl px-4 py-3 text-sm text-text-main outline-none transition-all duration-300 font-medium"
                required
              />
            </div>
          </div>

          {/* Section: Diagnostics */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Diagnosis / Medical Condition
            </label>
            <input
              type="text"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              placeholder="e.g. Spine Fusion Surgery Recovery"
              className="w-full bg-white/5 border border-border-main focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 rounded-xl px-4 py-3 text-sm text-text-main outline-none transition-all duration-300 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Recovery Start Date
              </label>
              <input
                type="date"
                name="recovery_start_date"
                value={formData.recovery_start_date}
                onChange={handleChange}
                className="w-full bg-white/5 border border-border-main focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 rounded-xl px-4 py-3 text-sm text-text-main outline-none transition-all duration-300 font-medium [color-scheme:dark]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Supervising Doctor Assignment
              </label>
              {doctors.length > 0 ? (
                <select
                  name="doctor_id"
                  value={formData.doctor_id}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-border-main focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 rounded-xl px-4 py-3 text-sm text-text-main outline-none transition-all duration-300 font-bold cursor-pointer pr-10"
                  required
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id.toString()}>
                      {d.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full bg-white/5 border border-red-500/30 rounded-xl px-4 py-3 text-xs text-red-400 font-semibold">
                  No active clinical specialists online. Please launch database.
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || doctors.length === 0}
            className="w-full mt-4 py-3.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_var(--glow-primary)]"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Provisioning Clinical Profile...</span>
              </>
            ) : (
              <>
                <span>Complete Onboarding Registry</span>
                <Icons.ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border-main/50 text-center text-xs text-text-muted font-bold">
          Already registered?{" "}
          <Link to="/login" className="text-accent-primary hover:underline">
            Go to Portal Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
