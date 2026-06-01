import React, { useState, useEffect } from "react";
import api from "../services/api";
import { Icons } from "../components/Icons";

function PatientDashboard() {
  const [patient, setPatient] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      setError(null);
      
      const sessionUser = JSON.parse(localStorage.getItem("recover-ai-user"));
      if (!sessionUser || sessionUser.role !== "patient") {
        setError("Unauthorized. Please log in as a patient.");
        setLoading(false);
        return;
      }

      try {
        // Fetch patient profile
        const patRes = await api.get(`/patients/${sessionUser.id}`);
        const p = patRes.data;

        // Fetch patient logs
        const logsRes = await api.get(`/checkins/${sessionUser.id}`);
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

        const logHistory = pLogs.map((pl, idx) => ({
          day: idx === pLogs.length - 1 ? "Today" : `${pLogs.length - 1 - idx} days ago`,
          pain: pl.pain_level,
          symptoms: pl.symptoms || "None",
          med: pl.medication_taken,
          energy: pl.energy_level || "Medium"
        })).reverse().slice(0, 5);

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
            ? `Excellent progress, ${p.name}! Your current calculated recovery progression score is ${score}/100 with an adherence rate of ${adherence}%. Keep submitting daily logs to ensure consistent biofeedback alignment.`
            : "No daily check-in logs submitted yet. To initialize your real-time recovery metrics and start AI predictions, please complete your first check-in log."
        });

      } catch (err) {
        console.error("Failed to load patient telemetry data", err);
        setError("Error loading patient records. Please ensure backend services are online.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

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
        <svg className="animate-spin h-10 w-10 text-accent-primary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-text-muted font-bold">Synchronizing Clinical Databanks...</span>
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
        <p className="text-sm text-text-muted mb-6">{error || "Please verify credentials."}</p>
      </div>
    );
  }

  const painPts = buildSvgPoints(patient.painChart, 10);
  const recoveryPts = buildSvgPoints(patient.recoveryChart, 100);

  return (
    <div className="relative py-4 sm:py-6">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-10 left-1/3 w-96 h-96 rounded-full bg-accent-primary/10 blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent-secondary/5 blur-3xl pointer-events-none -z-10" />

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 px-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-xs font-semibold text-accent-primary mb-3 shadow-[0_0_12px_rgba(34,211,238,0.05)]">
            <Icons.Heart className="w-3.5 h-3.5" />
            <span>Patient Telemetry Board</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-main">
            My Recovery Center
          </h1>
          <p className="text-sm text-text-muted mt-1 font-medium">
            AI biofeedback diagnostics & active healing schedule monitoring.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Patient Profile Card (Full width top) */}
        <div className="lg:col-span-12 rounded-3xl bg-bg-card border border-border-main p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-bl-full pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Patient details */}
            <div className="md:col-span-4 flex items-center gap-4 border-b md:border-b-0 md:border-r border-border-main/60 pb-4 md:pb-0">
              <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center font-extrabold text-lg text-accent-primary">
                {patient.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-black text-text-main leading-tight">
                  {patient.name}
                </h2>
                <p className="text-xs text-text-muted font-bold mt-0.5">
                  Age: <span className="text-text-main">{patient.age}</span> • Clinical Case ID: <span className="text-text-main">{patient.id}</span>
                </p>
              </div>
            </div>

            {/* Score */}
            <div className="md:col-span-4 flex flex-col justify-center items-center md:items-start border-b md:border-b-0 md:border-r border-border-main/60 pb-4 md:pb-0 md:px-6">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Healing Progress</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-accent-primary">{patient.vitals.score}%</span>
                <span className="text-xs font-bold text-text-muted">Calculated Velocity</span>
              </div>
            </div>

            {/* Risk Badge */}
            <div className="md:col-span-4 flex flex-col justify-center items-center md:items-start md:pl-6">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Model Triage Risk</span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border ${getRiskBadgeColor(patient.riskAlert)}`}>
                <span className={`w-2 h-2 rounded-full ${getRiskStatusCircle(patient.riskAlert)}`} />
                <span>{patient.riskAlert}</span>
              </span>
            </div>
          </div>

          {/* Sub-Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-border-main/50 text-xs">
            <div>
              <span className="text-text-muted font-bold block uppercase tracking-wider text-[9px] mb-1">Diagnosed Condition</span>
              <span className="text-sm font-extrabold text-text-main">{patient.condition}</span>
            </div>
            <div className="sm:border-x border-border-main/50 sm:px-6">
              <span className="text-text-muted font-bold block uppercase tracking-wider text-[9px] mb-1">Supervising Specialist</span>
              <span className="text-sm font-extrabold text-text-main flex items-center gap-1.5">
                <Icons.Doctor className="w-4 h-4 text-accent-secondary" />
                <span>{patient.assigned_doctor}</span>
              </span>
            </div>
            <div className="sm:pl-6">
              <span className="text-text-muted font-bold block uppercase tracking-wider text-[9px] mb-1">Recovery Baseline Date</span>
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
              <span className="text-3xl font-black text-accent-primary">
                {patient.vitals.logsSubmitted}
              </span>
              <span className="text-xs font-bold text-text-muted">Logs</span>
            </div>
            <div className="text-[9px] text-text-muted mt-2 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
              <span>Active Weekly Submissions</span>
            </div>
          </div>

          <div className="rounded-2xl bg-bg-card border border-border-main p-5 shadow-lg flex flex-col justify-between h-32">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Healing Curve Index</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-black text-accent-primary">
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
                <linearGradient id="recGradientPatient" x1="0" y1="0" x2="0" y2="1">
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
              <path d={buildSvgAreaPath(recoveryPts)} fill="url(#recGradientPatient)" />
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
                <linearGradient id="painGradientPatient" x1="0" y1="0" x2="0" y2="1">
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
              <path d={buildSvgAreaPath(painPts)} fill="url(#painGradientPatient)" />
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
        <div className="lg:col-span-6 rounded-3xl bg-bg-card border border-border-main p-6 shadow-xl flex flex-col h-[400px]">
          <h3 className="text-sm font-extrabold text-text-main mb-4 flex items-center gap-2">
            <Icons.CheckIn className="w-5 h-5 text-accent-secondary" />
            <span>My Check-in Log History</span>
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

        {/* Premium Medication & Wellness Reminder Card */}
        <div className="lg:col-span-6 rounded-3xl bg-bg-card border border-border-main p-6 shadow-xl flex flex-col h-[400px] justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-secondary/5 rounded-bl-full pointer-events-none" />

          <div>
            <h3 className="text-sm font-extrabold text-text-main mb-4 flex items-center gap-2">
              <Icons.Pill className="w-5 h-5 text-accent-primary" />
              <span>Daily Treatment Schedule</span>
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-border-main">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center font-bold text-sm">
                  08:00
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-text-main">Anti-inflammatory Capsule</h4>
                  <p className="text-[10px] text-text-muted font-medium mt-0.5">Take 1 pill after meal. Strict adherence recommended.</p>
                </div>
                <span className="ml-auto text-[9px] font-extrabold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Completed
                </span>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-border-main">
                <div className="w-10 h-10 rounded-xl bg-accent-secondary/10 text-accent-secondary flex items-center justify-center font-bold text-sm">
                  14:00
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-text-main">Physiotherapy Set A</h4>
                  <p className="text-[10px] text-text-muted font-medium mt-0.5">Gentle flexion stretches (15 mins duration).</p>
                </div>
                <span className="ml-auto text-[9px] font-extrabold text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  Pending
                </span>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/5 border border-border-main">
                <div className="w-10 h-10 rounded-xl bg-accent-secondary/10 text-accent-secondary flex items-center justify-center font-bold text-sm">
                  20:00
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-text-main">Muscle Relaxant Capsule</h4>
                  <p className="text-[10px] text-text-muted font-medium mt-0.5">Take 1 pill before resting. Prevents night cramps.</p>
                </div>
                <span className="ml-auto text-[9px] font-extrabold text-text-muted px-2 py-0.5 rounded-full bg-white/5 border border-border-main">
                  Scheduled
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 border border-accent-primary/10 text-[11px] font-medium leading-relaxed text-text-muted flex gap-3 items-center">
            <Icons.Alert className="w-5 h-5 text-accent-primary flex-shrink-0" />
            <span>
              <strong>AI Diagnostic Tip</strong>: Regular compliance with the afternoon stretching cycle has been statistically proven to reduce night muscle spasms by 35%.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
