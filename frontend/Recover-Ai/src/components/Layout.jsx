import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icons } from "./Icons";

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("recover-ai-user")) || null;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("recover-ai-theme") || "sapphire";
  });

  useEffect(() => {
    const syncUser = () => {
      setUser(JSON.parse(localStorage.getItem("recover-ai-user")) || null);
    };
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "emerald") {
      root.classList.add("theme-emerald");
    } else {
      root.classList.remove("theme-emerald");
    }
    localStorage.setItem("recover-ai-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "sapphire" ? "emerald" : "sapphire"));
  };

  const handleLogout = () => {
    localStorage.removeItem("recover-ai-user");
    setUser(null);
    navigate("/login");
  };

  // Dynamic Navigation Items based on role
  const navItems = [];
  if (user) {
    if (user.role === "doctor") {
      navItems.push(
        { name: "Doctor Dashboard", path: "/doctor/dashboard", icon: Icons.Dashboard }
      );
    } else if (user.role === "patient") {
      navItems.push(
        { name: "My Dashboard", path: "/patient/dashboard", icon: Icons.Dashboard },
        { name: "Daily Check-In", path: "/patient/checkin", icon: Icons.CheckIn },
        { name: "AI Assistant", path: "/patient/assistant", icon: Icons.Pulse }
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-main text-text-main transition-colors duration-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-bg-card border-b border-border-main shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/30 group-hover:border-accent-primary/60 transition-all duration-300">
                <Icons.Heart className="w-5 h-5 text-accent-primary animate-pulse" />
                <div className="absolute inset-0 rounded-xl bg-accent-primary/5 blur-sm group-hover:blur-md transition-all duration-300" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                  RECOVER
                </span>
                <span className="text-xs font-semibold block text-text-muted -mt-1 tracking-wider uppercase">
                  AI Companion
                </span>
              </div>
            </Link>

            {/* Navigation links - Desktop */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? "bg-accent-primary/10 text-accent-primary border border-accent-primary/20 shadow-[0_0_15px_rgba(34,211,238,0.05)]"
                        : "text-text-muted hover:text-text-main hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Action Bar */}
            <div className="flex items-center gap-3">
              {/* User Identity Display */}
              {user ? (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-border-main text-xs font-semibold text-text-main">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{user.name}</span>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ml-1 border ${
                    user.role === "doctor"
                      ? "bg-accent-secondary/10 border-accent-secondary/30 text-accent-secondary"
                      : "bg-accent-primary/10 border-accent-primary/30 text-accent-primary"
                  }`}>
                    {user.role}
                  </span>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-accent-primary to-accent-secondary hover:opacity-95 transition-all duration-300 shadow-[0_2px_12px_rgba(34,211,238,0.15)] flex items-center gap-1.5 cursor-pointer"
                >
                  <Icons.Doctor className="w-3.5 h-3.5" />
                  <span>Login / Register</span>
                </Link>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle Theme"
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-border-main text-text-muted hover:text-text-main hover:bg-white/10 transition-all duration-300 cursor-pointer"
              >
                {theme === "sapphire" ? (
                  <Icons.Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Icons.Moon className="w-5 h-5 text-indigo-500" />
                )}
              </button>

              {/* Logout Button */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:text-white hover:bg-red-500 transition-all duration-300 font-bold text-xs cursor-pointer"
                >
                  <Icons.ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-[fadeIn_0.5s_ease-out]">
        {children}
      </main>

      {/* Navigation - Mobile Bottom Bar */}
      {navItems.length > 0 && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-lg bg-bg-card/90 border-t border-border-main flex items-center justify-around py-3 px-2 shadow-[0_-5px_20px_rgba(0,0,0,0.15)]">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition-all duration-300 ${
                  isActive
                    ? "text-accent-primary"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name.split(" ")[0]}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Extra spacing for mobile navigation spacer */}
      {navItems.length > 0 && <div className="h-16 md:hidden" />}

      {/* Footer */}
      <footer className="w-full py-6 border-t border-border-main text-center text-xs text-text-muted bg-bg-main">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} Recover AI. Empowering recovery with intelligent diagnostics.</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;;
