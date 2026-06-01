import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Icons } from "../components/Icons";

function DoctorDashboard() {
  const [doctor, setDoctor] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorAndPatients = async () => {
      setLoading(true);
      setError(null);

      const sessionUser = JSON.parse(localStorage.getItem("recover-ai-user"));
      if (!sessionUser || sessionUser.role !== "doctor") {
        setError("Unauthorized. Please log in as clinical staff.");
        setLoading(false);
        return;
      }
      setDoctor(sessionUser);

      try {
        // Fetch only patients assigned to this doctor
        const patientsRes = await api.get(`/patients?doctor_id=${sessionUser.id}`);
        const rawPatients = patientsRes.data;

        // Process patient telemetry with API checkins
        const processed = await Promise.all(
          rawPatients.map(async (p) => {
            let pLogs = [];
            try {
              const logsRes = await api.get(`/checkins/${p.id}`);
              pLogs = logsRes.data;
            } catch (err) {
              console.error(`Failed to fetch logs for patient ${p.id}`, err);
            }

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

            return {
              id: p.id,
              name: p.name,
              age: p.age,
              condition: p.condition,
              recovery_start_date: p.recovery_start_date,
              vitals: {
                pain: avgPain,
                adherence: adherence,
                logsSubmitted: logsCount,
                score: score
              },
              riskAlert: risk
            };
          })
        );

        setPatients(processed);

      } catch (err) {
        console.error("Failed to load doctor clinical dataset", err);
        setError("Error synchronizing clinical data. Please check backend.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorAndPatients();
  }, []);

  // Summary Metrics calculations
  const totalCases = patients.length;
  const highAlertCount = patients.filter((p) => p.riskAlert === "High Alert").length;
  const elevatedCount = patients.filter((p) => p.riskAlert === "Elevated").length;
  
  const avgAdherence = totalCases > 0
    ? Math.round(patients.reduce((sum, p) => sum + p.vitals.adherence, 0) / totalCases)
    : 100;

  // Helper styles
  const getRiskBadgeColor = (risk) => {
    if (risk === "Normal") return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    if (risk === "Elevated") return "bg-amber-500/10 border-amber-500/30 text-amber-400";
    return "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse";
  };

  const getRiskCircleColor = (risk) => {
    if (risk === "Normal") return "bg-emerald-500";
    if (risk === "Elevated") return "bg-amber-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <svg className="animate-spin h-10 w-10 text-accent-secondary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-text-muted font-bold">Retrieving Assigned Patient Profiles...</span>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
          <Icons.Alert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-main mb-2">Access Restrained</h2>
        <p className="text-sm text-text-muted mb-6">{error || "Verification failed."}</p>
      </div>
    );
  }

  return (
    <div className="relative py-4 sm:py-6">
      {/* Background glow */}
      <div className="absolute top-10 left-1/3 w-96 h-96 rounded-full bg-accent-secondary/5 blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* Header telemetry board */}
      <div className="mb-8 px-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-secondary/10 border border-accent-secondary/20 text-xs font-semibold text-accent-secondary mb-3 shadow-[0_0_12px_rgba(167,139,250,0.05)]">
          <Icons.Doctor className="w-3.5 h-3.5" />
          <span>Clinical Supervision Dashboard</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-main">
          Welcome back, {doctor.name}
        </h1>
        <p className="text-sm text-text-muted mt-1 font-medium">
          Assigned patient diagnostics telemetries & real-time triage alerts.
        </p>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl bg-bg-card border border-border-main p-5 shadow-lg flex flex-col justify-between h-28">
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Active Supervisions</span>
          <span className="text-3xl font-black text-accent-secondary">{totalCases} Cases</span>
          <span className="text-[9px] text-text-muted font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
            <span>Assigned Case Registries</span>
          </span>
        </div>

        <div className="rounded-2xl bg-bg-card border border-border-main p-5 shadow-lg flex flex-col justify-between h-28">
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Triage Alerts (High)</span>
          <span className={`text-3xl font-black ${highAlertCount > 0 ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
            {highAlertCount} Critical
          </span>
          <span className="text-[9px] text-text-muted font-semibold flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${highAlertCount > 0 ? "bg-red-500" : "bg-emerald-500"}`} />
            <span>Immediate Check required</span>
          </span>
        </div>

        <div className="rounded-2xl bg-bg-card border border-border-main p-5 shadow-lg flex flex-col justify-between h-28">
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Elevated Risks</span>
          <span className="text-3xl font-black text-amber-400">{elevatedCount} Alerts</span>
          <span className="text-[9px] text-text-muted font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Minor compliance drops</span>
          </span>
        </div>

        <div className="rounded-2xl bg-bg-card border border-border-main p-5 shadow-lg flex flex-col justify-between h-28">
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Average Compliance</span>
          <span className="text-3xl font-black text-emerald-400">{avgAdherence}%</span>
          <span className="text-[9px] text-text-muted font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Overall Medication Adherence</span>
          </span>
        </div>
      </div>

      {/* Patients Data Grid Table */}
      <div className="rounded-3xl bg-bg-card border border-border-main p-6 shadow-xl relative overflow-hidden">
        <h3 className="text-sm font-extrabold text-text-main mb-4 flex items-center gap-2">
          <Icons.Dashboard className="w-5 h-5 text-accent-secondary" />
          <span>Assigned Clinical Profiles</span>
        </h3>

        {patients.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-border-main text-text-muted uppercase tracking-wider text-[9px]">
                  <th className="py-3 px-4">Patient Profile</th>
                  <th className="py-3 px-4">Age</th>
                  <th className="py-3 px-4">Diagnosis</th>
                  <th className="py-3 px-4 text-center">Healing Velocity</th>
                  <th className="py-3 px-4 text-center">Triage Risk Alert</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/55">
                {patients.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => navigate(`/doctor/patient/${p.id}`)}
                    className="group hover:bg-white/5 cursor-pointer transition-colors duration-200"
                  >
                    <td className="py-4 px-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform duration-200">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-extrabold text-text-main group-hover:text-accent-secondary transition-colors duration-200">
                          {p.name}
                        </div>
                        <div className="text-[10px] text-text-muted mt-0.5">Case ID: {p.id}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-text-muted font-bold">{p.age} years</td>
                    <td className="py-4 px-4 text-text-main">{p.condition}</td>
                    <td className="py-4 px-4 text-center text-sm font-extrabold text-accent-secondary">
                      {p.vitals.score}%
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${getRiskBadgeColor(p.riskAlert)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getRiskCircleColor(p.riskAlert)}`} />
                        <span>{p.riskAlert}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="px-3 py-1.5 rounded-lg bg-white/5 border border-border-main text-text-muted group-hover:text-text-main group-hover:bg-accent-secondary/20 group-hover:border-accent-secondary/30 transition-all duration-300 font-bold text-[10px] cursor-pointer">
                        View Biometrics
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-text-muted font-bold">
            No patients registered under your supervision yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;
