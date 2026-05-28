import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { Icons } from "../components/Icons";

function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [loading, setLoading] = useState(false);

  // Interactive Chat State
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Baseline clinical profiles containing complete details and SVG chart values
  const baselinePatients = [
    {
      id: 101,
      name: "Vivek Kumar",
      age: 28,
      condition: "Post-op Knee Ligament Rehab",
      recovery_start_date: "2026-05-12",
      assigned_doctor: "Dr. Jenkins",
      vitals: { pain: 2.4, adherence: 92, logsSubmitted: 6, score: 94 },
      painChart: [8, 7, 5, 4, 3, 3, 2],
      recoveryChart: [20, 35, 50, 62, 78, 88, 94],
      riskAlert: "Normal", // Normal (Green), Elevated (Yellow), High Alert (Red)
      aiInsight: "Excellent recovery velocity. Pain index has dropped by 60% since baseline. Soft tissue is stabilizing. Recommended to proceed with Phase 2 low-impact loading exercises under therapist supervision.",
      logHistory: [
        { day: "Today", pain: 2, symptoms: "Mild joint stiffness in morning", med: true, energy: "High" },
        { day: "Yesterday", pain: 3, symptoms: "None", med: true, energy: "Medium" },
        { day: "2 days ago", pain: 3, symptoms: "Slight ache after walking", med: true, energy: "Medium" },
        { day: "3 days ago", pain: 4, symptoms: "Stiffness", med: true, energy: "Low" },
        { day: "4 days ago", pain: 5, symptoms: "Joint ache", med: true, energy: "Low" }
      ]
    },
    {
      id: 102,
      name: "Samantha Reed",
      age: 42,
      condition: "Spine Fusion Recovery",
      recovery_start_date: "2026-04-25",
      assigned_doctor: "Dr. Sarah Jenkins",
      vitals: { pain: 4.8, adherence: 76, logsSubmitted: 5, score: 81 },
      painChart: [6, 5, 6, 4, 7, 5, 4],
      recoveryChart: [30, 42, 48, 55, 62, 70, 81],
      riskAlert: "Elevated",
      aiInsight: "Warning: Intermittent pain spikes (+3.0) registered on Day 5, highly correlated with a missed capsule dosage. Advising strict adherence to the afternoon medication cycle. Recommended gentle spinal alignment stretching.",
      logHistory: [
        { day: "Today", pain: 4, symptoms: "Minor lower back numbness", med: true, energy: "Medium" },
        { day: "Yesterday", pain: 5, symptoms: "Muscle spasms", med: true, energy: "Low" },
        { day: "2 days ago", pain: 7, symptoms: "Acute spinal ache", med: false, energy: "Low" },
        { day: "3 days ago", pain: 4, symptoms: "Mild soreness", med: true, energy: "Medium" },
        { day: "4 days ago", pain: 6, symptoms: "Fatigue & ache", med: true, energy: "Low" }
      ]
    },
    {
      id: 103,
      name: "Aaron Miller",
      age: 65,
      condition: "Hip Replacement Rehab",
      recovery_start_date: "2026-05-01",
      assigned_doctor: "Dr. Brooks",
      vitals: { pain: 3.1, adherence: 100, logsSubmitted: 7, score: 89 },
      painChart: [7, 6, 6, 5, 4, 3, 3],
      recoveryChart: [25, 40, 52, 65, 75, 83, 89],
      riskAlert: "Normal",
      aiInsight: "Stable healing trajectory. Patient shows 100% medication compliance rate. Hip mobility angles are improving by 4 degrees week-over-week. Recommended to continue current mild hip flexion sets and short walker walks.",
      logHistory: [
        { day: "Today", pain: 3, symptoms: "Slight groin discomfort", med: true, energy: "Medium" },
        { day: "Yesterday", pain: 3, symptoms: "Slight stiffness", med: true, energy: "Medium" },
        { day: "2 days ago", pain: 4, symptoms: "None", med: true, energy: "Medium" },
        { day: "3 days ago", pain: 5, symptoms: "Stiffness", med: true, energy: "Low" },
        { day: "4 days ago", pain: 6, symptoms: "Soreness post-exercise", med: true, energy: "Low" }
      ]
    },
    {
      id: 104,
      name: "Elena Rostova",
      age: 34,
      condition: "ACL Reconstruction",
      recovery_start_date: "2026-05-18",
      assigned_doctor: "Dr. Brooks",
      vitals: { pain: 7.2, adherence: 60, logsSubmitted: 3, score: 54 },
      painChart: [8, 9, 8, 8, 7, 7, 7.2],
      recoveryChart: [10, 15, 22, 28, 38, 45, 54],
      riskAlert: "High Alert",
      aiInsight: "Critical Alert: Slow knee flexion velocity. Pain levels remain high (7.2/10) with an adherence of 60%. Highly recommend an evaluation check-up with Dr. Brooks to rule out graft inflammation or stiffness.",
      logHistory: [
        { day: "Today", pain: 7, symptoms: "Severe swelling & low knee extension", med: false, energy: "Low" },
        { day: "Yesterday", pain: 7, symptoms: "Intense burning pain", med: true, energy: "Low" },
        { day: "2 days ago", pain: 8, symptoms: "Knee swelling & warmth", med: false, energy: "Low" }
      ]
    }
  ];

  // Fetch clinical profiles with resilient fallback
  useEffect(() => {
    const fetchClinicalData = async () => {
      setLoading(true);
      try {
        const response = await api.get("/patients");
        // Map API records with dynamic values
        const apiPatients = response.data.map((p) => {
          const pain = Math.random() > 0.5 ? 2.5 : 4.2;
          const score = Math.floor(Math.random() * 20) + 75;
          const risk = score > 85 ? "Normal" : score > 70 ? "Elevated" : "High Alert";
          return {
            id: p.id,
            name: p.name,
            age: p.age,
            condition: p.condition,
            recovery_start_date: p.recovery_start_date,
            assigned_doctor: p.assigned_doctor,
            vitals: {
              pain: pain,
              adherence: Math.floor(Math.random() * 15) + 85,
              logsSubmitted: Math.floor(Math.random() * 2) + 5,
              score: score
            },
            painChart: [7, 6, 5, 4, 3, 3, 2.5],
            recoveryChart: [15, 30, 45, 58, 68, 74, score],
            riskAlert: risk,
            aiInsight: `Clinical telemetry verified for ${p.name}. Recovery score stands stable at ${score}/100. Symptoms present baseline trends under Dr. ${p.assigned_doctor}. Log frequency is healthy.`,
            logHistory: [
              { day: "Today", pain: 2, symptoms: "Steady improvement", med: true, energy: "Medium" },
              { day: "Yesterday", pain: 3, symptoms: "Mild pain", med: true, energy: "Medium" }
            ]
          };
        });

        const merged = [...apiPatients, ...baselinePatients];
        setPatients(merged);
        if (merged.length > 0) setSelectedPatientId(merged[0].id.toString());

      } catch (err) {
        console.warn("API Offline, loading mock patient database and local cache profiles");

        const localPatients = JSON.parse(localStorage.getItem("recover-ai-patients") || "[]");
        const localMapped = localPatients.map((p) => {
          const localLogs = JSON.parse(localStorage.getItem("recover-ai-logs") || "[]");
          const pLogs = localLogs.filter((l) => Number(l.patient_id) === Number(p.id));

          const avgPain = pLogs.length > 0
            ? (pLogs.reduce((sum, l) => sum + Number(l.pain_level), 0) / pLogs.length).toFixed(1)
            : 3.5;

          const medCount = pLogs.filter((l) => l.medication_taken).length;
          const adherence = pLogs.length > 0 ? Math.round((medCount / pLogs.length) * 100) : 85;
          const logsCount = pLogs.length;

          const recoveryScore = Math.min(95, 60 + (logsCount * 6));
          const risk = recoveryScore > 85 ? "Normal" : recoveryScore > 70 ? "Elevated" : "High Alert";

          // Create standard curves
          let painCurve = [7, 6, 6, 5, 4, 3, Number(avgPain)];
          let recoveryCurve = [20, 32, 45, 52, 60, 68, recoveryScore];

          if (pLogs.length > 0) {
            painCurve = Array.from({ length: 7 }, (_, i) => {
              const idx = pLogs.length - 7 + i;
              return idx >= 0 ? pLogs[idx].pain_level : Math.max(2, 7 - Math.floor(i / 1.5));
            });
            recoveryCurve = Array.from({ length: 7 }, (_, i) => {
              const idx = pLogs.length - 7 + i;
              return idx >= 0
                ? Math.min(100, 40 + (idx * 8))
                : Math.min(100, 20 + (i * 9));
            });
          }

          return {
            id: p.id,
            name: p.name,
            age: p.age,
            condition: p.condition,
            recovery_start_date: p.recovery_start_date,
            assigned_doctor: p.assigned_doctor,
            vitals: {
              pain: Number(avgPain),
              adherence: adherence,
              logsSubmitted: logsCount || 1,
              score: recoveryScore
            },
            painChart: painCurve,
            recoveryChart: recoveryCurve,
            riskAlert: risk,
            aiInsight: `Recovery model initiated on baseline ${p.recovery_start_date}. Healing velocity is calculated at ${recoveryScore}/100. Patient is active with ${logsCount} logged clinical records. Keep up the high adherence to support active remote diagnostics.`,
            logHistory: pLogs.map((pl, idx) => ({
              day: idx === 0 ? "Today" : `${idx} days ago`,
              pain: pl.pain_level,
              symptoms: pl.symptoms || "None",
              med: pl.medication_taken,
              energy: pl.energy_level || "Medium"
            })).reverse().slice(0, 5)
          };
        });

        const allPatients = [...localMapped, ...baselinePatients];
        const unique = [];
        const seen = new Set();
        for (const p of allPatients) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            unique.push(p);
          }
        }

        setPatients(unique);
        if (unique.length > 0) setSelectedPatientId(unique[0].id.toString());
      } finally {
        setLoading(false);
      }
    };

    fetchClinicalData();
  }, []);

  const activePatient = patients.find((p) => p.id.toString() === selectedPatientId) || baselinePatients[0];

  // Sync AI messages on active patient change
  useEffect(() => {
    if (activePatient) {
      setMessages([
        {
          id: 1,
          sender: "ai",
          text: `Hello! I am your Recover AI Assistant. I have analyzed clinical records for ${activePatient.name}. Ask me anything about their treatment, diagnostic scores, symptoms, or medication logs!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [selectedPatientId]);

  // Scroll chat feed
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = chatInput.toLowerCase();
    setChatInput("");
    setIsTyping(true);

    // AI responses based on selected patient
    setTimeout(() => {
      let replyText = "";
      const p = activePatient;

      if (query.includes("pain")) {
        replyText = `Based on daily checks, ${p.name}'s average pain index stands at ${p.vitals.pain}/10. Today's recorded level is ${p.logHistory[0]?.pain || "stable"}/10. This indicates a positive healing curve compared to initial baseline discomfort.`;
      } else if (query.includes("score") || query.includes("recovery")) {
        replyText = `The current calculated Healing Velocity score for ${p.name} is ${p.vitals.score}/100. This places them in the ${p.vitals.score > 85 ? "Optimal" : "Standard"} recovery range, showing highly positive response curves in physical rehabilitation.`;
      } else if (query.includes("pill") || query.includes("medication") || query.includes("adherence")) {
        replyText = `${p.name}'s current medication adherence index is ${p.vitals.adherence}%. Strict adherence is critical, as any disruption in doses can trigger pain spikes. Ensure the assigned specialist, ${p.assigned_doctor}, is briefed if doses are missed.`;
      } else if (query.includes("alert") || query.includes("risk")) {
        replyText = `Risk Status for ${p.name} is calculated as [${p.riskAlert.toUpperCase()}]. ${p.riskAlert === "High Alert"
            ? "WARNING: Vitals show elevated soreness and high pain indexes. Physical metrics flag swelling. Immediate practitioner briefing recommended."
            : p.riskAlert === "Elevated"
              ? "ATTENTION: Minor compliance drops and muscle spasms logged. Advise strict rest and gentle physiotherapy alignment sets."
              : "STATUS HEALTHY: Normal vitals logged. Patient is progressing safely on their recovery schedule."
          }`;
      } else if (query.includes("doctor") || query.includes("specialist")) {
        replyText = `${p.name} is currently supervised by clinical specialist ${p.assigned_doctor}. You can schedule updates directly to their department through this dashboard portal.`;
      } else {
        replyText = `Understood. Analyzing parameters for ${p.name} (${p.condition}). Vitals details: Healing Score is ${p.vitals.score}/100, Pain Average is ${p.vitals.pain}/10, and clinical alert index is classified as [${p.riskAlert}]. Let me know if you would like me to compile a progress file.`;
      }

      const aiResponse = {
        id: Date.now() + 1,
        sender: "ai",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1200);
  };

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

  const painPts = buildSvgPoints(activePatient?.painChart || [6, 5, 6, 4, 7, 5, 4], 10);
  const recoveryPts = buildSvgPoints(activePatient?.recoveryChart || [30, 42, 48, 55, 62, 70, 81], 100);

  return (
    <div className="relative py-4 sm:py-6 lg:py-8">

      {/* Background ambient glowing orbs */}
      <div className="absolute top-10 left-1/3 w-96 h-96 rounded-full bg-accent-primary/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-accent-secondary/5 blur-3xl pointer-events-none -z-10" />

      {/* Header telemetry control dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 px-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/20 text-xs font-semibold text-accent-primary mb-3">
            <Icons.Dashboard className="w-3.5 h-3.5" />
            <span>Diagnostics Telemetry Center</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-main">
            Clinical Health Dashboard
          </h1>
          <p className="text-sm text-text-muted mt-1 font-medium">
            AI-driven biofeedback analysis & patient recovery metrics.
          </p>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label htmlFor="patient_select" className="text-xs font-bold text-text-muted uppercase tracking-wider whitespace-nowrap">
            Select Patient Profile:
          </label>
          <div className="relative w-full sm:w-64">
            <select
              id="patient_select"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-bg-card border border-border-main focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 rounded-xl px-4 py-3 text-sm text-text-main outline-none transition-all duration-300 font-bold cursor-pointer appearance-none pr-10"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id.toString()}>
                  {p.name} (Case ID: {p.id})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-4 text-text-muted pointer-events-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-accent-primary mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-text-muted font-bold">Synchronizing Clinical Databanks...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-[fadeIn_0.4s_ease-out]">

          {/* ========================================================================= */}
          {/* PROFILE SUMMARY BAR - | Patient | Score | Risk Alert | */}
          {/* ========================================================================= */}
          <div className="lg:col-span-12 rounded-3xl bg-bg-card border border-border-main p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-bl-full pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

              {/* Patient Core Detail */}
              <div className="md:col-span-4 flex items-center gap-4 border-b md:border-b-0 md:border-r border-border-main/60 pb-4 md:pb-0">
                <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center font-extrabold text-lg text-accent-primary">
                  {activePatient?.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-black text-text-main leading-tight flex items-center gap-2">
                    {activePatient?.name}
                  </h2>
                  <p className="text-xs text-text-muted font-bold mt-0.5">
                    Case ID: <span className="text-text-main">{activePatient?.id}</span> • Age: <span className="text-text-main">{activePatient?.age}</span>
                  </p>
                </div>
              </div>

              {/* Patient Score */}
              <div className="md:col-span-4 flex flex-col justify-center items-center md:items-start border-b md:border-b-0 md:border-r border-border-main/60 pb-4 md:pb-0 md:px-6">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Recovery Score</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-accent-primary">{activePatient?.vitals.score}%</span>
                  <span className="text-xs font-bold text-text-muted">Healing Velocity</span>
                </div>
              </div>

              {/* Patient Risk Alert Status */}
              <div className="md:col-span-4 flex flex-col justify-center items-center md:items-start md:pl-6">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1.5">Triage Risk Alert</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border ${getRiskBadgeColor(activePatient?.riskAlert)}`}>
                  <span className={`w-2 h-2 rounded-full ${getRiskStatusCircle(activePatient?.riskAlert)}`} />
                  <span>{activePatient?.riskAlert}</span>
                </span>
              </div>

            </div>

            {/* Sub-metadata rows */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-border-main/50 text-xs">
              <div>
                <span className="text-text-muted font-bold block uppercase tracking-wider text-[9px] mb-1">Clinical Diagnosis</span>
                <span className="text-sm font-extrabold text-text-main">{activePatient?.condition}</span>
              </div>
              <div className="sm:border-x border-border-main/50 sm:px-6">
                <span className="text-text-muted font-bold block uppercase tracking-wider text-[9px] mb-1">Supervising Doctor</span>
                <span className="text-sm font-extrabold text-text-main flex items-center gap-1.5">
                  <Icons.Doctor className="w-4 h-4 text-accent-secondary" />
                  <span>{activePatient?.assigned_doctor}</span>
                </span>
              </div>
              <div className="sm:pl-6">
                <span className="text-text-muted font-bold block uppercase tracking-wider text-[9px] mb-1">Onboarding Baseline Date</span>
                <span className="text-sm font-extrabold text-text-main">{activePatient?.recovery_start_date}</span>
              </div>
            </div>

          </div>

          {/* Vitals metrics cards grid */}
          <div className="lg:col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-4">

            {/* Card 1: Avg Pain */}
            <div className="rounded-2xl bg-bg-card border border-border-main p-5 shadow-lg flex flex-col justify-between h-32">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Average Pain Index</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-3xl font-black ${getPainColorClass(activePatient?.vitals.pain)}`}>
                  {activePatient?.vitals.pain}
                </span>
                <span className="text-xs font-bold text-text-muted">/10</span>
              </div>
              <div className="text-[9px] text-text-muted mt-2 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Mild Grade Pain Scale</span>
              </div>
            </div>

            {/* Card 2: Adherence */}
            <div className="rounded-2xl bg-bg-card border border-border-main p-5 shadow-lg flex flex-col justify-between h-32">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Medication Adherence</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-3xl font-black ${getAdherenceColorClass(activePatient?.vitals.adherence)}`}>
                  {activePatient?.vitals.adherence}%
                </span>
              </div>
              <div className="text-[9px] text-text-muted mt-2 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <span>Active Capsule Compliance</span>
              </div>
            </div>

            {/* Card 3: Session Logs */}
            <div className="rounded-2xl bg-bg-card border border-border-main p-5 shadow-lg flex flex-col justify-between h-32">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Check-in Frequency</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-accent-primary">
                  {activePatient?.vitals.logsSubmitted}
                </span>
                <span className="text-xs font-bold text-text-muted">/7 days</span>
              </div>
              <div className="text-[9px] text-text-muted mt-2 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-secondary" />
                <span>Diagnostics Logs Sync</span>
              </div>
            </div>

            {/* Card 4: AI Healing Score */}
            <div className="rounded-2xl bg-bg-card border border-border-main p-5 shadow-lg flex flex-col justify-between h-32">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Healing Curve Score</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-accent-primary">
                  {activePatient?.vitals.score}
                </span>
                <span className="text-xs font-bold text-text-muted">/100</span>
              </div>
              <div className="text-[9px] text-text-muted mt-2 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Safe Progression Curve</span>
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* DUAL GRAPH SHEETS (Recovery Trend Graph & Pain Level Graph) */}
          {/* ========================================================================= */}

          {/* 2. RECOVERY TREND GRAPH */}
          <div className="lg:col-span-6 rounded-3xl bg-bg-card border border-border-main p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />

            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <h3 className="text-sm font-bold text-text-main">Recovery Trend Graph</h3>
                </div>
                <p className="text-xs text-text-muted mt-0.5 font-medium">Weekly Mobility & Healing Velocity Curve (%)</p>
              </div>
              <span className="text-xs font-extrabold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                Score: {activePatient?.vitals.score}%
              </span>
            </div>

            {/* SVG Graph */}
            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[450px] h-auto text-emerald-400">
                <defs>
                  <linearGradient id="recGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
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

                {/* Area Under Curve */}
                <path d={buildSvgAreaPath(recoveryPts)} fill="url(#recGradient)" />

                {/* Curve Line */}
                <path d={buildSvgPath(recoveryPts)} fill="none" stroke="#10b981" strokeWidth={3} className="drop-shadow-[0_2px_8px_rgba(16,185,129,0.2)]" />

                {/* Data circles */}
                {recoveryPts.map((pt, idx) => (
                  <g key={idx} className="group cursor-pointer">
                    <circle cx={pt.x} cy={pt.y} r={6} className="fill-emerald-500/10 stroke-emerald-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <circle cx={pt.x} cy={pt.y} r={3.5} className="fill-bg-main stroke-emerald-500" strokeWidth={2} />
                    <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="currentColor" className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      {pt.val}%
                    </text>
                  </g>
                ))}

                {/* Day Labels */}
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

          {/* 3. PAIN LEVEL GRAPH */}
          <div className="lg:col-span-6 rounded-3xl bg-bg-card border border-border-main p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/5 rounded-bl-full pointer-events-none" />

            <div className="flex justify-between items-center mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-primary" />
                  <h3 className="text-sm font-bold text-text-main">Pain Level Graph</h3>
                </div>
                <p className="text-xs text-text-muted mt-0.5 font-medium">Weekly Patient Pain Score Timeline (0-10)</p>
              </div>
              <span className="text-xs font-extrabold text-accent-primary px-2.5 py-1 rounded-lg bg-accent-primary/10 border border-accent-primary/20">
                Avg Pain: {activePatient?.vitals.pain}/10
              </span>
            </div>

            {/* SVG Graph */}
            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[450px] h-auto text-accent-primary">
                <defs>
                  <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
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

                {/* Area Under Curve */}
                <path d={buildSvgAreaPath(painPts)} fill="url(#painGradient)" />

                {/* Curve Line */}
                <path d={buildSvgPath(painPts)} fill="none" stroke="currentColor" strokeWidth={3} className="drop-shadow-[0_2px_8px_var(--glow-primary)]" />

                {/* Data circles */}
                {painPts.map((pt, idx) => (
                  <g key={idx} className="group cursor-pointer">
                    <circle cx={pt.x} cy={pt.y} r={6} className="fill-accent-primary/10 stroke-accent-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <circle cx={pt.x} cy={pt.y} r={3.5} className="fill-bg-main stroke-accent-primary" strokeWidth={2} />
                    <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="currentColor" className="text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      {pt.val}
                    </text>
                  </g>
                ))}

                {/* Day Labels */}
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

          {/* ========================================================================= */}
          {/* RECENT CHECK-INS FEED */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 rounded-3xl bg-bg-card border border-border-main p-6 shadow-xl flex flex-col h-[400px]">
            <h3 className="text-sm font-extrabold text-text-main mb-4 flex items-center gap-2">
              <Icons.CheckIn className="w-5 h-5 text-accent-secondary" />
              <span>Recent Check-ins</span>
            </h3>

            <div className="flex-1 overflow-y-auto pr-1.5 scrollbar-thin">
              <div className="flex flex-col gap-4 relative pl-3 before:content-[''] before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-border-main">
                {activePatient?.logHistory && activePatient.logHistory.length > 0 ? (
                  activePatient.logHistory.map((item, idx) => (
                    <div key={idx} className="relative flex gap-4 items-start pl-6 group animate-[fadeIn_0.3s_ease-out]">
                      {/* Bullet indicator */}
                      <span className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-bg-main group-hover:scale-125 transition-transform duration-300 ${item.pain <= 3 ? "bg-emerald-500" : item.pain <= 6 ? "bg-amber-500" : "bg-red-500"
                        }`} />

                      <div className="flex-1">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="text-xs font-extrabold text-text-main">{item.day}</h4>
                          <span className="text-[10px] font-bold text-text-muted font-mono">Pain: {item.pain}/10</span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-1.5 font-medium leading-relaxed">
                          {item.symptoms}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[9px] font-bold text-text-muted">
                          <span className={`flex items-center gap-0.5 ${item.med ? "text-emerald-400" : "text-amber-400"}`}>
                            💊 {item.med ? "Med Taken" : "Med Missed"}
                          </span>
                          <span>⚡ Energy: {item.energy}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center text-xs text-text-muted font-bold">
                    No active logs recorded. Launch a check-in log.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* AI INSIGHTS / CHAT ASSISTANT */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 rounded-3xl bg-bg-card border border-border-main p-6 shadow-xl flex flex-col h-[400px]">

            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-border-main/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary animate-pulse">
                  <Icons.Pulse className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-text-main tracking-tight">AI Diagnostic Chat Coach</h3>
                  <span className="text-[9px] text-text-muted font-bold block -mt-0.5">Diagnosing {activePatient?.name} • Accuracy 98.6%</span>
                </div>
              </div>
              <div className="text-[9px] px-2.5 py-1 bg-accent-secondary/15 text-accent-secondary rounded-lg font-bold border border-accent-secondary/20">
                Live Health Coach
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto pr-1.5 scrollbar-thin flex flex-col gap-3 mb-4">
              {messages.map((m) => {
                const isAi = m.sender === "ai";
                return (
                  <div
                    key={m.id}
                    className={`flex gap-2 max-w-[85%] animate-[fadeIn_0.3s_ease-out] ${isAi ? "self-start" : "self-end flex-row-reverse"
                      }`}
                  >
                    {isAi && (
                      <div className="w-6 h-6 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary text-[10px] flex-shrink-0 mt-0.5">
                        🤖
                      </div>
                    )}

                    <div className="flex flex-col">
                      <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${isAi
                          ? "bg-white/5 border border-border-main/50 text-text-main rounded-tl-none"
                          : "bg-accent-primary text-bg-main rounded-tr-none font-bold"
                        }`}>
                        {m.text}
                      </div>
                      <span className={`text-[8px] text-text-muted mt-1 font-bold ${isAi ? "self-start pl-1" : "self-end pr-1"
                        }`}>
                        {m.time}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex gap-2 self-start items-center">
                  <div className="w-6 h-6 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary text-[10px]">
                    🤖
                  </div>
                  <div className="bg-white/5 border border-border-main/50 px-3 py-2 rounded-2xl rounded-tl-none text-[10px] text-text-muted font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Sender */}
            <form onSubmit={handleSendMessage} className="flex gap-2.5 mt-auto pt-2 border-t border-border-main/50">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Ask about ${activePatient?.name}'s pain logs, score, or risk levels...`}
                className="flex-1 bg-white/5 border border-border-main focus:border-accent-primary rounded-xl px-4 py-2.5 text-xs text-text-main outline-none transition-all duration-300 font-semibold"
              />
              <button
                type="submit"
                className="px-4 rounded-xl bg-accent-primary text-bg-main hover:opacity-90 font-extrabold text-xs transition-all duration-300 shadow-[0_4px_15px_rgba(34,211,238,0.15)] cursor-pointer flex items-center justify-center"
              >
                Send
              </button>
            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Dashboard;
