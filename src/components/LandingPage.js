import { useState } from "react";
import { ThemeProvider, useTheme, fontY2K, fontBody } from "./ThemeContext";
import { Icons } from "./Icons";

function LandingPageInner({ onAuth, error }) {
  const { t, theme, toggleTheme } = useTheme();

  const features = [
    { icon: Icons.Zap, title: "Automated Checkout", desc: "Lightning-fast automated purchasing across Walmart, Target, Pokemon Center, and more." },
    { icon: Icons.Tracking, title: "Real-Time Tracking", desc: "Every order tracked from purchase to delivery with carrier integration and Discord alerts." },
    { icon: Icons.Shield, title: "Managed Service", desc: "Full-service checkout operation. We handle the accounts, you get the product." },
    { icon: Icons.Globe, title: "Multi-Retailer", desc: "Walmart, Target, Sam's Club, Pokemon Center, Best Buy, Amazon, and expanding." },
    { icon: Icons.Insights, title: "Analytics Dashboard", desc: "Track spend, fulfillment rates, top products, and ROI across all your orders." },
    { icon: Icons.Box, title: "Drop Calendar", desc: "Scheduled drops with slot reservations. Sign up for the products you want, we do the rest." },
  ];

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", background: t.bg, color: t.text, fontFamily: fontBody, transition: "background 0.3s, color 0.3s" }}>
      <div style={{ position: "fixed", inset: 0, background: t.landingHeroBg, pointerEvents: "none" }} />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", backgroundImage: `linear-gradient(${t.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${t.gridLine} 1px, transparent 1px)`, backgroundSize: "60px 60px", opacity: 0.5 }} />

      {/* NAV */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 40px", background: t.navBg, backdropFilter: "blur(20px)", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: t.logoGrad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontFamily: fontY2K, fontWeight: 800, color: t.logoText }}>LF</div>
          <span style={{ fontSize: 16, fontFamily: fontY2K, fontWeight: 700, color: t.textPrimary, letterSpacing: 2 }}>LIVEFAST</span>
          <span style={{ fontSize: 10, fontFamily: fontY2K, color: t.textSecondary, letterSpacing: 3, marginLeft: -4 }}>ACO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={toggleTheme} style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", color: t.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {theme === "dark" ? <Icons.Sun /> : <Icons.Moon />}
          </button>
          <button onClick={onAuth} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: t.accent, color: theme === "dark" ? "#000" : "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: fontBody, display: "flex", alignItems: "center", gap: 8 }}>
            <Icons.Discord /> Connect with Discord
          </button>
        </div>
      </nav>

      {/* ERROR BANNER */}
      {error && (
        <div style={{ position: "fixed", top: 68, left: 0, right: 0, zIndex: 40, padding: "12px 40px", background: t.redBg, borderBottom: `1px solid ${t.red}30`, textAlign: "center", fontSize: 13, color: t.red, fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px", position: "relative" }}>
        <div style={{ animation: "fadeUp 0.8s ease both", marginBottom: 24 }}>
          <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: 20, border: `1px solid ${t.border}`, background: t.bgElevated, fontSize: 11, fontFamily: fontY2K, letterSpacing: 2, color: t.textSecondary, textTransform: "uppercase", marginBottom: 32 }}>
            Automated Checkout Services
          </div>
        </div>
        <h1 style={{ fontSize: "clamp(40px, 8vw, 88px)", fontWeight: 900, fontFamily: fontY2K, color: t.textPrimary, letterSpacing: 2, lineHeight: 1.05, animation: "fadeUp 0.8s ease 0.1s both", maxWidth: 900 }}>
          ORDER.<br /><span style={{ opacity: 0.6 }}>CHECKOUT.</span><br />
          <span style={{ background: theme === "dark" ? "linear-gradient(135deg, #fff 0%, #666 100%)" : "linear-gradient(135deg, #000 0%, #666 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>DELIVER.</span>
        </h1>
        <p style={{ fontSize: 17, color: t.textSecondary, maxWidth: 520, lineHeight: 1.7, margin: "32px auto", animation: "fadeUp 0.8s ease 0.2s both" }}>
          LIVEFAST ACO connects to your favorite retailers and automates checkout for Pokemon TCG, sports cards, and collectibles. Real-time tracking, Discord alerts, and full analytics.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", animation: "fadeUp 0.8s ease 0.3s both" }}>
          <button onClick={onAuth} style={{ padding: "14px 32px", borderRadius: 12, border: "none", background: t.accent, color: theme === "dark" ? "#000" : "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: fontBody, display: "flex", alignItems: "center", gap: 10 }}>
            <Icons.Discord /> Get Started
          </button>
          <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} style={{ padding: "14px 32px", borderRadius: 12, border: `1px solid ${t.border}`, background: "transparent", color: t.textSecondary, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: fontBody, display: "flex", alignItems: "center", gap: 8 }}>
            See How It Works <Icons.Arrow />
          </button>
        </div>
        <div style={{ display: "flex", gap: 48, justifyContent: "center", marginTop: 80, animation: "fadeUp 0.8s ease 0.5s both", flexWrap: "wrap" }}>
          {[["$69K+","Order Value Tracked"],["1,000+","Orders Placed"],["12+","Retailers Supported"],["99%","Success Rate"]].map(([v,l],i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, fontWeight: 800, fontFamily: fontY2K, color: t.textPrimary }}>{v}</div>
              <div style={{ fontSize: 11, fontFamily: fontY2K, letterSpacing: 2, color: t.textTertiary, textTransform: "uppercase", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "80px 40px 100px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ fontSize: 10, fontFamily: fontY2K, letterSpacing: 3, color: t.textTertiary, textTransform: "uppercase", marginBottom: 16 }}>What We Do</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, fontFamily: fontY2K, color: t.textPrimary, letterSpacing: 1 }}>Full-Service ACO</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {features.map((f,i) => (<div key={i} style={{ padding: "28px 24px", borderRadius: 16, border: `1px solid ${t.border}`, background: t.bgCard }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: t.featureIcon, display: "flex", alignItems: "center", justifyContent: "center", color: t.textSecondary, marginBottom: 16 }}><f.icon /></div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: 13, color: t.textSecondary, lineHeight: 1.6 }}>{f.desc}</p>
          </div>))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "80px 40px 100px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{ fontSize: 10, fontFamily: fontY2K, letterSpacing: 3, color: t.textTertiary, textTransform: "uppercase", marginBottom: 16 }}>Process</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, fontFamily: fontY2K, color: t.textPrimary, letterSpacing: 1 }}>How It Works</h2>
        </div>
        {[["01","Connect via Discord","Join the LIVEFAST ACO Discord and verify your membership to access the dashboard."],
          ["02","Browse Upcoming Drops","Check the calendar for scheduled drops across Walmart, Target, Pokemon Center, and more."],
          ["03","Sign Up for Slots","Reserve your spot on drops you want. Pick the products, we handle the checkout."],
          ["04","Track Everything","Watch your orders flow through the dashboard with real-time tracking, analytics, and Discord notifications."],
        ].map(([step,title,desc],i) => (
          <div key={i} style={{ display: "flex", gap: 24, alignItems: "flex-start", padding: "24px 0", borderBottom: i < 3 ? `1px solid ${t.border}` : "none" }}>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: fontY2K, color: t.textTertiary, minWidth: 60 }}>{step}</div>
            <div><h3 style={{ fontSize: 18, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>{title}</h3>
            <p style={{ fontSize: 14, color: t.textSecondary, lineHeight: 1.6 }}>{desc}</p></div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 40px", textAlign: "center", borderTop: `1px solid ${t.border}` }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: fontY2K, color: t.textPrimary, marginBottom: 16, letterSpacing: 1 }}>Ready to Go?</h2>
        <p style={{ fontSize: 15, color: t.textSecondary, marginBottom: 32 }}>Connect your Discord to get started.</p>
        <button onClick={onAuth} style={{ padding: "16px 40px", borderRadius: 12, border: "none", background: t.accent, color: theme === "dark" ? "#000" : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: fontY2K, letterSpacing: 1, display: "inline-flex", alignItems: "center", gap: 10 }}>
          <Icons.Discord /> CONNECT WITH DISCORD
        </button>
        <div style={{ fontSize: 11, color: t.textTertiary, marginTop: 16, fontFamily: fontY2K, letterSpacing: 2 }}>LIVEFAST ACO</div>
      </section>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        button { font-family: inherit; }
      `}</style>
    </div>
  );
}

export default function LandingPage(props) {
  return <ThemeProvider><LandingPageInner {...props} /></ThemeProvider>;
}
