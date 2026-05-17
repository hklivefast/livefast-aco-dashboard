import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();
export function useTheme() { return useContext(ThemeContext); }

export const themes = {
  dark: {
    bg: "#0a0a0a", bgAlt: "#0f0f0f", bgCard: "rgba(255,255,255,0.02)", bgCardHover: "rgba(255,255,255,0.04)",
    bgElevated: "rgba(255,255,255,0.03)", bgInput: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.06)", borderActive: "rgba(255,255,255,0.2)",
    text: "#e5e5e5", textPrimary: "#fff", textSecondary: "rgba(255,255,255,0.4)", textTertiary: "rgba(255,255,255,0.25)",
    accent: "#fff", accentBg: "rgba(255,255,255,0.1)",
    heroGrad: "linear-gradient(135deg, #1a1a1a 0%, #111 40%, #0f0f0f 100%)",
    heroLine: "rgba(255,255,255,0.15)", gridLine: "rgba(255,255,255,0.03)", scanline: "rgba(255,255,255,0.008)",
    shadow: "0 20px 60px rgba(0,0,0,0.5)",
    green: "#4ade80", greenBg: "rgba(74,222,128,0.1)", cyan: "#22d3ee", cyanBg: "rgba(34,211,238,0.1)",
    red: "#f87171", redBg: "rgba(248,113,113,0.1)", yellow: "#fbbf24", yellowBg: "rgba(251,191,36,0.1)",
    blue: "#60a5fa", blueBg: "rgba(96,165,250,0.1)",
    scrollThumb: "rgba(255,255,255,0.1)", toggleBg: "rgba(255,255,255,0.1)",
    sidebarActive: "rgba(255,255,255,0.1)", sidebarIndicator: "#fff",
    logoGrad: "linear-gradient(135deg, #fff 0%, #999 100%)", logoText: "#000",
    overlayBg: "rgba(0,0,0,0.7)", modalBg: "#141414",
    navBg: "rgba(10,10,10,0.85)", landingHeroBg: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 70%)",
    featureIcon: "rgba(255,255,255,0.06)", badgeBg: "rgba(255,255,255,0.06)",
  },
  light: {
    bg: "#f5f5f0", bgAlt: "#eeeee8", bgCard: "rgba(0,0,0,0.02)", bgCardHover: "rgba(0,0,0,0.04)",
    bgElevated: "rgba(0,0,0,0.03)", bgInput: "rgba(0,0,0,0.04)",
    border: "rgba(0,0,0,0.08)", borderActive: "rgba(0,0,0,0.25)",
    text: "#2a2a2a", textPrimary: "#0a0a0a", textSecondary: "rgba(0,0,0,0.45)", textTertiary: "rgba(0,0,0,0.25)",
    accent: "#0a0a0a", accentBg: "rgba(0,0,0,0.08)",
    heroGrad: "linear-gradient(135deg, #e8e8e2 0%, #ddddd6 40%, #d5d5ce 100%)",
    heroLine: "rgba(0,0,0,0.1)", gridLine: "rgba(0,0,0,0.04)", scanline: "rgba(0,0,0,0.006)",
    shadow: "0 20px 60px rgba(0,0,0,0.08)",
    green: "#16a34a", greenBg: "rgba(22,163,74,0.1)", cyan: "#0891b2", cyanBg: "rgba(8,145,178,0.1)",
    red: "#dc2626", redBg: "rgba(220,38,38,0.1)", yellow: "#ca8a04", yellowBg: "rgba(202,138,4,0.1)",
    blue: "#2563eb", blueBg: "rgba(37,99,235,0.1)",
    scrollThumb: "rgba(0,0,0,0.12)", toggleBg: "rgba(0,0,0,0.1)",
    sidebarActive: "rgba(0,0,0,0.06)", sidebarIndicator: "#0a0a0a",
    logoGrad: "linear-gradient(135deg, #0a0a0a 0%, #444 100%)", logoText: "#fff",
    overlayBg: "rgba(0,0,0,0.4)", modalBg: "#fff",
    navBg: "rgba(245,245,240,0.9)", landingHeroBg: "radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.03) 0%, transparent 70%)",
    featureIcon: "rgba(0,0,0,0.05)", badgeBg: "rgba(0,0,0,0.05)",
  },
};

export const fontY2K = `'Orbitron', sans-serif`;
export const fontBody = `'Outfit', 'DM Sans', sans-serif`;
export const fontMono = `'JetBrains Mono', 'SF Mono', monospace`;

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const t = themes[theme];
  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));

  // Persist theme preference
  useEffect(() => {
    const saved = localStorage.getItem("lf-theme");
    if (saved) setTheme(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("lf-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ t, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
