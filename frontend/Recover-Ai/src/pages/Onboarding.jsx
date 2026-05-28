import { useState } from "react";
import api from "../services/api";
import { Icons } from "../components/Icons";

function Onboarding() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    condition: "",
    recovery_start_date: "",
    assigned_doctor: ""
  });

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

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

    // Form validation
    if (!formData.name || !formData.age || !formData.condition || !formData.recovery_start_date || !formData.assigned_doctor) {
      setFeedback({
        type: "error",
        message: "Please populate all clinical registry fields."
      });
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/patients", {
        ...formData,
        age: Number(formData.age)
      });

      setFeedback({
        type: "success",
        message: `Clinical Profile for ${formData.name} created successfully! Assigned ID: ${response.data.patient_id || "Active"}`
      });

      // Reset form
      setFormData({
        name: "",
        age: "",
        condition: "",
        recovery_start_date: "",
        assigned_doctor: ""
      });

    } catch (error) {
      console.error(error);
      setFeedback({
        type: "error",
        message: "Failed to create patient profile. Please ensure the backend clinical server is online."
      });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      title: "Realtime Physician Connection",
      desc: "Instant bio-telemetry reports sent to your assigned doctor daily.",
      icon: Icons.Doctor
    },
    {
      title: "AI-Powered Diagnostics",
      desc: "Proactive alerting algorithms identify recovery bottlenecks before they escalate.",
      icon: Icons.Pulse
    },
    {
      title: "Interactive Progress Tracking",
      desc: "Customized medical calendars and timeline charting map your healing trajectory.",
      icon: Icons.Dashboard
    }
  ];

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center py-6 px-4">
      {/* Background glow */}
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-accent-primary/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-10 w-72 h-72 rounded-full bg-accent-secondary/5 blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Info Column (Left) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-bg-card to-bg-main/50 border border-border-main shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/5 rounded-full blur-xl pointer-events-none" />
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-xs font-semibold text-accent-primary mb-6">
              <Icons.Heart className="w-3.5 h-3.5" />
              <span>Patient Onboarding Gateway</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4 text-text-main">
              Start Your Journey To{" "}
              <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                Full Recovery.
              </span>
            </h1>

            <p className="text-sm text-text-muted leading-relaxed font-medium mb-8">
              Onboarding clinical records is the vital first step. By structuring patient symptoms, recovery metrics, and specialist assignments, Recover AI configures your custom tracking model.
            </p>

            {/* Benefits List */}
            <div className="flex flex-col gap-6">
              {benefits.map((b, i) => {
                const ItemIcon = b.icon;
                return (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
                      <ItemIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-main">{b.title}</h4>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed font-medium">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border-main text-xs text-text-muted font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Secure SSL Encrypted Clinical Registry</span>
          </div>
        </div>

        {/* Form Column (Right) */}
        <div className="lg:col-span-7 rounded-3xl bg-bg-card border border-border-main p-6 sm:p-8 shadow-xl flex flex-col justify-center relative overflow-hidden">
          
          <h2 className="text-2xl font-bold mb-1 text-text-main">Clinical Registry</h2>
          <p className="text-xs text-text-muted font-medium mb-6">Input core baseline parameters to register the patient profile.</p>

          {/* Feedback alerts */}
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
            {/* Input Row 1: Name & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <label htmlFor="name" className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  placeholder="e.g. Vivek Kumar"
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-border-main focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 rounded-xl px-4 py-3 text-sm text-text-main outline-none transition-all duration-300 font-medium"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="age" className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  placeholder="e.g. 28"
                  min="0"
                  max="125"
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-border-main focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 rounded-xl px-4 py-3 text-sm text-text-main outline-none transition-all duration-300 font-medium"
                  required
                />
              </div>
            </div>

            {/* Input Row 2: Condition */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="condition" className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Diagnosis / Medical Condition
              </label>
              <input
                type="text"
                id="condition"
                name="condition"
                value={formData.condition}
                placeholder="e.g. Post-op Knee Ligament Reconstruction"
                onChange={handleChange}
                className="w-full bg-white/5 border border-border-main focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 rounded-xl px-4 py-3 text-sm text-text-main outline-none transition-all duration-300 font-medium"
                required
              />
            </div>

            {/* Input Row 3: Start Date & Doctor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="recovery_start_date" className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Recovery Start Date
                </label>
                <input
                  type="date"
                  id="recovery_start_date"
                  name="recovery_start_date"
                  value={formData.recovery_start_date}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-border-main focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 rounded-xl px-4 py-3 text-sm text-text-main outline-none transition-all duration-300 font-medium [color-scheme:dark]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="assigned_doctor" className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Supervising Doctor
                </label>
                <input
                  type="text"
                  id="assigned_doctor"
                  name="assigned_doctor"
                  value={formData.assigned_doctor}
                  placeholder="e.g. Dr. Sarah Jenkins"
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-border-main focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 rounded-xl px-4 py-3 text-sm text-text-main outline-none transition-all duration-300 font-medium"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-4 py-3.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all duration-300 shadow-[0_4px_20px_rgba(34,211,238,0.15)] flex items-center justify-center gap-2 cursor-pointer ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Processing Baseline Profile...</span>
                </>
              ) : (
                <>
                  <span>Create Clinical Profile</span>
                  <Icons.ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default Onboarding;