import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────── ICONS ─────────────────────────── */
const Icon = ({ d, size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>{typeof d === "string" ? <path d={d} /> : d}</svg>
);

const Icons = {
  bolt: <Icon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />,
  shield: <Icon d={<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>} />,
  mail: <Icon d={<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>} />,
  target: <Icon d={<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>} />,
  cart: <Icon d={<><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></>} />,
  check: <Icon d="M20 6L9 17l-5-5" />,
  chevron: <Icon d="M9 18l6-6-6-6" size={16} />,
  star: <Icon d={<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" /></>} size={14} />,
  discord: <Icon size={18} d={<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" fill="currentColor" stroke="none" />} />,
  menu: <Icon d={<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>} />,
  close: <Icon d={<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>} />,
  link: <Icon d={<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>} />,
  inbox: <Icon d={<><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>} />,
  scan: <Icon d={<><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="7" y1="12" x2="17" y2="12" /></>} />,
  package: <Icon d={<><path d="M16.5 9.4l-9-5.19" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>} />,
  users: <Icon d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>} />,
  trophy: <Icon d={<><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 22V8a4 4 0 0 1 4 0v14" /><rect x="6" y="2" width="12" height="7" rx="1" /></>} />,
  zap: <Icon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" size={16} />,
  arrow: <Icon d={<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>} size={16} />,
  settings: <Icon d={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>} />,
};

/* ─────────────── ANIMATED NUMBER ─────────────── */
function AnimNum({ to, dur = 2000, prefix = "", suffix = "" }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          setV(Math.floor(ease * to));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, dur]);
  return <span ref={ref}>{prefix}{v.toLocaleString()}{suffix}</span>;
}

/* ─────────────── FADE IN ON SCROLL ─────────────── */
function FadeIn({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(30px)", transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s` }}>
      {children}
    </div>
  );
}

/* ─────────────── PRODUCT CARD MARQUEE ─────────────── */
const products = [
  { name: "Prismatic Evolutions ETB", tag: "Pokemon" },
  { name: "Surging Sparks BB", tag: "Pokemon" },
  { name: "Shrouded Fable ETB", tag: "Pokemon" },
  { name: "Paldean Fates ETB", tag: "Pokemon" },
  { name: "151 Ultra Premium", tag: "Pokemon" },
  { name: "Crown Zenith ETB", tag: "Pokemon" },
  { name: "Obsidian Flames BB", tag: "Pokemon" },
  { name: "Scarlet & Violet ETB", tag: "Pokemon" },
  { name: "Temporal Forces BB", tag: "Pokemon" },
  { name: "Twilight Masquerade", tag: "Pokemon" },
  { name: "Lost Origin BB", tag: "Pokemon" },
  { name: "Astral Radiance ETB", tag: "Pokemon" },
];

function Marquee() {
  const doubled = [...products, ...products];
  return (
    <div style={{ overflow: "hidden", width: "100%", padding: "12px 0" }}>
      <div style={{ display: "flex", gap: 16, animation: "marquee 40s linear infinite", width: "max-content" }}>
        {doubled.map((p, i) => (
          <div key={i} style={{
            flexShrink: 0, width: 140, height: 80,
            background: "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)",
            border: "1px solid #2a2a2a", borderRadius: 10,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "8px 10px", textAlign: "center"
          }}>
            <span style={{ fontSize: 9, color: "#c0c0c0", fontFamily: "'Space Mono',monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{p.tag}</span>
            <span style={{ fontSize: 11, color: "#888", fontWeight: 500, lineHeight: 1.3 }}>{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   NAVBAR
   ══════════════════════════════════════════════════════════ */
function Navbar({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
    { label: "Home", id: "home" },
    { label: "Services", id: "home", scroll: "services" },
    { label: "Order Scraper", id: "scraper" },
    { label: "Member Signup", id: "signup" },
    { label: "Contact", id: "home", scroll: "contact" },
  ];
  const go = (id, scroll) => {
    setPage(id);
    setMobileOpen(false);
    if (scroll) setTimeout(() => { document.getElementById(scroll)?.scrollIntoView({ behavior: "smooth" }); }, 100);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? "rgba(10,10,10,0.92)" : "rgba(10,10,10,0.6)",
      backdropFilter: "blur(20px)", borderBottom: scrolled ? "1px solid #1a1a1a" : "1px solid transparent",
      transition: "all 0.3s ease"
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <button onClick={() => go("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #c0c0c0, #808080)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 16, color: "#0a0a0a" }}>LF</span>
          </div>
          <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 15, color: "#e0e0e0", letterSpacing: 1 }}>LIVEFAST ACO</span>
        </button>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="nav-desktop">
          {links.map(l => (
            <button key={l.label} onClick={() => go(l.id, l.scroll)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: (page === l.id && !l.scroll) ? "#c0c0c0" : "#777",
              fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 500, padding: "8px 14px", borderRadius: 6,
              transition: "color 0.2s"
            }}>{l.label}</button>
          ))}
          <a href="https://discord.gg/livefast" target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "linear-gradient(135deg, #c0c0c0, #909090)", color: "#0a0a0a",
            fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 600,
            padding: "8px 18px", borderRadius: 8, textDecoration: "none", marginLeft: 8,
            transition: "transform 0.2s", cursor: "pointer"
          }}>{Icons.discord} Join Discord</a>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: "none", border: "none", color: "#c0c0c0", cursor: "pointer" }} className="nav-mobile">
          {mobileOpen ? Icons.close : Icons.menu}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{ background: "rgba(10,10,10,0.98)", borderTop: "1px solid #1a1a1a", padding: "16px 24px" }} className="nav-mobile">
          {links.map(l => (
            <button key={l.label} onClick={() => go(l.id, l.scroll)} style={{
              display: "block", width: "100%", background: "none", border: "none", cursor: "pointer",
              color: "#999", fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 500,
              padding: "12px 0", textAlign: "left", borderBottom: "1px solid #1a1a1a"
            }}>{l.label}</button>
          ))}
          <a href="https://discord.gg/livefast" target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16,
            background: "linear-gradient(135deg, #c0c0c0, #909090)", color: "#0a0a0a",
            fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 600,
            padding: "10px 24px", borderRadius: 8, textDecoration: "none"
          }}>{Icons.discord} Join Discord</a>
        </div>
      )}
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════
   HOME PAGE
   ══════════════════════════════════════════════════════════ */
function HomePage({ setPage }) {
  return (
    <div>
      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", paddingTop: 64 }}>
        {/* Gradient orbs */}
        <div style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 800, height: 800, background: "radial-gradient(circle, rgba(192,192,192,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 100, right: -100, width: 400, height: 400, background: "radial-gradient(circle, rgba(160,160,160,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

        <Marquee />

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px 40px", textAlign: "center", position: "relative" }}>
          <FadeIn>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(192,192,192,0.08)", border: "1px solid rgba(192,192,192,0.15)", borderRadius: 100, padding: "6px 16px", marginBottom: 32 }}>
              {Icons.bolt}
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#c0c0c0", letterSpacing: 2, textTransform: "uppercase" }}>Automated Checkout Operations</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(36px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.05, color: "#f0f0f0", marginBottom: 24, letterSpacing: -1 }}>
              Score the{" "}
              <span style={{ background: "linear-gradient(135deg, #d4d4d4 0%, #808080 50%, #c0c0c0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Unobtainable.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(15px, 2vw, 18px)", color: "#777", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 40px" }}>
              Automated checkouts across Target, Walmart, and Pokemon Center. Real-time order tracking, email scraping, and a members-only dashboard. All in one membership.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://discord.gg/livefast" target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "linear-gradient(135deg, #d0d0d0, #909090)", color: "#0a0a0a",
                fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700,
                padding: "14px 32px", borderRadius: 10, textDecoration: "none",
                boxShadow: "0 0 30px rgba(192,192,192,0.15)", transition: "transform 0.2s, box-shadow 0.2s",
              }}>{Icons.discord} Join Discord</a>
              <button onClick={() => setPage("scraper")} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.04)", color: "#c0c0c0",
                border: "1px solid #333", fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 600,
                padding: "14px 28px", borderRadius: 10, cursor: "pointer", transition: "all 0.2s"
              }}>Sign in to Dashboard {Icons.arrow}</button>
            </div>
          </FadeIn>
        </div>

        {/* Dashboard preview tabs */}
        <FadeIn delay={0.4}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 0, flexWrap: "wrap" }}>
              {["Dashboard", "Email Scraper", "My Checkouts", "Inventory", "Releases"].map((t, i) => (
                <div key={t} style={{
                  padding: "10px 20px", borderRadius: "8px 8px 0 0",
                  background: i === 0 ? "rgba(192,192,192,0.1)" : "transparent",
                  border: i === 0 ? "1px solid #2a2a2a" : "1px solid transparent", borderBottom: "none",
                  color: i === 0 ? "#c0c0c0" : "#555",
                  fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer"
                }}>
                  {t}
                </div>
              ))}
            </div>
            {/* Mock dashboard */}
            <div style={{
              background: "linear-gradient(180deg, #111 0%, #0d0d0d 100%)",
              border: "1px solid #2a2a2a", borderRadius: "0 12px 12px 12px",
              padding: "24px", marginBottom: 80
            }}>
              {/* Browser bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
                <div style={{ flex: 1, background: "#1a1a1a", borderRadius: 6, padding: "6px 16px", marginLeft: 12, display: "flex", alignItems: "center", gap: 8, maxWidth: 360 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#28c840" }} />
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#666" }}>app.livefastaco.com/dashboard</span>
                </div>
              </div>
              {/* Welcome */}
              <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 700, color: "#e0e0e0", marginBottom: 4 }}>Welcome Back, Member!</p>
              <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#666", marginBottom: 20 }}>Here's your collection overview</p>
              {/* Stat cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                {[
                  { label: "Total Checkouts", value: 247, suffix: "", change: "+18%" },
                  { label: "Today's Checkouts", value: 12, suffix: "", sub: "31% of total" },
                  { label: "Total Spent", value: 8, prefix: "$", suffix: ".7k" },
                  { label: "Total Items", value: 489, suffix: "" },
                ].map((s, i) => (
                  <div key={i} style={{
                    background: "#161616", border: "1px solid #222", borderRadius: 10, padding: "16px 18px"
                  }}>
                    <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 12, color: "#666", marginBottom: 8 }}>{s.label}</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 24, fontWeight: 700, color: "#e0e0e0" }}>
                        <AnimNum to={s.value} prefix={s.prefix || ""} suffix={s.suffix || ""} />
                      </span>
                      {s.change && <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 600 }}>{s.change}</span>}
                      {s.sub && <span style={{ fontSize: 11, color: "#666" }}>{s.sub}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px 80px" }}>
        <FadeIn>
          <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#666", letterSpacing: 2, textTransform: "uppercase", textAlign: "center", marginBottom: 8 }}>How It Works</p>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, color: "#e0e0e0", textAlign: "center", marginBottom: 48 }}>
            Three Steps. Zero Hassle.
          </h2>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[
            { num: "01", title: "Join Discord & Sign Up", desc: "Hop into the LIVEFAST Discord, create your account, and connect your profile. Takes under 2 minutes." },
            { num: "02", title: "Select Your Targets", desc: "Choose which products and retailers you want us to run. Pokemon, collectibles, exclusives. You pick it, we hit it." },
            { num: "03", title: "We Secure the Bag", desc: "Our automated systems run checkouts the instant products drop. You get notified. You get the product. Simple." },
          ].map((s, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <div style={{
                background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, padding: "32px 28px",
                position: "relative", overflow: "hidden", height: "100%"
              }}>
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 48, fontWeight: 700, color: "rgba(192,192,192,0.06)", position: "absolute", top: 12, right: 16 }}>{s.num}</span>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(192,192,192,0.08)", border: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, fontWeight: 700, color: "#c0c0c0" }}>{s.num}</span>
                </div>
                <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 700, color: "#e0e0e0", marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, color: "#666", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={{ background: "#0d0d0d", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(192,192,192,0.06)", border: "1px solid rgba(192,192,192,0.1)", borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#c0c0c0", letterSpacing: 2, textTransform: "uppercase" }}>What We Offer</span>
            </div>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, color: "#e0e0e0", marginBottom: 12 }}>
              Everything You Need to{" "}
              <span style={{ background: "linear-gradient(90deg, #d4d4d4, #808080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Win</span>
            </h2>
            <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, color: "#666", marginBottom: 48, maxWidth: 560 }}>
              No monthly fees. No locked tiers. You only pay when we land a checkout. Full system access from day one.
            </p>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {[
              { icon: Icons.cart, title: "Automated Checkouts", desc: "Lightning-fast bots across Target, Walmart, Pokemon Center, and more. We run it the second it drops." },
              { icon: Icons.scan, title: "Email Order Scraping", desc: "Connect your email via IMAP. We scan, pull, and organize every order confirmation automatically." },
              { icon: Icons.package, title: "Inventory Tracking", desc: "Full dashboard view of your collection. Track orders, shipments, and total spend in one place." },
              { icon: Icons.target, title: "Release Calendar", desc: "Never miss a drop. One-click signup for upcoming releases across every supported retailer." },
              { icon: Icons.users, title: "Discord Community", desc: "Real-time alerts, restock pings, member-only channels, and direct support from the LIVEFAST team." },
              { icon: Icons.trophy, title: "Pay Per Success", desc: "No upfront cost. No subscriptions. You only pay a fee when we successfully land a checkout for you." },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div style={{
                  background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, padding: "28px 24px",
                  transition: "border-color 0.3s, background 0.3s", cursor: "default", height: "100%"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.background = "#151515"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.background = "#111"; }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(192,192,192,0.06)", border: "1px solid #2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18, color: "#c0c0c0" }}>
                    {s.icon}
                  </div>
                  <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 700, color: "#e0e0e0", marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#666", lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEMBERSHIP CARD ── */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px" }}>
        <FadeIn>
          <div style={{
            background: "linear-gradient(135deg, #111 0%, #0d0d0d 100%)",
            border: "1px solid #2a2a2a", borderRadius: 20, padding: "48px 40px",
            position: "relative", overflow: "hidden"
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, rgba(192,192,192,0.3), transparent)" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ color: "#c0c0c0" }}>{Icons.check}</div>
              <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 800, color: "#e0e0e0" }}>Everything Included</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 32 }}>
              {[
                "Automated checkouts across all retailers",
                "Email order scraping & tracking",
                "Points & rewards system",
                "Discord community & support",
                "Full dashboard access",
                "Release calendar with one-click signups",
                "Inventory management tools",
                "Priority restock alerts",
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 0" }}>
                  <div style={{ color: "#c0c0c0", flexShrink: 0 }}>{Icons.check}</div>
                  <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#888" }}>{f}</span>
                </div>
              ))}
            </div>
            <a href="https://discord.gg/livefast" target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "linear-gradient(135deg, #d0d0d0, #909090)", color: "#0a0a0a",
              fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700,
              padding: "14px 36px", borderRadius: 10, textDecoration: "none",
              boxShadow: "0 0 30px rgba(192,192,192,0.12)"
            }}>{Icons.discord} Get Started. It's Free.</a>
          </div>
        </FadeIn>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: "#0d0d0d", borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", padding: "48px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 32, textAlign: "center" }}>
          {[
            { val: 12000, suffix: "+", label: "Successful Checkouts" },
            { val: 850, suffix: "+", label: "Active Members" },
            { val: 99, suffix: "%", label: "Uptime" },
            { val: 3, suffix: "", label: "Supported Retailers" },
          ].map((s, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div>
                <p style={{ fontFamily: "'Space Mono',monospace", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: "#e0e0e0" }}>
                  <AnimNum to={s.val} suffix={s.suffix} />
                </p>
                <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#555", marginTop: 4 }}>{s.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px" }}>
        <FadeIn>
          <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#666", letterSpacing: 2, textTransform: "uppercase", textAlign: "center", marginBottom: 8 }}>Testimonials</p>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#e0e0e0", textAlign: "center", marginBottom: 48 }}>What Our Members Say</h2>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {[
            { name: "Jake M.", handle: "@jakecollects", text: "LIVEFAST has landed me 30+ Prismatic Evolutions ETBs I never would have gotten manually. The scraper alone is worth it.", stars: 5 },
            { name: "Destiny R.", handle: "@destinyresells", text: "I was paying for two other ACO services before. Switched to LIVEFAST and haven't looked back. The dashboard is insane.", stars: 5 },
            { name: "Marcus T.", handle: "@marcustcg", text: "The pay-per-success model sold me. Zero risk. They land a checkout, I pay the fee. No monthly drain on my wallet.", stars: 5 },
          ].map((t, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <div style={{
                background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, padding: "28px 24px", height: "100%"
              }}>
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {Array.from({ length: t.stars }).map((_, j) => <span key={j} style={{ color: "#c0c0c0" }}>{Icons.star}</span>)}
                </div>
                <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, color: "#888", lineHeight: 1.7, marginBottom: 20 }}>"{t.text}"</p>
                <div>
                  <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 700, color: "#e0e0e0" }}>{t.name}</p>
                  <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#555" }}>{t.handle}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <ContactSection />

      {/* ── FOOTER ── */}
      <Footer setPage={setPage} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ORDER SCRAPER PAGE
   ══════════════════════════════════════════════════════════ */
function ScraperPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imapServer, setImapServer] = useState("");
  const [retailers, setRetailers] = useState({ target: true, walmart: true, pokemonCenter: true });
  const [connected, setConnected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);

  const mockOrders = [
    { retailer: "Target", item: "Prismatic Evolutions ETB", date: "2026-05-06", status: "Delivered", total: "$54.99" },
    { retailer: "Pokemon Center", item: "Charizard ex Premium Collection", date: "2026-05-04", status: "Shipped", total: "$39.99" },
    { retailer: "Walmart", item: "Scarlet & Violet Booster Bundle", date: "2026-05-02", status: "Delivered", total: "$29.97" },
    { retailer: "Target", item: "Surging Sparks Elite Trainer Box", date: "2026-04-30", status: "Delivered", total: "$44.99" },
    { retailer: "Pokemon Center", item: "Pikachu VMAX Figure Collection", date: "2026-04-28", status: "Delivered", total: "$29.99" },
    { retailer: "Walmart", item: "Twilight Masquerade BB", date: "2026-04-25", status: "Delivered", total: "$89.99" },
  ];

  const handleConnect = () => {
    if (!email || !password) return;
    setConnected(true);
  };

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => { setScanning(false); setResults(mockOrders); }, 2500);
  };

  const retailerColors = { Target: "#cc0000", Walmart: "#0071ce", "Pokemon Center": "#ffcb05" };

  const inputStyle = {
    width: "100%", background: "#111", border: "1px solid #2a2a2a", borderRadius: 10,
    padding: "14px 16px", color: "#e0e0e0", fontFamily: "'Outfit',sans-serif", fontSize: 14,
    outline: "none", transition: "border-color 0.2s"
  };
  const labelStyle = { fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 600, color: "#888", marginBottom: 6, display: "block" };

  return (
    <div style={{ paddingTop: 100, minHeight: "100vh" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 80px" }}>
        <FadeIn>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(192,192,192,0.06)", border: "1px solid rgba(192,192,192,0.1)", borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
            <span style={{ color: "#c0c0c0" }}>{Icons.scan}</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#c0c0c0", letterSpacing: 2, textTransform: "uppercase" }}>Order Scraper</span>
          </div>
          <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, color: "#f0f0f0", marginBottom: 12 }}>
            Pull Every Order.{" "}
            <span style={{ background: "linear-gradient(90deg, #d4d4d4, #808080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Automatically.</span>
          </h1>
          <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, color: "#666", marginBottom: 48, maxWidth: 560 }}>
            Connect your email via IMAP and we'll scan for order confirmations from Target, Walmart, and Pokemon Center. Your entire purchase history, organized in seconds.
          </p>
        </FadeIn>

        {/* CONNECTION FORM */}
        <FadeIn delay={0.15}>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "32px 28px", marginBottom: 24 }}>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 700, color: "#e0e0e0", marginBottom: 4 }}>
              {connected ? "✓ Email Connected" : "Connect Your Email"}
            </h3>
            <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#555", marginBottom: 24 }}>
              {connected ? `Connected as ${email}` : "Enter your IMAP credentials to begin scanning."}
            </p>

            {!connected ? (
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={inputStyle} onFocus={e => e.target.style.borderColor = "#444"} onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>App Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} onFocus={e => e.target.style.borderColor = "#444"} onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
                  </div>
                  <div>
                    <label style={labelStyle}>IMAP Server</label>
                    <input type="text" value={imapServer} onChange={e => setImapServer(e.target.value)} placeholder="imap.gmail.com" style={inputStyle} onFocus={e => e.target.style.borderColor = "#444"} onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
                  </div>
                </div>

                {/* Retailer toggles */}
                <div>
                  <label style={labelStyle}>Retailers to Scan</label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {[
                      { key: "target", label: "Target", color: "#cc0000" },
                      { key: "walmart", label: "Walmart", color: "#0071ce" },
                      { key: "pokemonCenter", label: "Pokemon Center", color: "#ffcb05" },
                    ].map(r => (
                      <button key={r.key} onClick={() => setRetailers(p => ({ ...p, [r.key]: !p[r.key] }))} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: retailers[r.key] ? "rgba(192,192,192,0.08)" : "transparent",
                        border: `1px solid ${retailers[r.key] ? "#444" : "#2a2a2a"}`,
                        borderRadius: 8, padding: "10px 16px", cursor: "pointer", transition: "all 0.2s"
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: retailers[r.key] ? r.color : "#333" }} />
                        <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: retailers[r.key] ? "#c0c0c0" : "#555" }}>{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleConnect} style={{
                  background: "linear-gradient(135deg, #d0d0d0, #909090)", color: "#0a0a0a",
                  fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700,
                  padding: "14px 0", borderRadius: 10, border: "none", cursor: "pointer",
                  transition: "transform 0.2s", width: "100%"
                }}>
                  {Icons.link} Connect via IMAP
                </button>

                <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 11, color: "#444", textAlign: "center" }}>
                  Your credentials are encrypted end-to-end. We never store your password.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={handleScan} disabled={scanning} style={{
                  background: scanning ? "#222" : "linear-gradient(135deg, #d0d0d0, #909090)",
                  color: scanning ? "#666" : "#0a0a0a",
                  fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 700,
                  padding: "12px 28px", borderRadius: 10, border: "none", cursor: scanning ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 8
                }}>
                  {scanning ? (
                    <><div style={{ width: 16, height: 16, border: "2px solid #444", borderTopColor: "#888", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Scanning emails...</>
                  ) : (
                    <>{Icons.scan} Scan for Orders</>
                  )}
                </button>
                <button onClick={() => { setConnected(false); setResults(null); setEmail(""); setPassword(""); }} style={{
                  background: "transparent", border: "1px solid #333", color: "#888",
                  fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 600,
                  padding: "12px 20px", borderRadius: 10, cursor: "pointer"
                }}>Disconnect</button>
              </div>
            )}
          </div>
        </FadeIn>

        {/* RESULTS TABLE */}
        {results && (
          <FadeIn>
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e1e1e", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 700, color: "#e0e0e0" }}>Orders Found</h3>
                  <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#555" }}>{results.length} orders across {Object.keys(retailers).filter(k => retailers[k]).length} retailers</p>
                </div>
                <button style={{ background: "rgba(192,192,192,0.08)", border: "1px solid #333", color: "#c0c0c0", fontFamily: "'Outfit',sans-serif", fontSize: 12, fontWeight: 600, padding: "8px 16px", borderRadius: 8, cursor: "pointer" }}>
                  Export CSV
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1e1e1e" }}>
                      {["Retailer", "Item", "Date", "Status", "Total"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1, fontWeight: 400 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((o, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #141414", transition: "background 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#151515"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: retailerColors[o.retailer] || "#666" }} />
                            <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#c0c0c0", fontWeight: 600 }}>{o.retailer}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#888" }}>{o.item}</td>
                        <td style={{ padding: "14px 16px", fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#555" }}>{o.date}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            fontFamily: "'Outfit',sans-serif", fontSize: 11, fontWeight: 600,
                            color: o.status === "Delivered" ? "#4ade80" : "#c0c0c0",
                            background: o.status === "Delivered" ? "rgba(74,222,128,0.1)" : "rgba(192,192,192,0.08)",
                            padding: "4px 10px", borderRadius: 6
                          }}>{o.status}</span>
                        </td>
                        <td style={{ padding: "14px 16px", fontFamily: "'Space Mono',monospace", fontSize: 13, color: "#c0c0c0", fontWeight: 600 }}>{o.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MEMBER SIGNUP PAGE
   ══════════════════════════════════════════════════════════ */
function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", discord: "", retailers: [], products: [] });
  const [submitted, setSubmitted] = useState(false);

  const retailerOpts = [
    { id: "target", label: "Target", color: "#cc0000" },
    { id: "walmart", label: "Walmart", color: "#0071ce" },
    { id: "pokemonCenter", label: "Pokemon Center", color: "#ffcb05" },
  ];

  const productOpts = [
    { id: "etb", label: "Elite Trainer Boxes", cat: "Pokemon TCG" },
    { id: "bb", label: "Booster Boxes", cat: "Pokemon TCG" },
    { id: "upc", label: "Ultra Premium Collections", cat: "Pokemon TCG" },
    { id: "special", label: "Special Collections", cat: "Pokemon TCG" },
    { id: "tins", label: "Tins & Mini Tins", cat: "Pokemon TCG" },
    { id: "figures", label: "Figure Collections", cat: "Pokemon TCG" },
    { id: "exclusives", label: "Store Exclusives", cat: "Limited" },
    { id: "restocks", label: "High-Value Restocks", cat: "Limited" },
  ];

  const toggle = (field, val) => {
    setForm(p => ({
      ...p,
      [field]: p[field].includes(val) ? p[field].filter(v => v !== val) : [...p[field], val]
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.email) return;
    setSubmitted(true);
  };

  const inputStyle = {
    width: "100%", background: "#111", border: "1px solid #2a2a2a", borderRadius: 10,
    padding: "14px 16px", color: "#e0e0e0", fontFamily: "'Outfit',sans-serif", fontSize: 14,
    outline: "none", transition: "border-color 0.2s"
  };
  const labelStyle = { fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 600, color: "#888", marginBottom: 6, display: "block" };

  if (submitted) {
    return (
      <div style={{ paddingTop: 100, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 500, padding: "0 24px" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "2px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#4ade80" }}>
              <Icon d="M20 6L9 17l-5-5" size={36} />
            </div>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 28, fontWeight: 800, color: "#e0e0e0", marginBottom: 12 }}>You're In.</h2>
            <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 15, color: "#666", lineHeight: 1.7, marginBottom: 32 }}>
              Welcome to LIVEFAST, {form.name}. Check your email for next steps, and hop into Discord to get set up with the team.
            </p>
            <a href="https://discord.gg/livefast" target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "linear-gradient(135deg, #d0d0d0, #909090)", color: "#0a0a0a",
              fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700,
              padding: "14px 36px", borderRadius: 10, textDecoration: "none"
            }}>{Icons.discord} Join Discord</a>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 100, minHeight: "100vh" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 80px" }}>
        <FadeIn>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(192,192,192,0.06)", border: "1px solid rgba(192,192,192,0.1)", borderRadius: 100, padding: "6px 16px", marginBottom: 20 }}>
            <span style={{ color: "#c0c0c0" }}>{Icons.users}</span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#c0c0c0", letterSpacing: 2, textTransform: "uppercase" }}>Member Signup</span>
          </div>
          <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 800, color: "#f0f0f0", marginBottom: 12 }}>
            Join the{" "}
            <span style={{ background: "linear-gradient(90deg, #d4d4d4, #808080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Inner Circle.</span>
          </h1>
          <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, color: "#666", marginBottom: 48, maxWidth: 560 }}>
            Sign up, choose your retailers and products, and let us handle the rest. No commitment. Pay only when we deliver.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div style={{ display: "grid", gap: 24 }}>
            {/* Personal info */}
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "28px 24px" }}>
              <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 700, color: "#e0e0e0", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#c0c0c0" }}>{Icons.mail}</span> Your Info
              </h3>
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="John Doe" style={inputStyle} onFocus={e => e.target.style.borderColor = "#444"} onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@email.com" style={inputStyle} onFocus={e => e.target.style.borderColor = "#444"} onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
                  </div>
                  <div>
                    <label style={labelStyle}>Discord Username</label>
                    <input value={form.discord} onChange={e => setForm(p => ({ ...p, discord: e.target.value }))} placeholder="username#0000" style={inputStyle} onFocus={e => e.target.style.borderColor = "#444"} onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
                  </div>
                </div>
              </div>
            </div>

            {/* Retailer selection */}
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "28px 24px" }}>
              <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 700, color: "#e0e0e0", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#c0c0c0" }}>{Icons.cart}</span> Retailer Signup
              </h3>
              <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#555", marginBottom: 18 }}>Select which retailers you want us to run for you.</p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {retailerOpts.map(r => {
                  const sel = form.retailers.includes(r.id);
                  return (
                    <button key={r.id} onClick={() => toggle("retailers", r.id)} style={{
                      flex: "1 1 140px", display: "flex", alignItems: "center", gap: 12,
                      background: sel ? "rgba(192,192,192,0.06)" : "transparent",
                      border: `1px solid ${sel ? "#444" : "#2a2a2a"}`,
                      borderRadius: 12, padding: "16px 18px", cursor: "pointer", transition: "all 0.2s"
                    }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: sel ? r.color : "#333", transition: "background 0.2s" }} />
                      <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 600, color: sel ? "#e0e0e0" : "#555" }}>{r.label}</span>
                      {sel && <span style={{ marginLeft: "auto", color: "#4ade80" }}>{Icons.check}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product selection */}
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "28px 24px" }}>
              <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 700, color: "#e0e0e0", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#c0c0c0" }}>{Icons.package}</span> Product Interests
              </h3>
              <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#555", marginBottom: 18 }}>Choose which product categories you want us to target.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                {productOpts.map(p => {
                  const sel = form.products.includes(p.id);
                  return (
                    <button key={p.id} onClick={() => toggle("products", p.id)} style={{
                      display: "flex", flexDirection: "column", alignItems: "flex-start",
                      background: sel ? "rgba(192,192,192,0.06)" : "transparent",
                      border: `1px solid ${sel ? "#444" : "#2a2a2a"}`,
                      borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "all 0.2s"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 4 }}>
                        <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 600, color: sel ? "#e0e0e0" : "#666" }}>{p.label}</span>
                        {sel && <span style={{ color: "#4ade80" }}>{Icons.check}</span>}
                      </div>
                      <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#444", letterSpacing: 1, textTransform: "uppercase" }}>{p.cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} style={{
              background: "linear-gradient(135deg, #d0d0d0, #909090)", color: "#0a0a0a",
              fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 700,
              padding: "16px 0", borderRadius: 12, border: "none", cursor: "pointer",
              transition: "transform 0.2s", width: "100%",
              boxShadow: "0 0 40px rgba(192,192,192,0.1)"
            }}>
              Complete Signup {Icons.arrow}
            </button>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CONTACT SECTION
   ══════════════════════════════════════════════════════════ */
