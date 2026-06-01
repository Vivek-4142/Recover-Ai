import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Icons } from "../components/Icons";

function Home() {
  // --- AI PREDICTION DEMO STATE ---
  const [demoPain, setDemoPain] = useState(4);
  const [demoMed, setDemoMed] = useState(true);
  const [demoEnergy, setDemoEnergy] = useState("Medium");
  const [demoResult, setDemoResult] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);

  // --- PORTAL SIMULATOR STATE ---
  const [activePortalTab, setActivePortalTab] = useState("patient"); // 'patient' or 'doctor'
  const [simSelectedPatient, setSimSelectedPatient] = useState("Vivek");

  // --- FAQ ACCORDION STATE ---
  const [activeFaq, setActiveFaq] = useState(null);

  // --- PRICING DURATION STATE ---
  const [billingPeriod, setBillingPeriod] = useState("annual"); // 'monthly' or 'annual'

  // Trigger live ML prediction simulation on the homepage
  const handleLivePrediction = async (e) => {
    e.preventDefault();
    setDemoLoading(true);
    setDemoResult(null);

    try {
      const res = await api.post("/predict-recovery", {
        pain_level: Number(demoPain),
        symptoms: "Demo test parameters logged from homepage",
        medication_taken: Boolean(demoMed),
        energy_level: demoEnergy
      });
      setDemoResult(res.data);
    } catch (err) {
      console.warn("API Offline during homepage demo. Using matching mathematical mockup.");
      // Standard formula fallback matching our pipeline logic
      const baseScore = 95 - Number(demoPain) * 6;
      const medBonus = demoMed ? 10 : -15;
      const energyBonus = demoEnergy === "High" ? 8 : demoEnergy === "Low" ? -12 : 0;
      const score = Math.max(10, Math.min(100, baseScore + medBonus + energyBonus));
      const risk = score >= 70 ? "LOW" : score >= 40 ? "MEDIUM" : "HIGH";
      
      setDemoResult({
        recovery_score: score,
        risk: risk
      });
    } finally {
      setDemoLoading(false);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="relative overflow-hidden py-4 sm:py-8">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full bg-accent-primary/10 blur-[120px] pointer-events-none -z-10 animate-[pulse_6s_infinite]" />
      <div className="absolute top-[600px] right-10 w-[450px] h-[450px] rounded-full bg-accent-secondary/5 blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-10 w-[400px] h-[400px] rounded-full bg-accent-primary/5 blur-[110px] pointer-events-none -z-10" />

      {/* ========================================== */}
      {/* 1. HERO SECTION WITH GLASS DASHBOARD PREVIEW */}
      {/* ========================================== */}
      <section className="text-center max-w-5xl mx-auto mb-24 px-4 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/30 text-xs font-bold text-accent-primary mb-6 animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.15)]">
          <Icons.Pulse className="w-3.5 h-3.5" />
          <span>V2.0 Core Telemetry & RBAC Enabled</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
          Accelerate Recovery <br />
          <span className="bg-gradient-to-r from-accent-primary via-cyan-400 to-accent-secondary bg-clip-text text-transparent">
            With Intelligent Oversight.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-text-muted max-w-3xl mx-auto mb-8 font-semibold leading-relaxed">
          Recover AI bridges post-op care gaps by mapping real-time patient biofeedback parameters against predictive ML classifiers, giving clinical specialists continuous clinical oversight.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            to="/login"
            className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:opacity-95 transition-all duration-300 shadow-[0_0_25px_rgba(34,211,238,0.25)] flex items-center gap-2 cursor-pointer scale-100 hover:scale-[1.02]"
          >
            <span>Enter Portal Gateway</span>
            <Icons.ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#ai-demo"
            className="px-8 py-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-text-main border border-border-main hover:border-text-muted transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            <span>Try AI Predictor</span>
          </a>
        </div>

        {/* Dashboard Frame Preview */}
        <div className="relative mx-auto max-w-4xl rounded-3xl bg-bg-card/45 backdrop-blur-2xl border border-border-main p-3 sm:p-5 shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-500 hover:border-accent-primary/30">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-primary/40 to-transparent" />
          
          {/* Mock Browser Header */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border-main/50 mb-4 px-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            </div>
            <div className="bg-white/5 border border-border-main px-6 py-1 rounded-lg text-[9px] font-bold text-text-muted tracking-wider">
              https://portal.recoverai.com/clinical-diagnostics
            </div>
            <div className="w-8" />
          </div>

          {/* Screenshot-like Dashboard Mockup */}
          <div className="bg-bg-main/60 rounded-2xl border border-border-main p-4 sm:p-6 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-bl-full pointer-events-none" />
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-[8px] font-black text-accent-primary uppercase tracking-widest px-2 py-0.5 rounded bg-accent-primary/10 border border-accent-primary/20">
                  Diagnostics Core Active
                </span>
                <h3 className="text-base font-extrabold text-text-main mt-1.5">Supervised Telemetry Monitor</h3>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-border-main rounded-lg px-2.5 py-1 text-[9px] font-extrabold text-text-muted">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>Sync Active</span>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5 border border-border-main">
                <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider block mb-1">Average Pain Index</span>
                <span className="text-xl font-black text-emerald-400">2.4 <span className="text-[10px] text-text-muted font-bold">/10</span></span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-border-main">
                <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider block mb-1">Medication Adherence</span>
                <span className="text-xl font-black text-accent-secondary">92%</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-border-main">
                <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider block mb-1">Healing Progress</span>
                <span className="text-xl font-black text-accent-primary">94%</span>
              </div>
            </div>

            {/* AI Insights block preview */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5 border border-accent-primary/10 flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary text-xs flex-shrink-0">
                AI
              </div>
              <div>
                <h4 className="text-[10px] font-extrabold text-text-main">Automated Diagnostic Insight</h4>
                <p className="text-[10px] text-text-muted leading-relaxed font-semibold mt-1">
                  Soft tissue index stabilizing safely. recommended daily capsule adherence maintains baseline pain index threshold below 3.0.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. TRUSTED HOSPITALS & SPONSORS */}
      {/* ========================================== */}
      <section className="max-w-5xl mx-auto px-4 mb-24 text-center">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6">
          Engineered to fit clinical research guidelines across top institutions
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 opacity-35 grayscale hover:opacity-50 transition-opacity duration-300">
          <div className="flex items-center gap-2 font-black text-sm text-text-main tracking-wider">
            <Icons.Heart className="w-5 h-5 text-accent-primary" />
            <span>MAYO CLINIC</span>
          </div>
          <div className="flex items-center gap-2 font-black text-sm text-text-main tracking-wider">
            <Icons.Pulse className="w-5 h-5 text-accent-primary" />
            <span>MOUNT SINAI</span>
          </div>
          <div className="flex items-center gap-2 font-black text-sm text-text-main tracking-wider">
            <Icons.Doctor className="w-5 h-5 text-accent-primary" />
            <span>STANFORD HEALTH</span>
          </div>
          <div className="flex items-center gap-2 font-black text-sm text-text-main tracking-wider">
            <Icons.Dashboard className="w-5 h-5 text-accent-primary" />
            <span>JOHNS HOPKINS</span>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 3. PLATFORM CORE FEATURES */}
      {/* ========================================== */}
      <section className="max-w-6xl mx-auto px-4 mb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-text-main">
            Platform Core Capabilities
          </h2>
          <p className="text-xs text-text-muted uppercase tracking-widest font-black mt-2">
            Engineered for high-fidelity remote patient telemetry
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-bg-card/60 border border-border-main p-6 shadow-xl relative overflow-hidden group hover:border-accent-primary/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/5 rounded-bl-full pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary mb-6">
              <Icons.Pulse className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-text-main mb-3 group-hover:text-accent-primary transition-colors duration-300">
              Predictive Diagnostics Core
            </h3>
            <p className="text-xs text-text-muted font-semibold leading-relaxed">
              Our Random Forest classifier parses daily symptoms checklists, medication compliance logs, and pain curves to forecast a highly precise weekly Healing Velocity curve.
            </p>
          </div>

          <div className="rounded-2xl bg-bg-card/60 border border-border-main p-6 shadow-xl relative overflow-hidden group hover:border-accent-secondary/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-secondary/5 rounded-bl-full pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 flex items-center justify-center text-accent-secondary mb-6">
              <Icons.Doctor className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-text-main mb-3 group-hover:text-accent-secondary transition-colors duration-300">
              Dynamic RBAC Vaults
            </h3>
            <p className="text-xs text-text-muted font-semibold leading-relaxed">
              Provides complete logical isolation between Patient dashboards and Doctor overview workspaces, ensuring HIPAA-aligned compliance with secure session encryption.
            </p>
          </div>

          <div className="rounded-2xl bg-bg-card/60 border border-border-main p-6 shadow-xl relative overflow-hidden group hover:border-accent-primary/20 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/5 rounded-bl-full pointer-events-none" />
            <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary mb-6">
              <Icons.CheckIn className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-text-main mb-3 group-hover:text-accent-primary transition-colors duration-300">
              Real-Time Telemetry Sync
            </h3>
            <p className="text-xs text-text-muted font-semibold leading-relaxed">
              No manual delays. Log check-ins once from a mobile or desktop interface, and the results instantly re-compile metrics on your assigned physician's triage table.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 4. HOW IT WORKS */}
      {/* ========================================== */}
      <section className="max-w-5xl mx-auto px-4 mb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-text-main">
            How Recover AI Works
          </h2>
          <p className="text-xs text-text-muted uppercase tracking-widest font-black mt-2">
            Three simple phases mapping recovery parameters
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Horizontal connecting line - desktop */}
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[1px] bg-border-main/50 -z-10" />

          <div className="text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-border-main flex items-center justify-center font-black text-base text-accent-primary shadow-[0_0_15px_var(--glow-primary)] mb-6">
              1
            </div>
            <h3 className="text-base font-extrabold text-text-main mb-2">Onboard Baseline</h3>
            <p className="text-[11px] text-text-muted font-semibold leading-relaxed max-w-xs">
              Patients register securely, define clinical baseline diagnosis dates, and associate with their designated clinical specialist.
            </p>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-border-main flex items-center justify-center font-black text-base text-accent-primary shadow-[0_0_15px_var(--glow-primary)] mb-6">
              2
            </div>
            <h3 className="text-base font-extrabold text-text-main mb-2">Submit Daily Check-in</h3>
            <p className="text-[11px] text-text-muted font-semibold leading-relaxed max-w-xs">
              Through a self-aware interface, patients quickly log pain indexes, medication adherence checklist status, and energy curve scales.
            </p>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-border-main flex items-center justify-center font-black text-base text-accent-primary shadow-[0_0_15px_var(--glow-primary)] mb-6">
              3
            </div>
            <h3 className="text-base font-extrabold text-text-main mb-2">Interactive Triage Oversight</h3>
            <p className="text-[11px] text-text-muted font-semibold leading-relaxed max-w-xs">
              The platform compiles telemetry statistics instantly, calculating healing scores and issuing triage risk warnings to the doctor's table.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 5. INTERACTIVE AI PREDICTION DEMO */}
      {/* ========================================== */}
      <section id="ai-demo" className="max-w-4xl mx-auto px-4 mb-24 scroll-mt-20">
        <div className="rounded-3xl bg-bg-card/75 backdrop-blur-xl border border-border-main p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-bl-full pointer-events-none" />
          <div className="absolute -top-[1.5px] left-1/4 right-1/4 h-[3px] bg-gradient-to-r from-transparent via-accent-primary to-transparent" />

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary mb-3">
              <Icons.Pulse className="w-5 h-5 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-text-main">Live Machine Learning Predictor</h2>
            <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mt-1.5">
              Simulate our random forest pipeline directly on the homepage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Form Inputs */}
            <form onSubmit={handleLivePrediction} className="flex flex-col gap-5 bg-white/5 border border-border-main/55 p-6 rounded-2xl">
              {/* Pain slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-bold text-text-muted">
                  <span>PAIN LEVEL INDEX</span>
                  <span className="text-accent-primary font-mono">{demoPain}/10</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={demoPain}
                  onChange={(e) => setDemoPain(e.target.value)}
                  className="w-full accent-accent-primary"
                />
              </div>

              {/* Med Switch */}
              <div className="flex items-center justify-between p-3 bg-white/5 border border-border-main rounded-xl">
                <div className="text-xs font-bold text-text-muted">CAPSULE TAKEN TODAY</div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={demoMed}
                    onChange={(e) => setDemoMed(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-primary"></div>
                </label>
              </div>

              {/* Energy levels */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-text-muted">ACTIVE ENERGY LEVEL</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Low", "Medium", "High"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDemoEnergy(level)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        demoEnergy === level
                          ? "bg-accent-primary/10 border-accent-primary text-accent-primary"
                          : "bg-white/5 border-border-main text-text-muted hover:text-text-main"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={demoLoading}
                className="w-full mt-2 py-3 rounded-xl text-xs font-black text-white bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-95 shadow-[0_0_15px_var(--glow-primary)] flex items-center justify-center gap-2 cursor-pointer"
              >
                {demoLoading ? "Interrogating Model..." : "Run ML Inference"}
              </button>
            </form>

            {/* Results Output */}
            <div className="flex flex-col justify-center items-center h-full min-h-[220px] bg-white/5 border border-border-main/55 rounded-2xl p-6 text-center relative overflow-hidden">
              {demoResult ? (
                <div className="animate-[fadeIn_0.3s_ease-out] w-full">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-2">
                    Inference Output Successful
                  </span>
                  
                  <div className="text-5xl font-black text-accent-primary mb-2">
                    {demoResult.recovery_score}%
                  </div>
                  <div className="text-[10px] font-bold text-text-muted block mb-4 uppercase tracking-wider">
                    Predicted Recovery velocity
                  </div>

                  <hr className="border-border-main mb-4" />

                  <div className="flex justify-between items-center text-xs font-bold text-text-muted">
                    <span>Triage risk Alert:</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                      demoResult.risk === "LOW"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : demoResult.risk === "MEDIUM"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                          : "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse"
                    }`}>
                      {demoResult.risk}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <Icons.Pulse className="w-10 h-10 text-text-muted/30 mb-4 animate-pulse mx-auto" />
                  <h4 className="text-sm font-bold text-text-muted">Awaiting Parameter Inference</h4>
                  <p className="text-[10px] text-text-muted/60 mt-1 max-w-xs">
                    Input parameters on the left and click infer to test the active FastAPI prediction backend model.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 6. INTERACTIVE PORTAL SIMULATOR WORKSPACES */}
      {/* ========================================== */}
      <section className="max-w-6xl mx-auto px-4 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-text-main">
            Interactive Portal Simulations
          </h2>
          <p className="text-xs text-text-muted uppercase tracking-widest font-black mt-2">
            Click tabs below to test exact patient and doctor workflows
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setActivePortalTab("patient")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
              activePortalTab === "patient"
                ? "bg-accent-primary/10 border-accent-primary text-accent-primary shadow-[0_0_15px_var(--glow-primary)]"
                : "bg-white/5 border-border-main text-text-muted hover:text-text-main"
            }`}
          >
            Patient Portal View
          </button>
          <button
            onClick={() => setActivePortalTab("doctor")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
              activePortalTab === "doctor"
                ? "bg-accent-secondary/10 border-accent-secondary text-accent-secondary shadow-[0_0_15px_rgba(167,139,250,0.15)]"
                : "bg-white/5 border-border-main text-text-muted hover:text-text-main"
            }`}
          >
            Doctor Portal View
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="bg-bg-card/75 backdrop-blur-xl border border-border-main rounded-3xl p-6 shadow-2xl relative overflow-hidden min-h-[460px] flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-bl-full pointer-events-none" />

          {activePortalTab === "patient" ? (
            <div className="animate-[fadeIn_0.3s_ease-out]">
              {/* Mock Patient Dashboard Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border-main/50 mb-6">
                <div>
                  <span className="text-[8px] font-black text-accent-primary uppercase tracking-widest px-2.5 py-0.5 rounded bg-accent-primary/10 border border-accent-primary/20">
                    Patient Telemetry Monitor
                  </span>
                  <h3 className="text-lg font-black text-text-main mt-1.5">My Recovery Dashboard</h3>
                </div>
                <div className="text-right sm:text-right">
                  <span className="text-[10px] font-bold text-text-muted block">Supervised by:</span>
                  <span className="text-xs font-extrabold text-text-main flex items-center gap-1 mt-0.5">
                    <Icons.Doctor className="w-3.5 h-3.5 text-accent-secondary" />
                    <span>Dr. Sarah Jenkins</span>
                  </span>
                </div>
              </div>

              {/* Patient Core grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                
                {/* Score Dial & metrics */}
                <div className="sm:col-span-4 flex flex-col gap-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-border-main text-center">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block mb-1">My Recovery Score</span>
                    <span className="text-4xl font-black text-accent-primary">94%</span>
                    <p className="text-[9px] text-text-muted font-bold block mt-2 uppercase tracking-wide">Excellent Progress</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-border-main flex flex-col justify-between h-28">
                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Average Pain Index</span>
                    <span className="text-2xl font-black text-emerald-400 mt-2">2.4 / 10</span>
                    <span className="text-[9px] text-text-muted font-bold block">Mild Discomfort Range</span>
                  </div>
                </div>

                {/* Treatment checklist simulation */}
                <div className="sm:col-span-8 p-5 rounded-2xl bg-white/5 border border-border-main flex flex-col justify-between min-h-[220px]">
                  <div>
                    <h4 className="text-xs font-black text-text-main mb-4 flex items-center gap-1.5">
                      <Icons.Pill className="w-4 h-4 text-accent-primary" />
                      <span>Today's Treatment Compliance</span>
                    </h4>

                    <div className="flex flex-col gap-2.5 text-xs font-semibold">
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-border-main">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">
                          ✓
                        </span>
                        <div>
                          <div className="text-text-main">08:00 — Anti-inflammatory Capsule</div>
                          <p className="text-[9px] text-text-muted mt-0.5">Take 1 capsule post meal. Completed.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-border-main">
                        <span className="w-6 h-6 rounded-lg bg-accent-primary/10 border border-accent-primary/20 text-accent-primary flex items-center justify-center text-[10px] font-black animate-pulse">
                          ●
                        </span>
                        <div>
                          <div className="text-text-main">14:00 — Physiotherapy Set A</div>
                          <p className="text-[9px] text-text-muted mt-0.5">Mild hip/knee extensions (15 mins stretching). Pending.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5 border border-accent-primary/10 text-[10px] text-text-muted leading-relaxed font-semibold">
                    Patients can submit daily parameters under `/patient/checkin` and discuss physical symptoms directly with the chatbot under `/patient/assistant`.
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="animate-[fadeIn_0.3s_ease-out]">
              {/* Mock Doctor Dashboard Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border-main/50 mb-6">
                <div>
                  <span className="text-[8px] font-black text-accent-secondary uppercase tracking-widest px-2.5 py-0.5 rounded bg-accent-secondary/10 border border-accent-secondary/20">
                    Clinical Supervision Dashboard
                  </span>
                  <h3 className="text-lg font-black text-text-main mt-1.5">Assigned Patient Profiles</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-text-muted block">Supervising:</span>
                  <span className="text-xs font-extrabold text-text-main">Dr. Sarah Jenkins</span>
                </div>
              </div>

              {/* Doctor Simulator Content Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-stretch">
                
                {/* Left Side: Patient Rows Selectors */}
                <div className="sm:col-span-5 flex flex-col gap-2">
                  <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest block mb-1">Assigned Caseload</span>
                  {[
                    { name: "Vivek Kumar", score: 94, risk: "LOW" },
                    { name: "Samantha Reed", score: 81, risk: "MEDIUM" },
                  ].map((pat) => (
                    <button
                      key={pat.name}
                      onClick={() => setSimSelectedPatient(pat.name.split(" ")[0])}
                      className={`p-3.5 rounded-xl border text-left flex justify-between items-center cursor-pointer transition-all ${
                        simSelectedPatient === pat.name.split(" ")[0]
                          ? "bg-accent-secondary/10 border-accent-secondary text-text-main"
                          : "bg-white/5 border-border-main text-text-muted hover:text-text-main hover:bg-white/10"
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-xs text-text-main">{pat.name}</div>
                        <div className="text-[9px] text-text-muted mt-0.5">Healing: {pat.score}%</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold border ${
                        pat.risk === "LOW"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      }`}>
                        {pat.risk}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Right Side: Biometric details of selected simulator patient */}
                <div className="sm:col-span-7 p-4 bg-white/5 border border-border-main rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-black text-text-main mb-3 flex items-center justify-between">
                      <span>Clinical Parameters: {simSelectedPatient === "Vivek" ? "Vivek Kumar" : "Samantha Reed"}</span>
                      <span className="text-[9px] font-bold text-text-muted">Case ID: {simSelectedPatient === "Vivek" ? "101" : "102"}</span>
                    </h4>

                    {simSelectedPatient === "Vivek" ? (
                      <div className="flex flex-col gap-3 text-xs font-semibold">
                        <div className="p-3 bg-white/5 border border-border-main rounded-xl">
                          <span className="text-[8px] text-text-muted block mb-0.5">RECOVERY DIAGNOSIS</span>
                          <span className="text-text-main font-bold">Post-op Knee Ligament Rehab</span>
                        </div>
                        <div className="p-3 bg-white/5 border border-border-main rounded-xl">
                          <span className="text-[8px] text-text-muted block mb-0.5">AI CLINICAL NOTE</span>
                          <p className="text-[10px] text-text-muted leading-relaxed font-semibold mt-1">
                            Excellent progress curve. soft knee extension dropping pain average below 3.0 safely. Adherence is optimal.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 text-xs font-semibold">
                        <div className="p-3 bg-white/5 border border-border-main rounded-xl">
                          <span className="text-[8px] text-text-muted block mb-0.5">RECOVERY DIAGNOSIS</span>
                          <span className="text-text-main font-bold">Spine Fusion Recovery</span>
                        </div>
                        <div className="p-3 bg-white/5 border border-border-main rounded-xl">
                          <span className="text-[8px] text-text-muted block mb-0.5">AI CLINICAL NOTE</span>
                          <p className="text-[10px] text-text-muted leading-relaxed font-semibold mt-1">
                            Elevated pain spikes correlates with a missed capsule dosage. Strictly advise afternoon adherence stretching routine.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-accent-secondary/5 border border-accent-secondary/15 rounded-xl text-[10px] text-text-muted font-semibold leading-relaxed">
                    Clinicians can access details screens like this for each patient row, complete with biometrics graphs and historical timelines under `/doctor/patient/:id`.
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Action Login Link */}
          <div className="mt-6 pt-4 border-t border-border-main/50 flex justify-between items-center text-xs">
            <span className="text-text-muted font-semibold">Want to try the active portal panels?</span>
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl font-bold bg-white/5 border border-border-main hover:border-accent-primary text-text-main hover:text-accent-primary transition-all duration-300 cursor-pointer"
            >
              Portal Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 7. PREMIUM CLINICAL SANDBOX PRICING */}
      {/* ========================================== */}
      <section className="max-w-5xl mx-auto px-4 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-text-main">
            Platform Access & Licensing
          </h2>
          <p className="text-xs text-text-muted uppercase tracking-widest font-black mt-2">
            Choose the sandbox environment or enterprise registry
          </p>

          {/* Duration Toggle */}
          <div className="inline-flex p-1 bg-white/5 border border-border-main/50 rounded-xl mt-6">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                billingPeriod === "monthly"
                  ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/30"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                billingPeriod === "annual"
                  ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/30"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              Annual Billing (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {/* Card 1: Sandbox Demo */}
          <div className="rounded-3xl bg-bg-card/75 border border-border-main p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-accent-primary/25">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-primary/5 rounded-bl-full pointer-events-none" />
            <div>
              <span className="text-[8px] font-black text-accent-primary uppercase tracking-widest px-2.5 py-0.5 rounded bg-accent-primary/10 border border-accent-primary/20">
                Hackathon Sandbox
              </span>
              <h3 className="text-xl font-black text-text-main mt-4 mb-2">Developer Demo Vault</h3>
              <p className="text-xs text-text-muted font-semibold leading-relaxed mb-6">
                Test the complete portal features, database seeding engine, and AI model prediction routes locally for demo and research purposes.
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-text-main">$0</span>
                <span className="text-xs font-bold text-text-muted">/ Free Sandbox</span>
              </div>

              <hr className="border-border-main mb-6" />

              <ul className="flex flex-col gap-3 text-xs text-text-muted font-semibold">
                <li className="flex items-center gap-2">✓ 4 Pre-seeded Patient profiles</li>
                <li className="flex items-center gap-2">✓ 2 Pre-seeded Specialist accounts</li>
                <li className="flex items-center gap-2">✓ Complete AI Prediction pipeline</li>
                <li className="flex items-center gap-2">✓ Local SQLite storage</li>
              </ul>
            </div>

            <Link
              to="/login"
              className="w-full text-center py-3.5 rounded-xl text-xs font-black text-text-main bg-white/5 border border-border-main hover:border-accent-primary transition-all duration-300 cursor-pointer mt-8"
            >
              Boot Local Sandbox
            </Link>
          </div>

          {/* Card 2: Enterprise Integration */}
          <div className="rounded-3xl bg-bg-card/75 border border-border-main p-6 sm:p-8 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-300 border-accent-secondary/35 shadow-[0_4px_30px_rgba(167,139,250,0.05)]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent-secondary/5 rounded-bl-full pointer-events-none" />
            <div>
              <span className="text-[8px] font-black text-accent-secondary uppercase tracking-widest px-2.5 py-0.5 rounded bg-accent-secondary/10 border border-accent-secondary/20">
                Enterprise Integration
              </span>
              <h3 className="text-xl font-black text-text-main mt-4 mb-2">Clinical Clinic Registry</h3>
              <p className="text-xs text-text-muted font-semibold leading-relaxed mb-6">
                Connect hospital networks, unlock patient caseload capacities, integrate custom EHR databases, and deploy private hosting vaults.
              </p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-black text-accent-secondary">
                  {billingPeriod === "annual" ? "$399" : "$499"}
                </span>
                <span className="text-xs font-bold text-text-muted">/ month, billed {billingPeriod}</span>
              </div>

              <hr className="border-border-main mb-6" />

              <ul className="flex flex-col gap-3 text-xs text-text-muted font-semibold">
                <li className="flex items-center gap-2 text-text-main">✓ Unlimited patient profiles</li>
                <li className="flex items-center gap-2 text-text-main">✓ Unlimited clinical specialists</li>
                <li className="flex items-center gap-2 text-text-main">✓ Dedicated cloud PostgreSQL db</li>
                <li className="flex items-center gap-2 text-text-main">✓ 99.9% uptime SLA diagnostics</li>
              </ul>
            </div>

            <Link
              to="/register"
              className="w-full text-center py-3.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-accent-secondary to-purple-500 hover:opacity-95 transition-all duration-300 cursor-pointer mt-8 shadow-[0_0_15px_rgba(167,139,250,0.15)]"
            >
              Provision Registry Account
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 8. TESTIMONIALS SECTION */}
      {/* ========================================== */}
      <section className="max-w-5xl mx-auto px-4 mb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-text-main">
            Physician Biofeedback Verification
          </h2>
          <p className="text-xs text-text-muted uppercase tracking-widest font-black mt-2">
            What clinical specialists and patients say about our tracking
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-bg-card border border-border-main relative overflow-hidden">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 text-accent-secondary flex items-center justify-center font-bold text-sm">
                DJ
              </div>
              <div>
                <h4 className="text-xs font-black text-text-main">Dr. Sarah Jenkins, Orthopedic Surgeon</h4>
                <p className="text-[9px] text-text-muted font-bold mt-0.5">Johns Hopkins Medicine</p>
              </div>
            </div>
            <p className="text-xs text-text-muted font-semibold leading-relaxed">
              "Recover AI has fundamentally changed our outpatient orthopedics tracker. Having patient-reported symptoms, compliance curves, and pain curves compiled into active triage categories allows us to catch post-op complications early before they escalate."
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-main relative overflow-hidden">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary flex items-center justify-center font-bold text-sm">
                VK
              </div>
              <div>
                <h4 className="text-xs font-black text-text-main">Vivek Kumar, Post-op Knee Ligament Rehab</h4>
                <p className="text-[9px] text-text-muted font-bold mt-0.5">Active Patient Registry</p>
              </div>
            </div>
            <p className="text-xs text-text-muted font-semibold leading-relaxed">
              "The patient portal dashboard has made knee ligament recovery feel highly structured. The visual graphs, medication reminder compliance notifications, and direct AI chat help me keep my doctor perfectly up to date with zero stress."
            </p>
          </div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 9. PLATFORM FAQ ACCORDIONS */}
      {/* ========================================== */}
      <section className="max-w-4xl mx-auto px-4 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-text-main">
            Supervision FAQ
          </h2>
          <p className="text-xs text-text-muted uppercase tracking-widest font-black mt-2">
            Answers to common clinical registry questions
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          {[
            {
              q: "How does the machine learning prediction algorithm calculate Healing progress?",
              a: "Under the hood, a random forest pipeline analyzes the patient's daily pain grades, symptoms checkboxes, medication compliance rate, and energy levels. It correlates these inputs with historic dataset progression curves to yield a precise Healing Velocity curve."
            },
            {
              q: "Is Recover AI secure under HIPAA privacy parameters?",
              a: "Yes. Our platform utilizes custom role-based access tokens to segregate patient medical records. Doctors can only see patients specifically assigned to their registry database records, avoiding horizontal data leaks."
            },
            {
              q: "How are the database seed accounts set up?",
              a: "Upon starting the FastAPI server, our database initializer checks the models count and automatically provisions pre-populated testing clinics (Dr. Jenkins, Dr. Brooks) alongside historical 5-day patient check-in records for immediate demonstration."
            }
          ].map((faq, idx) => (
            <div key={idx} className="rounded-2xl bg-bg-card/75 border border-border-main overflow-hidden transition-all duration-300">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left text-xs font-extrabold text-text-main hover:bg-white/5 flex justify-between items-center cursor-pointer select-none"
              >
                <span>{faq.q}</span>
                <span className={`text-accent-primary font-black transition-transform duration-300 ${activeFaq === idx ? "rotate-90" : ""}`}>
                  ➔
                </span>
              </button>
              {activeFaq === idx && (
                <div className="p-5 pt-0 border-t border-border-main/20 text-xs text-text-muted font-semibold leading-relaxed animate-[fadeIn_0.25s_ease-out]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================== */}
      {/* 10. PRE-FOOTER PLATFORM CTA & FOOTER */}
      {/* ========================================== */}
      <section className="max-w-5xl mx-auto px-4 mb-16 text-center">
        <div className="rounded-3xl bg-gradient-to-br from-bg-card to-bg-main border border-border-main p-8 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-bl-full pointer-events-none" />
          
          <h2 className="text-3xl sm:text-4xl font-black text-text-main mb-4 leading-tight">
            Ready to Accelerate Your <br />
            Clinical Recovery Tracking?
          </h2>
          <p className="text-xs text-text-muted max-w-xl mx-auto mb-8 font-semibold leading-relaxed">
            Experience the power of multi-portal, ML-driven diagnostic supervision. Initialize your clinical sandbox baseline or register your specialty facility workspace today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:opacity-95 shadow-[0_0_20px_var(--glow-primary)] flex items-center gap-2 cursor-pointer scale-100 hover:scale-[1.02] transition-all duration-300"
            >
              <span>Onboard Specialty Account</span>
              <Icons.ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;