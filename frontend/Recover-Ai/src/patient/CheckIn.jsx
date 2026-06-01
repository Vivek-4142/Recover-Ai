import { useState, useEffect } from "react";
import api from "../services/api";
import { Icons } from "../components/Icons";

function PatientCheckIn() {
  const [sessionUser, setSessionUser] = useState(null);
  const [formData, setFormData] = useState({
    pain_level: 0,
    symptoms: "",
    medication_taken: false,
    energy_level: "Medium"
  });

  const presetSymptoms = [
    { label: "Fatigue", emoji: "💤" },
    { label: "Joint Stiffness", emoji: "🦴" },
    { label: "Headache", emoji: "🧠" },
    { label: "Insomnia", emoji: "👁️" },
    { label: "Muscle Ache", emoji: "💪" },
    { label: "Nausea", emoji: "🤢" }
  ];

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptomText, setCustomSymptomText] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("recover-ai-user"));
    if (user && user.role === "patient") {
      setSessionUser(user);
    }
  }, []);

  // Sync symptoms checklist and custom comments into single 'symptoms' string
  useEffect(() => {
    const presetStr = selectedSymptoms.join(", ");
    const fullStr = [presetStr, customSymptomText].filter(Boolean).join(". Additional remarks: ");
    setFormData((prev) => ({ ...prev, symptoms: fullStr }));
  }, [selectedSymptoms, customSymptomText]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSymptomToggle = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const selectEnergy = (level) => {
    setFormData((prev) => ({ ...prev, energy_level: level }));
  };

  const getPainEmoticon = (pain) => {
    const p = Number(pain);
    if (p <= 2) return { emoji: "😊", text: "Comfortable / Normal", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
    if (p <= 4) return { emoji: "🙂", text: "Mild Discomfort", color: "text-teal-400 bg-teal-500/10 border-teal-500/30" };
    if (p <= 6) return { emoji: "😐", text: "Moderate Pain", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
    if (p <= 8) return { emoji: "🙁", text: "Severe Ache", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" };
    return { emoji: "😫", text: "Intense Pain / Call Clinic", color: "text-red-400 bg-red-500/10 border-red-500/30" };
  };

  const painState = getPainEmoticon(formData.pain_level);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    if (!sessionUser) {
      setFeedback({
        type: "error",
        message: "You must be logged in as a patient to submit logs."
      });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        patient_id: Number(sessionUser.id),
        pain_level: Number(formData.pain_level),
        symptoms: formData.symptoms,
        medication_taken: Boolean(formData.medication_taken),
        energy_level: formData.energy_level
      };

      await api.post("/checkins", payload);

      setFeedback({
        type: "success",
        message: "Daily Health Vitals successfully logged! Thank you for maintaining compliance."
      });

      // Reset
      setFormData({
        pain_level: 0,
        symptoms: "",
        medication_taken: false,
        energy_level: "Medium"
      });
      setSelectedSymptoms([]);
      setCustomSymptomText("");

    } catch (error) {
      console.error(error);
      setFeedback({
        type: "error",
        message: "Failed to log vitals. Please verify backend services are online."
      });
    } finally {
      setLoading(false);
    }
  };

  if (!sessionUser) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
          <Icons.Alert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-main mb-2">Access Restrained</h2>
        <p className="text-sm text-text-muted">Please log in as a patient to submit check-ins.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-6 px-4">
      {/* Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-accent-primary/10 blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent-secondary/5 blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-2xl bg-bg-card border border-border-main rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary mb-4">
            <Icons.CheckIn className="w-6 h-6 animate-bounce" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-main">
            Daily Recovery Check-In
          </h1>
          <p className="text-sm text-text-muted mt-1.5 max-w-md mx-auto font-medium">
            "Every logged symptom provides crucial biofeedback parameters to help your specialist supervisions."
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Identity info */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-border-main">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center font-bold text-xs text-accent-primary">
                {sessionUser.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-main">Logging for: {sessionUser.name}</h4>
                <p className="text-[10px] text-text-muted mt-0.5">Clinical Case ID: {sessionUser.id}</p>
              </div>
            </div>
            <span className="text-[9px] font-extrabold text-accent-primary uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent-primary/10 border border-accent-primary/20">
              Verified Session
            </span>
          </div>

          <hr className="border-border-main/50" />

          {/* Pain scale */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Current Pain Level
              </label>
              <div className={`px-3 py-1 rounded-full text-xs font-bold border transition-all duration-300 flex items-center gap-1.5 ${painState.color}`}>
                <span className="text-base leading-none">{painState.emoji}</span>
                <span>
                  Index {formData.pain_level}: {painState.text}
                </span>
              </div>
            </div>

            <div className="relative pt-4 pb-2 px-2">
              <input
                type="range"
                name="pain_level"
                min="0"
                max="10"
                value={formData.pain_level}
                onChange={handleChange}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-primary focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-text-muted font-bold mt-2 px-1">
                <span>0 (None)</span>
                <span>2</span>
                <span>4</span>
                <span>6</span>
                <span>8</span>
                <span>10 (Severe)</span>
              </div>
            </div>
          </div>

          <hr className="border-border-main/50" />

          {/* Preset Symptoms Checklist */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Select Active Symptoms
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {presetSymptoms.map((sym, i) => {
                const isActive = selectedSymptoms.includes(sym.label);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSymptomToggle(sym.label)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-center flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                      isActive
                        ? "bg-accent-primary/10 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(34,211,238,0.05)] scale-[1.02]"
                        : "bg-white/5 border-border-main text-text-muted hover:text-text-main hover:bg-white/10"
                    }`}
                  >
                    <span>{sym.emoji}</span>
                    <span>{sym.label}</span>
                  </button>
                );
              })}
            </div>

            <textarea
              placeholder="Provide detail on symptoms, pain triggers, or custom remarks..."
              value={customSymptomText}
              onChange={(e) => setCustomSymptomText(e.target.value)}
              className="w-full bg-white/5 border border-border-main focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 rounded-xl px-4 py-3 text-sm text-text-main outline-none transition-all duration-300 font-medium mt-2"
              rows="3"
            />
          </div>

          <hr className="border-border-main/50" />

          {/* Medication Taken Checkbox */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-border-main">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-secondary/10 flex items-center justify-center text-accent-secondary">
                <Icons.Pill className="w-5.5 h-5.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-main">Medication Compliance</h4>
                <p className="text-xs text-text-muted mt-0.5 font-medium">Have you taken your prescribed medicine today?</p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="medication_taken"
                checked={formData.medication_taken}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary animate-all duration-300"></div>
            </label>
          </div>

          {/* Energy Level Select Cards */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
              Log Energy Curve
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { val: "Low", icon: "💤", desc: "Fatigued" },
                { val: "Medium", icon: "⚡", desc: "Steady" },
                { val: "High", icon: "🔥", desc: "Vibrant" }
              ].map((en) => {
                const isActive = formData.energy_level === en.val;
                return (
                  <button
                    key={en.val}
                    type="button"
                    onClick={() => selectEnergy(en.val)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 ${
                      isActive
                        ? "bg-accent-primary/10 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(34,211,238,0.05)] scale-[1.02]"
                        : "bg-white/5 border-border-main text-text-muted hover:text-text-main hover:bg-white/10"
                    }`}
                  >
                    <span className="text-xl">{en.icon}</span>
                    <span className="text-sm font-bold">{en.val}</span>
                    <span className="text-[9px] opacity-70 hidden sm:inline">{en.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_var(--glow-primary)]"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Submitting Health Vitals...</span>
              </>
            ) : (
              <>
                <span>Securely Submit Daily Log</span>
                <Icons.ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PatientCheckIn;