function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const inputStyle = {
    width: "100%", background: "#111", border: "1px solid #2a2a2a", borderRadius: 10,
    padding: "14px 16px", color: "#e0e0e0", fontFamily: "'Outfit',sans-serif", fontSize: 14,
    outline: "none", transition: "border-color 0.2s"
  };
  return (
    <section id="contact" style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px" }}>
      <FadeIn>
        <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#666", letterSpacing: 2, textTransform: "uppercase", textAlign: "center", marginBottom: 8 }}>Contact</p>
        <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: "#e0e0e0", textAlign: "center", marginBottom: 12 }}>Get in Touch</h2>
        <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 15, color: "#666", textAlign: "center", marginBottom: 40 }}>
          Questions? Need help? Hit us up. We usually respond within a few hours.
        </p>
      </FadeIn>
      <FadeIn delay={0.15}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "2px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#4ade80" }}>
              <Icon d="M20 6L9 17l-5-5" size={28} />
            </div>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 20, fontWeight: 700, color: "#e0e0e0", marginBottom: 8 }}>Message Sent</h3>
            <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 14, color: "#666" }}>We'll get back to you soon.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 600, color: "#888", marginBottom: 6, display: "block" }}>Name</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Your name" style={inputStyle} onFocus={e => e.target.style.borderColor = "#444"} onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
              </div>
              <div>
                <label style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 600, color: "#888", marginBottom: 6, display: "block" }}>Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@email.com" style={inputStyle} onFocus={e => e.target.style.borderColor = "#444"} onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
              </div>
            </div>
            <div>
              <label style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 600, color: "#888", marginBottom: 6, display: "block" }}>Message</label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="What's on your mind?" rows={5} style={{ ...inputStyle, resize: "vertical" }} onFocus={e => e.target.style.borderColor = "#444"} onBlur={e => e.target.style.borderColor = "#2a2a2a"} />
            </div>
            <button onClick={() => { if (form.name && form.email && form.message) setSent(true); }} style={{
              background: "linear-gradient(135deg, #d0d0d0, #909090)", color: "#0a0a0a",
              fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700,
              padding: "14px 0", borderRadius: 10, border: "none", cursor: "pointer", width: "100%"
            }}>Send Message</button>
          </div>
        )}
      </FadeIn>
    </section>
  );
}

