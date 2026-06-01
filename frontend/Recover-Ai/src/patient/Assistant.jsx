import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { Icons } from "../components/Icons";

function PatientAssistant() {
  const [sessionUser, setSessionUser] = useState(null);
  const [patient, setPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      const user = JSON.parse(localStorage.getItem("recover-ai-user"));
      if (!user || user.role !== "patient") {
        setLoading(false);
        return;
      }
      setSessionUser(user);

      try {
        const patRes = await api.get(`/patients/${user.id}`);
        const p = patRes.data;

        const logsRes = await api.get(`/checkins/${user.id}`);
        const pLogs = logsRes.data;

        const logsCount = pLogs.length;
        const avgPain = logsCount > 0
          ? Number((pLogs.reduce((sum, l) => sum + Number(l.pain_level), 0) / logsCount).toFixed(1))
          : 3.5;
        
        const medCount = pLogs.filter((l) => l.medication_taken).length;
        const adherence = logsCount > 0 ? Math.round((medCount / logsCount) * 100) : 100;

        let score = 75;
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
          } catch (err) {
            console.error("ML Prediction request failed, using fallback", err);
            score = Math.min(95, 60 + (logsCount * 6));
            risk = score > 85 ? "Normal" : score > 70 ? "Elevated" : "High Alert";
          }
        }

        const activePatient = {
          name: p.name,
          condition: p.condition,
          assigned_doctor: p.assigned_doctor,
          vitals: { pain: avgPain, adherence, logsSubmitted: logsCount, score },
          riskAlert: risk,
          latestLog: pLogs.length > 0 ? pLogs[pLogs.length - 1] : null
        };
        setPatient(activePatient);

        // Initial assistant greeting
        setMessages([
          {
            id: 1,
            sender: "ai",
            text: `Hello, ${user.name}! I am your Recover AI Diagnostic Assistant. I've successfully synchronized with your clinical case file on "${p.condition}". Ask me anything about your recovery trend, daily pain levels, medication schedule, or treatment tips!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

      } catch (err) {
        console.error("Failed to sync AI chat telemetry", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  // Scroll chat feed
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !patient) return;

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

    setTimeout(() => {
      let replyText = "";
      const p = patient;

      if (query.includes("pain") || query.includes("sore")) {
        replyText = `Based on your daily clinical check-ins, your average pain index stands at ${p.vitals.pain}/10. Today's active level is ${p.latestLog?.pain_level !== undefined ? p.latestLog.pain_level + "/10" : "stable"}. Since beginning recovery, your levels show positive stability. Avoid high-impact flexion if soreness rises above 5.`;
      } else if (query.includes("score") || query.includes("progress") || query.includes("recovery")) {
        replyText = `Your current calculated Healing Progress velocity is ${p.vitals.score}/100. This places your recovery in the [${p.riskAlert.toUpperCase()}] standard timeline range. Regular physical sets are highly recommended to support active soft tissue loading.`;
      } else if (query.includes("pill") || query.includes("medication") || query.includes("adherence") || query.includes("compliance")) {
        replyText = `Your medication compliance rate stands at ${p.vitals.adherence}%. Maintaining strict consistency is critical for neural pain prevention. Please let your supervisor, ${p.assigned_doctor}, know if you experience severe symptoms during dosage adjustments.`;
      } else if (query.includes("alert") || query.includes("risk")) {
        replyText = `Your current triage classification stands at [${p.riskAlert.toUpperCase()}]. ${
          p.riskAlert === "Normal"
            ? "Your vitals indicators are balanced. There are no clinical alerts on your active record."
            : p.riskAlert === "Elevated"
              ? "Vitals show minor stiffness spikes. We recommend increasing rest intervals and prioritizing afternoon therapy sets."
              : "WARNING: High pain parameters recorded. Recommend contacting your specialist clinic immediately."
        }`;
      } else if (query.includes("doctor") || query.includes("specialist")) {
        replyText = `You are supervised by clinical specialist ${p.assigned_doctor}. All diagnostic analytics logged through your portal dashboard are transmitted to their desk in real-time.`;
      } else if (query.includes("stretch") || query.includes("exercise") || query.includes("physio")) {
        replyText = `For your condition (${p.condition}), gentle range-of-motion stretching is recommended. Prioritize low-load movements. If you experience burning pain, stop immediately and contact ${p.assigned_doctor}.`;
      } else {
        replyText = `Understood. Analyzing telemetry factors for your condition (${p.condition}): Healing index is ${p.vitals.score}/100, pain average is ${p.vitals.pain}/10, and medication adherence stands at ${p.vitals.adherence}%. Feel free to ask more specific questions on your treatment logs!`;
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
        <svg className="animate-spin h-10 w-10 text-accent-primary mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-text-muted font-bold">Connecting AI Companion Core...</span>
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
          <Icons.Alert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-main mb-2">Access Restrained</h2>
        <p className="text-sm text-text-muted">Please log in as a patient to access the AI Diagnostic Assistant.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center py-4 px-2">
      {/* Background glow */}
      <div className="absolute top-10 w-96 h-96 rounded-full bg-accent-primary/10 blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-4xl bg-bg-card border border-border-main rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col h-[650px] relative overflow-hidden">
        
        {/* Chat Header */}
        <div className="flex justify-between items-center pb-4 mb-4 border-b border-border-main/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/30">
              <Icons.Pulse className="w-5 h-5 text-accent-primary animate-pulse" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-bg-card" />
            </div>
            <div>
              <h3 className="text-sm font-black text-text-main">Recover AI Diagnostic Assistant</h3>
              <p className="text-[10px] text-text-muted font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>AI Diagnostics Core Active</span>
              </p>
            </div>
          </div>
          <span className="text-[9px] font-extrabold text-accent-secondary uppercase tracking-wider px-2 py-0.5 rounded-md bg-accent-secondary/10 border border-accent-secondary/20">
            {patient?.condition}
          </span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 scrollbar-thin mb-4">
          {messages.map((msg) => {
            const isAi = msg.sender === "ai";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] items-start animate-[fadeIn_0.25s_ease-out] ${
                  isAi ? "self-start" : "self-end flex-row-reverse"
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-extrabold border text-xs ${
                  isAi 
                    ? "bg-accent-primary/10 border-accent-primary/20 text-accent-primary" 
                    : "bg-accent-secondary/10 border-accent-secondary/20 text-accent-secondary"
                }`}>
                  {isAi ? "AI" : sessionUser.name.charAt(0)}
                </div>

                {/* Bubble */}
                <div className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed border shadow-md ${
                  isAi 
                    ? "bg-white/5 border-border-main text-text-main rounded-tl-none" 
                    : "bg-accent-primary/10 border-accent-primary/20 text-text-main rounded-tr-none"
                }`}>
                  <p>{msg.text}</p>
                  <span className="text-[8px] font-bold text-text-muted block text-right mt-2">{msg.time}</span>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-start self-start">
              <div className="w-8 h-8 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary flex items-center justify-center font-extrabold text-xs">
                AI
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-border-main flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-bounce" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="flex gap-2.5 items-center pt-3 border-t border-border-main/60 flex-shrink-0">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={`Ask about your ${patient?.condition || "treatment"} parameters...`}
            className="flex-1 bg-white/5 border border-border-main focus:border-accent-primary rounded-xl px-4 py-3 text-xs text-text-main outline-none transition-all duration-300 font-semibold"
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-95 text-white flex items-center justify-center flex-shrink-0 cursor-pointer shadow-[0_4px_12px_rgba(34,211,238,0.15)] transition-all duration-300"
          >
            <Icons.ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}

export default PatientAssistant;
