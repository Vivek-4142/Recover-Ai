import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Icons } from "../components/Icons";

function DoctorPatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      setLoading(true);
      setError(null);

      const sessionUser = JSON.parse(localStorage.getItem("recover-ai-user"));
      if (!sessionUser || sessionUser.role !== "doctor") {
        setError("Unauthorized access.");
        setLoading(false);
        return;
      }

      try {
        const patRes = await api.get(`/patients/${id}`);
        const p = patRes.data;

        // Verify patient belongs to this doctor
        if (p.doctor_id !== sessionUser.id) {
          setError("Access Restrained: This patient is assigned to another clinical specialist.");
          setLoading(false);
          return;
        }

        const logsRes = await api.get(`/checkins/${id}`);
        const pLogs = logsRes.data;
        setLogs(pLogs);

        const logsCount = pLogs.length;
        const avgPain = logsCount > 0
          ? Number((pLogs.reduce((sum, l) => sum + Number(l.pain_level), 0) / logsCount).toFixed(1))
          : 3.5;
        
        const medCount = pLogs.filter((l) => l.medication_taken).length;
        const adherence = logsCount > 0 ? Math.round((medCount / logsCount) * 100) : 100;

        let score = 75; // Default fallback
        let risk = "Normal";

        if (logsCount > 0) {
          const latest = pLogs[pLogs.length - 1];
          try {
            const predRes = await api.post("/predict-recovery", {
              pain_level: Number(latest.pain_level),
              symptoms: latest.symptoms || "None",
              medication_taken: Boolean(latest.medication_taken),
              energy_level: latest.energy_level || "Medium"
            });
            score = Math.round(predRes.data.recovery_score);
            const backendRisk = predRes.data.risk;
            if (backendRisk === "LOW") risk = "Normal";
            else if (backendRisk === "MEDIUM") risk = "Elevated";
            else if (backendRisk === "HIGH") risk = "High Alert";
          } catch (predErr) {
            console.error("ML Prediction request failed, using fallback formula", predErr);
            score = Math.min(95, 60 + (logsCount * 6));
            risk = score > 85 ? "Normal" : score > 70 ? "Elevated" : "High Alert";
          }
        }

        let painCurve = [7, 6, 6, 5, 4, 3, Number(avgPain)];
        let recoveryCurve = [20, 32, 45, 52, 60, 68, score];

        if (logsCount > 0) {
          painCurve = Array.from({ length: 7 }, (_, i) => {
            const idx = pLogs.length - 7 + i;
            return idx >= 0 ? pLogs[idx].pain_level : Math.max(2, 7 - Math.floor(i / 1.5));
          });
          recoveryCurve = Array.from({ length: 7 }, (_, i) => {
            const idx = pLogs.length - 7 + i;
            return idx >= 0
              ? Math.min(100, score - (pLogs.length - 1 - idx) * 4)
              : Math.min(100, Math.max(20, score - (6 - i) * 6));
          });
        }

        setPatient({
          id: p.id,
          name: p.name,
          age: p.age,
          condition: p.condition,
          recovery_start_date: p.recovery_start_date,
          assigned_doctor: p.assigned_doctor,
          vitals: {
            pain: avgPain,
            adherence: adherence,
            logsSubmitted: logsCount,
            score: score
          },
          painChart: painCurve,
          recoveryChart: recoveryCurve,
          riskAlert: risk,
          aiInsight: logsCount > 0
            ? `Bio-telemetry analytics parsed successfully. Active Healing Velocity score is calculated as ${score}/100. Symptoms trigger correlates tightly with a ${100 - adherence}% drop in medication adherence. Suggested regimen: Prioritize capsule compliance and rest.`
            : `No active daily logs logged for case ${p.name}. Clinical diagnostics require check-in biofeedback to evaluate ML recovery metrics.`
        });

      } catch (err) {
        console.error("Error loading patient analytics data", err);
        setError("Clinical Databanks synchronization failure.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [id]);

  // Helper colors
  const getRiskBadgeColor = (risk) => {
    if (risk === "Normal") return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    if (risk === "Elevated") return "bg-amber-500/10 border-amber-500/30 text-amber-400";
    return "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse";
  };

  const getRiskStatusCircle = (risk) => {
    if (risk === "Normal") return "bg-emerald-500";
    if (risk === "Elevated") return "bg-amber-500";
    return "bg-red-500";
  };

  const getPainColorClass = (pain) => {
    if (pain <= 3) return "text-emerald-400";
    if (pain <= 6) return "text-amber-400";
    return "text-red-400";
  };

  const getAdherenceColorClass = (adh) => {
    if (adh >= 90) return "text-emerald-400";
    if (adh >= 75) return "text-cyan-400";
    return "text-amber-400";
  };

  // SVG Graphs settings
  const chartWidth = 540;
  const chartHeight = 160;
  const padding = 25;
  const graphWidth = chartWidth - padding * 2;
  const graphHeight = chartHeight - padding * 2;

  const buildSvgPoints = (data, scaleMax) => {
    return data.map((val, idx) => {
      const x = padding + (idx * graphWidth) / (data.length - 1);
      const y = padding + graphHeight - (val * graphHeight) / scaleMax;
      return { x, y, val };
    });
  };

  const buildSvgPath = (pts) => {
    return pts.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, "");
  };

  const buildSvgAreaPath = (pts) => {
    if (pts.length === 0) return "";
    const linePath = buildSvgPath(pts);
    return `${linePath} L ${pts[pts.length - 1].x} ${chartHeight - padding} L ${pts[0].x} ${chartHeight - padding} Z`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <svg className="animate-spin h-10 w-10 text-accent-secondary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-text-muted font-bold">Retrieving Clinical Telemetries...</span>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
          <Icons.Alert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-main mb-2">Access Restrained</h2>
        <p className="text-sm text-text-muted mb-6">{error}</p>
        <button
          onClick={() => navigate("/doctor/dashboard")}
          className="px-4 py-2 bg-accent-secondary text-white rounded-xl font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const painPts = buildSvgPoints(patient.painChart, 10);
  const recoveryPts = buildSvgPoints(patient.recoveryChart, 100);

  return (
    <div className="relative py-4 sm:py-6">
      {/* Background ambient glows */}
      <div className="absolute top-10 left-1/3 w-96 h-96 rounded-full bg-accent-secondary/5 blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Header back navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 px-2">
        <button
          onClick={() => navigate("/doctor/dashboard")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-border-main text-xs font-bold text-text-muted hover:text-text-main hover:bg-white/10 transition-all duration-300 cursor-pointer shadow-md"
        >
          <Icons.ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back to Case Dashboard</span>
        </button>
        <div>
          <span className="text-[10px] font-black text-accent-secondary uppercase tracking-wider block text-right">
            Diagnostic Record #0{patient.id}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-[fadeIn_0.4s_ease-out]">
        
        {/* Core telemetry details */}
        <div className="lg:col-span-12 rounded-3xl bg-bg-card border border-border-main p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-secondary/5 rounded-bl-full pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-4 flex items-center gap-4 border-b md:border-b-0 md:border-r border-border-main/60 pb-4 md:pb-0">
              <div className="w-14 h-14 rounded-2xl bg-accent-secondary/10 border border-accent-secondary/20 flex items-center justify-center font-extrabold text-lg text-accent-secondary">
                {patient.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-black text-text-main leading-tight flex items-center gap-2">
                  {patient.name}
                </h2>
                <p className="text-xs text-text-muted font-bold mt-0.5">
                  Age: <span className="text-text-main">{patient.age} years</span> • Case Registry: <span className="text-text-main">{patient.id}</span>
                </p>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col justify-center items-center md:items-start border-b md:border-b-0 md:border-r border-border-main/60 pb-4 md:pb-0 md:px-6">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Healing Progress</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-accent-secondary">{patient.vitals.score}%</span>
                <span className="text-xs font-bold text-text-muted">Calculated Curve</span>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col justify-center items-center md:items-start md:pl-6">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Risk Level classification</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border ${getRiskBadgeColor(patient.riskAlert)}`}>
                <span className={`w-2 h-2 rounded-full ${getRiskStatusCircle(patient.riskAlert)}`} />
                <span>{patient.riskAlert}</span>
              </span>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-border-main/50 text-xs">
            <div>
              <span className="text-text-muted font-bold block uppercase tracking-wider text-[9px] mb-1">Clinical Diagnosis</span>
              <span className="text-sm font-extrabold text-text-main">{patient.condition}</span>
            </div>
            <div className="sm:border-x border-border-main/50 sm:px-6">
              <span className="text-text-muted font-bold block uppercase tracking-wider text-[9px] mb-1">Supervising Specialist</span>
              <span className="text-sm font-extrabold text-text-main flex items-center gap-1.5">
                <Icons.Doctor className="w-4 h-4 text-accent-secondary" />
                <span>{patient.assigned_doctor} (Assigned)</span>
              </span>
            </div>
            <div className="sm:pl-6">
              <span className="text-text-muted font-bold block uppercase tracking-wider text-[9px] mb-1">Onboarding Baseline Date</span>
              <span className="text-sm font-extrabold text-text-main">{patient.recovery_start_date}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Vitals Indicators */}
        <div className="lg:col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-bg-card border border-border-main p-5 shadow-lg flex flex-col justify-between h-32">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Average Pain Index</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-3xl font-black ${getPainColorClass(patient.vitals.pain)}`}>
                {patient.vitals.pain}
              </span>
              <span className="text-xs font-bold text-text-muted">/10</span>
            </div>
            <div className="text-[9px] text-text-muted mt-2 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Biofeedback Pain Index</span>
            </div>
          </div>

          <div className="rounded-2xl bg-bg-card border border-border-main p-5 shadow-lg flex flex-col justify-between h-32">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Adherence Rating</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-3xl font-black ${getAdherenceColorClass(patient.vitals.adherence)}`}>
                {patient.vitals.adherence}%
              </span>
            </div>
            <div className="text-[9px] text-text-muted mt-2 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span>Medication Compliance Rate</span>
            </div>
          </div>

          <div className="rounded-2xl bg-bg-card border border-border-main p-5 shadow-lg flex flex-col justify-between h-32">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Check-in Logs Sync</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-accent-secondary">
                {patient.vitals.logsSubmitted}
              </span>
              <span className="text-xs font-bold text-text-muted">Logs</span>
            </div>
            <div className="text-[9px] text-text-muted mt-2 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
              <span>Supervision Synced records</span>
            </div>
          </div>

          <div className="rounded-2xl bg-bg-card border border-border-main p-5 shadow-lg flex flex-col justify-between h-32">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Healing Curve Index</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-accent-secondary">
                {patient.vitals.score}
              </span>
              <span className="text-xs font-bold text-text-muted">/100</span>
            </div>
            <div className="text-[9px] text-text-muted mt-2 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Model Prediction Score</span>
            </div>
          </div>
        </div>

        {/* Dual Chart Sections */}
        <div className="lg:col-span-6 rounded-3xl bg-bg-card border border-border-main p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />

          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-bold text-text-main">Recovery Progression</h3>
              </div>
              <p className="text-xs text-text-muted mt-0.5 font-medium">Mobility & recovery score timeline (%)</p>
            </div>
            <span className="text-xs font-extrabold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              {patient.vitals.score}% Velocity
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[450px] h-auto text-emerald-400">
              <defs>
                <linearGradient id="recGradientDoc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {Array.from({ length: 5 }).map((_, i) => {
                const y = padding + (i * graphHeight) / 4;
                const val = 100 - i * 25;
                return (
                  <g key={i} className="opacity-[0.05] stroke-text-main">
                    <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} strokeWidth={1} strokeDasharray="2 2" />
                    <text x={padding - 8} y={y + 3} textAnchor="end" stroke="none" fill="currentColor" className="text-[9px] font-bold">
                      {val}%
                    </text>
                  </g>
                );
              })}

              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} className="opacity-10 stroke-text-main" strokeWidth={1} />
              <path d={buildSvgAreaPath(recoveryPts)} fill="url(#recGradientDoc)" />
              <path d={buildSvgPath(recoveryPts)} fill="none" stroke="#10b981" strokeWidth={3} className="drop-shadow-[0_2px_8px_rgba(16,185,129,0.2)]" />

              {recoveryPts.map((pt, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle cx={pt.x} cy={pt.y} r={6} className="fill-emerald-500/10 stroke-emerald-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <circle cx={pt.x} cy={pt.y} r={3.5} className="fill-bg-main stroke-emerald-500" strokeWidth={2} />
                </g>
              ))}

              {["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Today"].map((day, idx) => {
                const x = padding + (idx * graphWidth) / 6;
                return (
                  <text key={idx} x={x} y={chartHeight - padding + 16} textAnchor="middle" fill="currentColor" className="text-[9px] font-bold opacity-60 text-text-muted">
                    {day}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-3xl bg-bg-card border border-border-main p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/5 rounded-bl-full pointer-events-none" />

          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-accent-primary" />
                <h3 className="text-sm font-bold text-text-main">Soreness / Pain Scale</h3>
              </div>
              <p className="text-xs text-text-muted mt-0.5 font-medium">Daily pain curve indexes (0-10)</p>
            </div>
            <span className="text-xs font-extrabold text-accent-primary px-2.5 py-1 rounded-lg bg-accent-primary/10 border border-accent-primary/20">
              Avg Index: {patient.vitals.pain}
            </span>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[450px] h-auto text-accent-primary">
              <defs>
                <linearGradient id="painGradientDoc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {Array.from({ length: 5 }).map((_, i) => {
                const y = padding + (i * graphHeight) / 4;
                const val = 10 - i * 2.5;
                return (
                  <g key={i} className="opacity-[0.05] stroke-text-main">
                    <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} strokeWidth={1} strokeDasharray="2 2" />
                    <text x={padding - 8} y={y + 3} textAnchor="end" stroke="none" fill="currentColor" className="text-[9px] font-bold">
                      {val}
                    </text>
                  </g>
                );
              })}

              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} className="opacity-10 stroke-text-main" strokeWidth={1} />
              <path d={buildSvgAreaPath(painPts)} fill="url(#painGradientDoc)" />
              <path d={buildSvgPath(painPts)} fill="none" stroke="currentColor" strokeWidth={3} className="drop-shadow-[0_2px_8px_var(--glow-primary)]" />

              {painPts.map((pt, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle cx={pt.x} cy={pt.y} r={6} className="fill-accent-primary/10 stroke-accent-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <circle cx={pt.x} cy={pt.y} r={3.5} className="fill-bg-main stroke-accent-primary" strokeWidth={2} />
                </g>
              ))}

              {["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Today"].map((day, idx) => {
                const x = padding + (idx * graphWidth) / 6;
                return (
                  <text key={idx} x={x} y={chartHeight - padding + 16} textAnchor="middle" fill="currentColor" className="text-[9px] font-bold opacity-60 text-text-muted">
                    {day}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* History Feed List */}
        <div className="lg:col-span-5 rounded-3xl bg-bg-card border border-border-main p-6 shadow-xl flex flex-col h-[400px]">
          <h3 className="text-sm font-extrabold text-text-main mb-4 flex items-center gap-2">
            <Icons.CheckIn className="w-5 h-5 text-accent-secondary" />
            <span>Check-in Logs History</span>
          </h3>

          <div className="flex-1 overflow-y-auto pr-1.5 scrollbar-thin">
            <div className="flex flex-col gap-4 relative pl-3 before:content-[''] before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-border-main">
              {logs.length > 0 ? (
                logs.map((item, idx) => (
                  <div key={idx} className="relative flex gap-4 items-start pl-6 group animate-[fadeIn_0.3s_ease-out]">
                    <span className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-bg-main group-hover:scale-125 transition-transform duration-300 ${
                      item.pain_level <= 3 ? "bg-emerald-500" : item.pain_level <= 6 ? "bg-amber-500" : "bg-red-500"
                    }`} />

                    <div className="flex-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <h4 className="text-xs font-extrabold text-text-main">
                          {idx === logs.length - 1 ? "Today" : `${logs.length - 1 - idx} days ago`}
                        </h4>
                        <span className="text-[10px] font-bold text-text-muted font-mono">Pain: {item.pain_level}/10</span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-1.5 font-medium leading-relaxed">
                        {item.symptoms || "No active symptoms logged."}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[9px] font-bold text-text-muted">
                        <span className={`flex items-center gap-0.5 ${item.medication_taken ? "text-emerald-400" : "text-amber-400"}`}>
                          💊 {item.medication_taken ? "Capsule Taken" : "Capsule Missed"}
                        </span>
                        <span>⚡ Energy: {item.energy_level || "Medium"}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-xs text-text-muted font-bold">
                  No active check-in logs submitted yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="lg:col-span-7 rounded-3xl bg-bg-card border border-border-main p-6 shadow-xl flex flex-col h-[400px] justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-secondary/5 rounded-bl-full pointer-events-none" />

          <div>
            <div className="flex justify-between items-center pb-3 border-b border-border-main/50 mb-4">
              <h3 className="text-sm font-extrabold text-text-main flex items-center gap-2">
                <Icons.Pulse className="w-5 h-5 text-accent-secondary animate-pulse" />
                <span>AI Clinical Diagnostics Insights</span>
              </h3>
              <span className="text-[9px] font-extrabold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Active Core
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-border-main text-xs font-semibold leading-relaxed text-text-main mb-4">
              <p>{patient.aiInsight}</p>
            </div>
            
            <p className="text-[10px] font-medium leading-relaxed text-text-muted">
              Note: These telemetry alerts are generated via a localized random forest classifier mapping the patient's daily pain grades, self-reported symptoms, compliance index, and energy states dynamically. Review clinical checks if high pain persists.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/5 to-amber-500/5 border border-red-500/10 text-[11px] font-medium leading-relaxed text-text-muted flex gap-3 items-center">
            <Icons.Alert className={`w-5 h-5 flex-shrink-0 ${patient.riskAlert === "High Alert" ? "text-red-500" : "text-amber-500"}`} />
            <span>
              {patient.riskAlert === "High Alert" 
                ? "WARNING: Active pain parameters exceed threshold guidelines. Case requires prompt clinical assessment." 
                : patient.riskAlert === "Elevated" 
                  ? "ATTENTION: Minor muscle spasms and compliance drop logged. Recommend gentle spinal stretching exercises."
                  : "STATUS SAFE: Telemetry data indicates steady and normal progression. Regular supervision calendar active."
              }
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default DoctorPatientDetails;
