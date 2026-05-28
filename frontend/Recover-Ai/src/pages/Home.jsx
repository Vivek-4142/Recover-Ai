import React from "react";
import { Link } from "react-router-dom";
import { Icons } from "../components/Icons";

function Home() {
  const cards = [
    {
      title: "Patient Onboarding",
      desc: "Register a new patient profile, detail clinical parameters, assign recovery dates and supervising physicians.",
      path: "/onboarding",
      btnText: "Launch Wizard",
      icon: Icons.Onboarding,
      color: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30 hover:border-cyan-400",
      accent: "bg-cyan-500",
    },
    {
      title: "Daily Check-In",
      desc: " empathetic portal for patients to log active pain index, visual symptom patterns, energy curves, and pill logs.",
      path: "/checkin",
      btnText: "Log Health Entry",
      icon: Icons.CheckIn,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30 hover:border-emerald-400",
      accent: "bg-emerald-500",
    },
    {
      title: "Clinical Dashboard",
      desc: "Track healing velocities, chart historical pain timelines with SVG charts, review AI insights, and verify doctor flags.",
      path: "/dashboard",
      btnText: "Open Diagnostics",
      icon: Icons.Dashboard,
      color: "from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30 hover:border-violet-400",
      accent: "bg-violet-500",
    },
  ];

  return (
    <div className="relative overflow-hidden py-4 sm:py-8 lg:py-12">
      
      {/* Background ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-accent-primary/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-accent-secondary/5 blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-16 px-4">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-primary/10 border border-accent-primary/30 text-xs font-semibold text-accent-primary mb-6 animate-pulse">
          <Icons.Pulse className="w-3.5 h-3.5" />
          <span>V2.0 AI-Core Integration Ready</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
          Recovery, Accelerated by{" "}
          <span className="bg-gradient-to-r from-accent-primary via-cyan-400 to-accent-secondary bg-clip-text text-transparent">
            Intelligence.
          </span>
        </h1>

        {/* Hero Description */}
        <p className="text-base sm:text-lg text-text-muted max-w-2xl mx-auto mb-8 font-medium">
          A state-of-the-art clinical tracking ecosystem integrating empathetic patient interfaces, comprehensive logging wizardry, and proactive physician alerting algorithms.
        </p>

        {/* Action button */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary text-white hover:opacity-90 transition-all duration-300 shadow-[0_4px_20px_rgba(34,211,238,0.25)] flex items-center gap-2 cursor-pointer"
          >
            <span>Open Dashboard</span>
            <Icons.ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/checkin"
            className="px-6 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-text-main border border-border-main hover:border-text-muted transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            <span>Patient Check-In</span>
          </Link>
        </div>
      </div>

      {/* Control Deck Grid */}
      <div className="max-w-6xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold text-center mb-10 text-text-main">
          Platform Control Deck
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {cards.map((card, i) => {
            const CardIcon = card.icon;
            return (
              <div
                key={i}
                className={`group relative rounded-2xl bg-bg-card border p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)] ${card.color}`}
              >
                <div>
                  {/* Floating light point */}
                  <div className={`absolute top-6 right-6 w-8 h-8 rounded-lg ${card.color} flex items-center justify-center border border-current`}>
                    <CardIcon className="w-5 h-5" />
                  </div>

                  <h3 className="text-xl font-extrabold text-text-main mb-3.5 group-hover:text-accent-primary transition-colors duration-300">
                    {card.title}
                  </h3>
                  
                  <p className="text-sm text-text-muted font-medium mb-8 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <Link
                  to={card.path}
                  className={`w-full text-center py-2.5 rounded-xl text-sm font-bold text-text-main border border-border-main bg-white/5 hover:bg-white/10 group-hover:border-accent-primary/50 transition-all duration-300 cursor-pointer`}
                >
                  {card.btnText}
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Counter Section */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="rounded-3xl bg-bg-card border border-border-main p-8 md:p-12 relative overflow-hidden shadow-xl">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center relative z-10">
            <div>
              <div className="text-4xl font-extrabold text-accent-primary mb-1">
                14,200+
              </div>
              <div className="text-xs font-semibold tracking-wider text-text-muted uppercase">
                Patients Tracked
              </div>
            </div>
            <div className="border-y sm:border-y-0 sm:border-x border-border-main py-4 sm:py-0">
              <div className="text-4xl font-extrabold text-accent-primary mb-1">
                99.4%
              </div>
              <div className="text-xs font-semibold tracking-wider text-text-muted uppercase">
                Adherence Rate
              </div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-accent-primary mb-1">
                40+
              </div>
              <div className="text-xs font-semibold tracking-wider text-text-muted uppercase">
                Hospitals Connected
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;