/* ──────── FOOTER ──────── */
function Footer({ setPage }) {
  return (
    <footer style={{ borderTop: "1px solid #1a1a1a", padding: "48px 24px 32px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #c0c0c0, #808080)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 13, color: "#0a0a0a" }}>LF</span>
            </div>
            <span style={{ fontFamily: "'Space Mono',monospace", fontWeight: 700, fontSize: 14, color: "#888" }}>LIVEFAST ACO</span>
          </div>
          <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#444", maxWidth: 280 }}>
            Your one-stop shop for scoring the unobtainable. Automated checkouts, real-time tracking, and a community that wins together.
          </p>
        </div>
        <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#555", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Pages</p>
            {[["Home", "home"], ["Order Scraper", "scraper"], ["Member Signup", "signup"]].map(([l, p]) => (
              <button key={p} onClick={() => { setPage(p); window.scrollTo(0, 0); }} style={{ display: "block", background: "none", border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#555", padding: "4px 0", transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#c0c0c0"} onMouseLeave={e => e.target.style.color = "#555"}>{l}</button>
            ))}
          </div>
          <div>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#555", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Connect</p>
            <a href="https://discord.gg/livefast" target="_blank" rel="noopener noreferrer" style={{ display: "block", fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#555", padding: "4px 0", textDecoration: "none" }}>Discord</a>
            <a href="https://twitter.com/livefastaco" target="_blank" rel="noopener noreferrer" style={{ display: "block", fontFamily: "'Outfit',sans-serif", fontSize: 13, color: "#555", padding: "4px 0", textDecoration: "none" }}>Twitter / X</a>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1000, margin: "32px auto 0", borderTop: "1px solid #1a1a1a", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#333" }}>&copy; 2026 LIVEFAST LLC. All rights reserved.</p>
        <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#333" }}>Tennessee, USA</p>
      </div>
    </footer>
  );
}

/* ══════════════════════════════════════════════════════════
   APP
   ══════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("home");

  useEffect(() => { window.scrollTo({ top: 0 }); }, [page]);

  return (
    <div style={{ background: "#0a0a0a", color: "#e0e0e0", minHeight: "100vh", fontFamily: "'Outfit',sans-serif" }}>
      <Navbar page={page} setPage={setPage} />
      {page === "home" && <HomePage setPage={setPage} />}
      {page === "scraper" && <ScraperPage />}
      {page === "signup" && <SignupPage />}
      {page !== "home" && <Footer setPage={setPage} />}

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::selection { background: rgba(192,192,192,0.3); color: #fff; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #444; }
        input::placeholder, textarea::placeholder { color: #444; }
        button:hover { filter: brightness(1.05); }
        a:hover { filter: brightness(1.1); }

        @media (min-width: 769px) { .nav-mobile { display: none !important; } }
        @media (max-width: 768px) { .nav-desktop { display: none !important; } }
      `}</style>
    </div>
  );
}
