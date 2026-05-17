import { useState } from "react";
import { ThemeProvider, useTheme, themes, fontY2K, fontBody, fontMono } from "./ThemeContext";
import { Icons as I } from "./Icons";

// ============================================================
// LIVEFAST ACO -- Complete Application
// Marketing Landing + Dashboard with Light/Dark Mode
// Y2K Monochrome Aesthetic
// ============================================================

// Theme, fonts, and icons imported from shared modules above

// --- MOCK DATA ---
const mockProducts = [
  { name: "Pokemon SV Prismatic Evolutions ETB", orders: 32, units: 95, avg: 76.46, total: 7263.74, fulfilled: 59.4 },
  { name: "Pokemon Mega Evolution Ascended Heroes ETB", orders: 102, units: 104, avg: 64.32, total: 6689.54, fulfilled: 51 },
  { name: "Pokemon Mega Evo 2.5 Premium Poster Collection", orders: 18, units: 85, avg: 65.55, total: 5572.03, fulfilled: 94.4 },
  { name: "Pokemon Mega Evo First Partners Deluxe Pin", orders: 39, units: 165, avg: 32.77, total: 5406.93, fulfilled: 84.6 },
  { name: "Pokemon SV 8.5 Prismatic Evo Mini Tin 8ct", orders: 6, units: 30, avg: 131.03, total: 3930.77, fulfilled: 100 },
];
const mockTracking = [
  { product: "Pokemon Mega Evolution Ascended Heroes Booster Bundle", order: "#912083426626127", retailer: "Target", carrier: "UPS", date: "Apr 23, 2026", status: "In Transit", eta: "May 1" },
  { product: "ROSONG Collapsible Wagon", order: "#114-3675676-3556235", retailer: "Amazon", carrier: "FedEx", date: "Mar 31, 2026", status: "In Transit", eta: "Apr 5" },
  { product: "Pokemon SV Prismatic Evolutions Booster Bundle", order: "#102083309311289", retailer: "Target", carrier: "UPS", date: "Mar 11, 2026", status: "Delayed", eta: "Overdue" },
  { product: "Pokemon First Partner Illustration Series 1", order: "#912083426626128", retailer: "Walmart", carrier: "FedEx", date: "Apr 20, 2026", status: "Delivered", eta: "Apr 22" },
  { product: "Pokemon Prismatic SPC Display", order: "#912083426626130", retailer: "Sam's Club", carrier: "USPS", date: "Apr 18, 2026", status: "Delivered", eta: "Apr 21" },
];
const mockInvoices = [
  { id: "INV-2026-041", client: "Mateen Mansoor (CM Games)", amount: 4250.00, fee: 765.00, status: "Paid", date: "Apr 15, 2026", dueDate: "Apr 30, 2026" },
  { id: "INV-2026-042", client: "Jason Garcia", amount: 1890.50, fee: 340.29, status: "Pending", date: "Apr 20, 2026", dueDate: "May 5, 2026" },
  { id: "INV-2026-043", client: "Tyler Reed", amount: 3200.00, fee: 576.00, status: "Overdue", date: "Mar 28, 2026", dueDate: "Apr 12, 2026" },
  { id: "INV-2026-044", client: "Brandon Ortiz", amount: 950.00, fee: 171.00, status: "Paid", date: "Apr 22, 2026", dueDate: "May 7, 2026" },
  { id: "INV-2026-045", client: "David Kim", amount: 2780.00, fee: 500.40, status: "Pending", date: "Apr 25, 2026", dueDate: "May 10, 2026" },
];
const mockDrops = [
  { id: 1, title: "Walmart Wednesday - Ascended Heroes", date: "2026-05-20", time: "12:00 PM ET", retailer: "Walmart", products: "Ascended Heroes Booster Bundle, ETB", slots: 8, filled: 5, signedUp: false },
  { id: 2, title: "Target - Prismatic SPC Restock", date: "2026-05-22", time: "7:00 AM ET", retailer: "Target", products: "Prismatic SPC, Prismatic ETB", slots: 6, filled: 6, signedUp: true },
  { id: 3, title: "Pokemon Center - Mega Evo Wave 2", date: "2026-05-28", time: "10:00 AM ET", retailer: "Pokemon Center", products: "Mega Evolution 2.5 ETB, Booster Bundle", slots: 10, filled: 3, signedUp: false },
  { id: 4, title: "Sam's Club - Prismatic Tin Display", date: "2026-06-01", time: "6:00 AM ET", retailer: "Sam's Club", products: "Prismatic Tin Display, Mini Tin 8ct", slots: 4, filled: 0, signedUp: false },
];
const mockMembers = [
  { name: "Mateen Mansoor", email: "cm.games@gmail.com", status: "Active", joined: "Jan 2026", totalSpend: 18450.00, tier: "Gold" },
  { name: "Tyler Reed", email: "tyler.reed@outlook.com", status: "Active", joined: "Feb 2026", totalSpend: 9200.00, tier: "Silver" },
  { name: "Brandon Ortiz", email: "b.ortiz@gmail.com", status: "Active", joined: "Mar 2026", totalSpend: 4500.00, tier: "Bronze" },
  { name: "David Kim", email: "d.kim@gmail.com", status: "Paused", joined: "Jan 2026", totalSpend: 12300.00, tier: "Gold" },
  { name: "Sarah Chen", email: "s.chen@icloud.com", status: "Active", joined: "Apr 2026", totalSpend: 2100.00, tier: "Bronze" },
];
const mockAccounts = [
  { email: "hunterdkeeter@icloud.com", type: "IMAP", status: "Live" },
  { email: "hunterdkeeter@gmail.com", type: "Gmail", status: "Live" },
  { email: "huntiyahbiz@gmail.com", type: "Gmail", status: "Live" },
  { email: "jacksonarmon984@gmail.com", type: "Gmail", status: "Live" },
  { email: "justletitgoman67@gmail.com", type: "Gmail", status: "Live" },
];

// ============================================================
// MAIN APP
// ============================================================
export default function App({ startPage, user }) {
  return (
    <ThemeProvider>
      <AppInner startPage={startPage} user={user} />
    </ThemeProvider>
  );
}

function AppInner({ startPage, user }) {
  const { t, theme } = useTheme();
  const [page, setPage] = useState(startPage || "landing");

  const handleLogout = () => {
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard")) {
      window.location.href = "/api/auth/logout";
    } else {
      setPage("landing");
    }
  };

  return (
    <div style={{ background: t.bg, color: t.text, fontFamily: fontBody, minHeight: "100vh", transition: "background 0.3s, color 0.3s" }}>
      {page === "landing" ? <LandingPage onEnter={() => setPage("dashboard")} /> : <DashboardApp onLogout={handleLogout} user={user} />}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gridPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus, textarea:focus { outline: none; }
        button { font-family: inherit; }
      `}</style>
    </div>
  );
}

// ============================================================
// LANDING PAGE
// ============================================================
function LandingPage({ onEnter }) {
  const { t, theme, toggleTheme } = useTheme();
  const [showAuth, setShowAuth] = useState(false);
  const [authState, setAuthState] = useState("idle"); // idle | connecting | success

  const handleAuth = () => {
    setAuthState("connecting");
    setTimeout(() => {
      setAuthState("success");
      setTimeout(() => { setShowAuth(false); setAuthState("idle"); onEnter(); }, 1200);
    }, 2000);
  };

  const features = [
    { icon: I.Zap, title: "Automated Checkout", desc: "Lightning-fast automated purchasing across Walmart, Target, Pokemon Center, and more." },
    { icon: I.Tracking, title: "Real-Time Tracking", desc: "Every order tracked from purchase to delivery with carrier integration and Discord alerts." },
    { icon: I.Shield, title: "Managed Service", desc: "Full-service checkout operation. We handle the accounts, you get the product." },
    { icon: I.Globe, title: "Multi-Retailer", desc: "Walmart, Target, Sam's Club, Pokemon Center, Best Buy, Amazon, and expanding." },
    { icon: I.Insights, title: "Analytics Dashboard", desc: "Track spend, fulfillment rates, top products, and ROI across all your orders." },
    { icon: I.Box, title: "Drop Calendar", desc: "Scheduled drops with slot reservations. Sign up for the products you want, we do the rest." },
  ];

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
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
            {theme === "dark" ? <I.Sun /> : <I.Moon />}
          </button>
          <button onClick={() => setShowAuth(true)} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: t.accent, color: theme === "dark" ? "#000" : "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: fontBody, display: "flex", alignItems: "center", gap: 8 }}>
            <I.Discord /> Connect with Discord
          </button>
        </div>
      </nav>

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
          <button onClick={() => setShowAuth(true)} style={{ padding: "14px 32px", borderRadius: 12, border: "none", background: t.accent, color: theme === "dark" ? "#000" : "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: fontBody, display: "flex", alignItems: "center", gap: 10 }}>
            <I.Discord /> Get Started
          </button>
          <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} style={{ padding: "14px 32px", borderRadius: 12, border: `1px solid ${t.border}`, background: "transparent", color: t.textSecondary, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: fontBody, display: "flex", alignItems: "center", gap: 8 }}>
            See How It Works <I.Arrow />
          </button>
        </div>
        <div style={{ display: "flex", gap: 48, justifyContent: "center", marginTop: 80, animation: "fadeUp 0.8s ease 0.5s both", flexWrap: "wrap" }}>
          {[["$69K+", "Order Value Tracked"], ["1,000+", "Orders Placed"], ["12+", "Retailers Supported"], ["99%", "Success Rate"]].map(([v, l], i) => (
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
          {features.map((f, i) => (<div key={i} style={{ padding: "28px 24px", borderRadius: 16, border: `1px solid ${t.border}`, background: t.bgCard }}>
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
        {[["01", "Connect via Discord", "Join the LIVEFAST ACO Discord and verify your membership to access the dashboard."],
          ["02", "Browse Upcoming Drops", "Check the calendar for scheduled drops across Walmart, Target, Pokemon Center, and more."],
          ["03", "Sign Up for Slots", "Reserve your spot on drops you want. Pick the products, we handle the checkout."],
          ["04", "Track Everything", "Watch your orders flow through the dashboard with real-time tracking, analytics, and Discord notifications."],
        ].map(([step, title, desc], i) => (
          <div key={i} style={{ display: "flex", gap: 24, alignItems: "flex-start", padding: "24px 0", borderBottom: i < 3 ? `1px solid ${t.border}` : "none" }}>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: fontY2K, color: t.textTertiary, minWidth: 60 }}>{step}</div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>{title}</h3>
              <p style={{ fontSize: 14, color: t.textSecondary, lineHeight: 1.6 }}>{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 40px", textAlign: "center", borderTop: `1px solid ${t.border}` }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: fontY2K, color: t.textPrimary, marginBottom: 16, letterSpacing: 1 }}>Ready to Go?</h2>
        <p style={{ fontSize: 15, color: t.textSecondary, marginBottom: 32 }}>Connect your Discord to get started.</p>
        <button onClick={() => setShowAuth(true)} style={{ padding: "16px 40px", borderRadius: 12, border: "none", background: t.accent, color: theme === "dark" ? "#000" : "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: fontY2K, letterSpacing: 1, display: "inline-flex", alignItems: "center", gap: 10 }}>
          <I.Discord /> CONNECT WITH DISCORD
        </button>
        <div style={{ fontSize: 11, color: t.textTertiary, marginTop: 16, fontFamily: fontY2K, letterSpacing: 2 }}>LIVEFAST ACO</div>
      </section>

      {/* AUTH MODAL */}
      {showAuth && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: t.overlayBg, backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.2s ease" }} onClick={() => authState === "idle" && setShowAuth(false)}>
          <div style={{ width: 420, background: t.modalBg, borderRadius: 20, border: `1px solid ${t.border}`, padding: 40, boxShadow: t.shadow, animation: "scaleIn 0.25s ease", textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            {authState === "idle" && (<>
              <div style={{ width: 64, height: 64, borderRadius: 16, margin: "0 auto 24px", background: t.logoGrad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontFamily: fontY2K, fontWeight: 800, color: t.logoText }}>LF</div>
              <h3 style={{ fontSize: 22, fontWeight: 700, fontFamily: fontY2K, color: t.textPrimary, marginBottom: 8, letterSpacing: 1 }}>LIVEFAST ACO</h3>
              <p style={{ fontSize: 13, color: t.textSecondary, marginBottom: 32, lineHeight: 1.6 }}>Connect with Discord to access the dashboard. You must have the LIVEFAST ACO role to continue.</p>
              <button onClick={handleAuth} style={{ width: "100%", padding: "14px 24px", borderRadius: 12, border: "none", background: "#5865F2", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <I.Discord /> Continue with Discord
              </button>
              <div style={{ fontSize: 11, color: t.textTertiary, marginTop: 16 }}>Requires LIVEFAST ACO role in Discord</div>
            </>)}
            {authState === "connecting" && (<div style={{ padding: "20px 0" }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, margin: "0 auto 20px", border: `3px solid ${t.border}`, borderTopColor: "#5865F2", animation: "spin 0.8s linear infinite" }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>Connecting to Discord...</h3>
              <p style={{ fontSize: 13, color: t.textSecondary }}>Verifying your role</p>
            </div>)}
            {authState === "success" && (<div style={{ padding: "20px 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, margin: "0 auto 20px", background: t.greenBg, color: t.green, display: "flex", alignItems: "center", justifyContent: "center" }}><I.Check /></div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: t.green, marginBottom: 8 }}>Verified!</h3>
              <p style={{ fontSize: 13, color: t.textSecondary }}>LIVEFAST ACO role confirmed. Redirecting...</p>
            </div>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// DASHBOARD APP
// ============================================================
function DashboardApp({ onLogout }) {
  const { t, theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [modal, setModal] = useState(null);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: I.Dashboard },
    { id: "insights", label: "Insights", icon: I.Insights },
    { id: "tracking", label: "Tracking", icon: I.Tracking },
    { id: "accounts", label: "Accounts", icon: I.Accounts },
    { id: "invoices", label: "Invoices", icon: I.Invoices },
    { id: "calendar", label: "Calendar", icon: I.Calendar },
    { id: "settings", label: "Settings", icon: I.Settings },
    { id: "admin", label: "Admin", icon: I.Admin },
  ];

  const views = { dashboard: DashboardView, insights: InsightsView, tracking: TrackingView, accounts: AccountsView, invoices: InvoicesView, calendar: CalendarView, settings: SettingsView, admin: AdminView };
  const View = views[activeTab] || DashboardView;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <aside style={{ width: 72, minWidth: 72, background: t.bgAlt, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16, gap: 4, transition: "background 0.3s" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: t.logoGrad, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, fontSize: 11, fontFamily: fontY2K, fontWeight: 800, color: t.logoText }}>LF</div>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} title={tab.label} style={{ width: 44, height: 44, borderRadius: 12, border: "none", background: active ? t.sidebarActive : "transparent", color: active ? t.textPrimary : t.textTertiary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s", position: "relative" }}>
              {active && <div style={{ position: "absolute", left: -14, width: 3, height: 20, borderRadius: 2, background: t.sidebarIndicator }} />}
              <Icon />
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <button onClick={toggleTheme} title={theme === "dark" ? "Light mode" : "Dark mode"} style={{ width: 44, height: 44, borderRadius: 12, border: "none", background: "transparent", color: t.textTertiary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          {theme === "dark" ? <I.Sun /> : <I.Moon />}
        </button>
        <button onClick={onLogout} title="Logout" style={{ width: 44, height: 44, borderRadius: 12, border: "none", background: "transparent", color: t.textTertiary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 16 }}>
          <I.Logout />
        </button>
      </aside>
      <main style={{ flex: 1, overflow: "auto", position: "relative" }}>
        <div style={{ position: "fixed", top: 0, left: 72, right: 0, bottom: 0, pointerEvents: "none", zIndex: 100, background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${t.scanline} 2px, ${t.scanline} 4px)` }} />
        <View setModal={setModal} />
      </main>
      {modal && <ModalRouter modal={modal} setModal={setModal} />}
    </div>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
function CW({ children }) { return <div style={{ padding: "32px 36px", maxWidth: 1300 }}>{children}</div>; }

function PH({ title, subtitle, children }) {
  const { t } = useTheme();
  return (<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, animation: "fadeIn 0.4s ease" }}>
    <div><h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: fontY2K, color: t.textPrimary, letterSpacing: 1, textTransform: "uppercase" }}>{title}</h1>
    {subtitle && <p style={{ fontSize: 13, color: t.textSecondary, marginTop: 4 }}>{subtitle}</p>}</div>
    {children && <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{children}</div>}
  </div>);
}

function Hero({ children }) {
  const { t } = useTheme();
  return (<div style={{ background: t.heroGrad, border: `1px solid ${t.border}`, borderRadius: 16, padding: "28px 32px", position: "relative", overflow: "hidden", marginBottom: 24, animation: "fadeIn 0.5s ease" }}>
    <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${t.gridLine} 1px, transparent 1px), linear-gradient(90deg, ${t.gridLine} 1px, transparent 1px)`, backgroundSize: "40px 40px" }} />
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${t.heroLine}, transparent)` }} />
    <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
  </div>);
}

function SC({ label, value, sub, color, delay = 0 }) {
  const { t } = useTheme();
  return (<div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 180, animation: `fadeIn 0.5s ease ${delay}s both` }}>
    <div style={{ fontSize: 10, fontFamily: fontY2K, letterSpacing: 2, color: t.textSecondary, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 28, fontWeight: 700, fontFamily: fontY2K, color: color || t.textPrimary }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: t.textTertiary, marginTop: 4 }}>{sub}</div>}
  </div>);
}

function Btn({ children, variant = "default", onClick }) {
  const { t, theme } = useTheme();
  const s = variant === "primary" ? { background: t.accent, color: theme === "dark" ? "#000" : "#fff", border: `1px solid ${t.accent}` } : { background: t.bgElevated, color: t.text, border: `1px solid ${t.border}` };
  return <button onClick={onClick} style={{ padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s", fontFamily: fontBody, ...s }}>{children}</button>;
}

function SB({ status }) {
  const { t } = useTheme();
  const c = { "Paid": [t.greenBg, t.green], "Pending": [t.yellowBg, t.yellow], "Overdue": [t.redBg, t.red], "Active": [t.greenBg, t.green], "Paused": [t.yellowBg, t.yellow], "In Transit": [t.blueBg, t.blue], "Delivered": [t.cyanBg, t.cyan], "Delayed": [t.redBg, t.red], "Live": [t.greenBg, t.green], "Full": [t.redBg, t.red], "Open": [t.greenBg, t.green] }[status] || [t.badgeBg, t.textSecondary];
  return <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: fontY2K, letterSpacing: 0.5, background: c[0], color: c[1] }}>{status}</span>;
}

function TB({ tabs: tl, active, onSelect }) {
  const { t } = useTheme();
  return (<div style={{ display: "flex", gap: 4, background: t.bgElevated, borderRadius: 10, padding: 4, marginBottom: 20 }}>
    {tl.map((tab) => (<button key={tab} onClick={() => onSelect(tab)} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: active === tab ? t.accentBg : "transparent", color: active === tab ? t.textPrimary : t.textSecondary, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: fontBody }}>{tab}</button>))}
  </div>);
}

function LR({ children, onClick, delay = 0 }) {
  const { t } = useTheme();
  const [h, setH] = useState(false);
  return (<div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: h ? t.bgCardHover : t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, animation: `fadeIn 0.4s ease ${delay}s both`, cursor: onClick ? "pointer" : "default", transition: "background 0.15s" }}>{children}</div>);
}

function TF({ value, onChange }) {
  const { t } = useTheme();
  return (<div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
    {["1D","7D","30D","90D","YTD","1Y","All"].map(f => (<button key={f} onClick={() => onChange(f)} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${value===f ? t.borderActive : t.border}`, background: value===f ? t.accentBg : "transparent", color: value===f ? t.textPrimary : t.textSecondary, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: fontBody }}>{f}</button>))}
  </div>);
}

// ============================================================
// MODAL SYSTEM
// ============================================================
function ModalRouter({ modal, setModal }) {
  const { t } = useTheme();
  const close = () => setModal(null);
  const widths = { productDetail: 560, confirmDrop: 440, newInvoice: 500, trackingDetail: 500, newDrop: 520 };
  return (<div style={{ position: "fixed", inset: 0, zIndex: 200, background: t.overlayBg, backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeIn 0.15s ease" }} onClick={close}>
    <div style={{ width: widths[modal.type] || 460, maxHeight: "85vh", overflowY: "auto", background: t.modalBg, borderRadius: 20, border: `1px solid ${t.border}`, boxShadow: t.shadow, animation: "scaleIn 0.2s ease" }} onClick={e => e.stopPropagation()}>
      {modal.type === "productDetail" && <ProductDetailModal data={modal.data} onClose={close} />}
      {modal.type === "confirmDrop" && <ConfirmDropModal data={modal.data} onClose={close} />}
      {modal.type === "newInvoice" && <NewInvoiceModal onClose={close} />}
      {modal.type === "trackingDetail" && <TrackingDetailModal data={modal.data} onClose={close} />}
      {modal.type === "newDrop" && <NewDropModal onClose={close} />}
      {modal.type === "addTracking" && <AddTrackingModal onClose={close} />}
      {modal.type === "connectAccount" && <ConnectAccountModal onClose={close} />}
      {modal.type === "notification" && <NotificationModal onClose={close} />}
    </div>
  </div>);
}

function MH({ title, onClose }) {
  const { t } = useTheme();
  return (<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${t.border}` }}>
    <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: fontY2K, color: t.textPrimary, letterSpacing: 1 }}>{title}</h3>
    <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${t.border}`, background: "transparent", color: t.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><I.Close /></button>
  </div>);
}

function MI({ label, placeholder, value, onChange, type = "text" }) {
  const { t } = useTheme();
  return (<div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 10, fontFamily: fontY2K, letterSpacing: 2, color: t.textSecondary, textTransform: "uppercase", marginBottom: 6 }}>{label}</label>
    <input type={type} placeholder={placeholder} value={value || ""} onChange={onChange} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.bgInput, color: t.textPrimary, fontSize: 13, fontFamily: fontBody }} />
  </div>);
}

function MB({ children, variant = "default", onClick, full = false }) {
  const { t, theme } = useTheme();
  const s = variant === "primary" ? { background: t.accent, color: theme === "dark" ? "#000" : "#fff", border: `1px solid ${t.accent}` } : variant === "danger" ? { background: t.redBg, color: t.red, border: `1px solid ${t.red}30` } : { background: t.bgElevated, color: t.text, border: `1px solid ${t.border}` };
  return <button onClick={onClick} style={{ padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: fontBody, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: full ? "100%" : "auto", ...s }}>{children}</button>;
}

function MS({ label, value }) {
  const { t } = useTheme();
  return (<div style={{ padding: "12px 14px", borderRadius: 10, background: t.bgCard, border: `1px solid ${t.border}` }}>
    <div style={{ fontSize: 10, fontFamily: fontY2K, letterSpacing: 2, color: t.textSecondary, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: fontY2K, color: t.textPrimary }}>{value}</div>
  </div>);
}

// --- MODAL IMPLEMENTATIONS ---
function ProductDetailModal({ data, onClose }) {
  const { t } = useTheme();
  return (<><MH title="Product Details" onClose={onClose} /><div style={{ padding: 24 }}>
    <h4 style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, marginBottom: 16 }}>{data.name}</h4>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
      <MS label="Total Spent" value={`$${data.total.toLocaleString()}`} /><MS label="Avg Price" value={`$${data.avg}`} />
      <MS label="Total Units" value={data.units.toString()} /><MS label="Orders" value={data.orders.toString()} />
    </div>
    <div style={{ padding: "14px 16px", borderRadius: 10, background: t.bgCard, border: `1px solid ${t.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontFamily: fontY2K, letterSpacing: 2, color: t.textSecondary }}>FULFILLED</span>
        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: fontY2K, color: t.textPrimary }}>{data.fulfilled}%</span>
      </div>
      <div style={{ width: "100%", height: 6, borderRadius: 3, background: t.bgElevated }}>
        <div style={{ width: `${data.fulfilled}%`, height: "100%", borderRadius: 3, background: data.fulfilled >= 80 ? t.green : data.fulfilled >= 50 ? t.yellow : t.red }} />
      </div>
    </div>
  </div></>);
}

function ConfirmDropModal({ data, onClose }) {
  const { t } = useTheme();
  const [ok, setOk] = useState(false);
  return (<><MH title={ok ? "Confirmed!" : "Sign Up for Drop"} onClose={onClose} /><div style={{ padding: 24 }}>
    {!ok ? (<>
      <h4 style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>{data.title}</h4>
      <p style={{ fontSize: 13, color: t.textSecondary, marginBottom: 6 }}>{data.products}</p>
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>{[data.date, data.time, data.retailer].map((v,i) => <span key={i} style={{ fontSize: 12, color: t.textSecondary }}>{v}</span>)}</div>
      <p style={{ fontSize: 13, color: t.textSecondary, marginBottom: 20 }}>Slots: {data.filled}/{data.slots} filled. By signing up, you confirm you want checkout service for this drop.</p>
      <div style={{ display: "flex", gap: 10 }}><MB variant="primary" onClick={() => setOk(true)} full>Confirm Sign Up</MB><MB onClick={onClose}>Cancel</MB></div>
    </>) : (<div style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, margin: "0 auto 16px", background: t.greenBg, color: t.green, display: "flex", alignItems: "center", justifyContent: "center" }}><I.Check /></div>
      <h4 style={{ fontSize: 16, fontWeight: 600, color: t.green, marginBottom: 8 }}>You're in!</h4>
      <p style={{ fontSize: 13, color: t.textSecondary }}>You've been signed up for {data.title}. We'll notify you on Discord before the drop.</p>
    </div>)}
  </div></>);
}

function NewInvoiceModal({ onClose }) {
  const { t } = useTheme();
  const [form, setForm] = useState({ client: "", amount: "", notes: "" });
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  return (<><MH title="New Invoice" onClose={onClose} /><div style={{ padding: 24 }}>
    <MI label="Client" placeholder="Client name" value={form.client} onChange={set("client")} />
    <MI label="Amount" placeholder="0.00" value={form.amount} onChange={set("amount")} type="number" />
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 10, fontFamily: fontY2K, letterSpacing: 2, color: t.textSecondary, textTransform: "uppercase", marginBottom: 6 }}>Notes</label>
      <textarea placeholder="Invoice notes..." value={form.notes} onChange={set("notes")} rows={3} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.bgInput, color: t.textPrimary, fontSize: 13, fontFamily: fontBody, resize: "vertical" }} />
    </div>
    {form.amount && <div style={{ padding: "12px 16px", borderRadius: 10, background: t.bgCard, border: `1px solid ${t.border}`, marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: t.textSecondary, marginBottom: 4 }}>PAS Fee (18%)</div>
      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: fontY2K, color: t.textPrimary }}>${(parseFloat(form.amount || 0) * 0.18).toFixed(2)}</div>
    </div>}
    <div style={{ display: "flex", gap: 10 }}><MB variant="primary" onClick={onClose} full>Create Invoice</MB><MB onClick={onClose}>Cancel</MB></div>
  </div></>);
}

function TrackingDetailModal({ data, onClose }) {
  const { t } = useTheme();
  return (<><MH title="Tracking Details" onClose={onClose} /><div style={{ padding: 24 }}>
    <div style={{ padding: "16px 18px", borderRadius: 12, background: t.bgCard, border: `1px solid ${t.border}`, marginBottom: 16 }}>
      <div style={{ marginBottom: 10 }}><SB status={data.status} /></div>
      <h4 style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary, marginBottom: 4 }}>{data.product}</h4>
      <div style={{ fontSize: 12, color: t.textSecondary }}>{data.carrier} / {data.order}</div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
      <MS label="Retailer" value={data.retailer} /><MS label="Date" value={data.date} />
      <MS label="Carrier" value={data.carrier} /><MS label="ETA" value={data.eta} />
    </div>
    <div style={{ display: "flex", gap: 10 }}><MB variant="primary" full>Track on {data.carrier}</MB><MB>Copy Tracking</MB></div>
  </div></>);
}

function NewDropModal({ onClose }) {
  const { t } = useTheme();
  const [form, setForm] = useState({ title: "", date: "", time: "", retailer: "", products: "", slots: "" });
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  return (<><MH title="Schedule Drop" onClose={onClose} /><div style={{ padding: 24 }}>
    <MI label="Title" placeholder="e.g. Walmart Wednesday - Mega Evo" value={form.title} onChange={set("title")} />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <MI label="Date" placeholder="2026-05-20" value={form.date} onChange={set("date")} type="date" />
      <MI label="Time" placeholder="12:00 PM ET" value={form.time} onChange={set("time")} />
    </div>
    <MI label="Retailer" placeholder="Walmart, Target, etc." value={form.retailer} onChange={set("retailer")} />
    <MI label="Products" placeholder="Products included" value={form.products} onChange={set("products")} />
    <MI label="Slots" placeholder="Number of slots" value={form.slots} onChange={set("slots")} type="number" />
    <div style={{ display: "flex", gap: 10 }}><MB variant="primary" onClick={onClose} full>Schedule Drop</MB><MB onClick={onClose}>Cancel</MB></div>
  </div></>);
}

function AddTrackingModal({ onClose }) {
  return (<><MH title="Add Tracking" onClose={onClose} /><div style={{ padding: 24 }}>
    <MI label="Tracking Number" placeholder="1ZW..." /><MI label="Carrier" placeholder="UPS, FedEx, USPS" />
    <MI label="Product Name" placeholder="Product being tracked" /><MI label="Retailer" placeholder="Where was it ordered?" />
    <div style={{ display: "flex", gap: 10 }}><MB variant="primary" onClick={onClose} full>Add Tracking</MB><MB onClick={onClose}>Cancel</MB></div>
  </div></>);
}

function ConnectAccountModal({ onClose }) {
  const { t } = useTheme();
  return (<><MH title="Connect Account" onClose={onClose} /><div style={{ padding: 24 }}>
    <button style={{ width: "100%", padding: "14px 20px", borderRadius: 12, border: `1px solid ${t.border}`, background: t.bgCard, color: t.textPrimary, cursor: "pointer", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 12, marginBottom: 12, fontFamily: fontBody }}>
      <span style={{ fontSize: 18 }}>G</span> Sign in with Google
    </button>
    <div style={{ textAlign: "center", fontSize: 12, color: t.textTertiary, margin: "12px 0" }}>or</div>
    <MI label="Email" placeholder="your@email.com" /><MI label="IMAP Server" placeholder="imap.mail.me.com" />
    <MI label="Port" placeholder="993" /><MI label="App Password" placeholder="••••••••" type="password" />
    <div style={{ display: "flex", gap: 10 }}><MB variant="primary" onClick={onClose} full>Connect via IMAP</MB><MB onClick={onClose}>Cancel</MB></div>
  </div></>);
}

function NotificationModal({ onClose }) {
  const { t } = useTheme();
  return (<><MH title="Notifications" onClose={onClose} /><div style={{ padding: 16 }}>
    {[["Order delivered: Pokemon Mega Evo Booster Bundle", "2m ago"], ["New order placed: SV Prismatic ETB x2", "15m ago"], ["Tracking delayed: Pokemon SV Booster Bundle", "1h ago"]].map(([text, time], i) => (
      <div key={i} style={{ padding: "14px 16px", borderRadius: 10, border: `1px solid ${t.border}`, background: t.bgCard, marginBottom: 8 }}>
        <div style={{ fontSize: 13, color: t.textPrimary, marginBottom: 4 }}>{text}</div>
        <div style={{ fontSize: 11, color: t.textTertiary }}>{time}</div>
      </div>
    ))}
  </div></>);
}

// ============================================================
// VIEWS
// ============================================================
function DashboardView({ setModal }) {
  const { t } = useTheme();
  const [tf, setTf] = useState("All");
  return (<CW><PH title="Dashboard" subtitle="1,026 orders tracked"><Btn onClick={() => setModal({ type: "notification" })}><I.Bell /> <span style={{ fontSize: 11 }}>3</span></Btn></PH>
    <Hero>
      <div style={{ fontSize: 10, fontFamily: fontY2K, letterSpacing: 2, color: t.textSecondary, textTransform: "uppercase", marginBottom: 8 }}>Total Spend / Lifetime</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
        <div><div style={{ fontSize: 48, fontWeight: 800, fontFamily: fontY2K, color: t.textPrimary }}>$69,697<span style={{ fontSize: 24, color: t.textSecondary }}>.83</span></div>
        <div style={{ fontSize: 13, color: t.textSecondary, marginTop: 4 }}>1,026 orders / avg $67.93</div></div>
        <div style={{ display: "flex", gap: 32 }}>
          {[["Orders","1,026"],["Quantity","1,399"],["Fulfillment","49.1%"]].map(([l,v]) => (<div key={l} style={{ textAlign: "center" }}><div style={{ fontSize: 10, fontFamily: fontY2K, letterSpacing: 2, color: t.textSecondary, textTransform: "uppercase" }}>{l}</div><div style={{ fontSize: 28, fontWeight: 700, fontFamily: fontY2K, color: t.textPrimary }}>{v}</div></div>))}
        </div>
      </div>
    </Hero>
    <TF value={tf} onChange={setTf} />
    <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
      <SC label="Active" value="504" sub="49.1% active" color={t.green} delay={0.1} />
      <SC label="Delivered" value="460" sub="2 shipped" color={t.cyan} delay={0.15} />
      <SC label="Cancelled" value="522" sub="50.9% of orders" color={t.red} delay={0.2} />
      <SC label="Biggest Day" value="$6,881.53" sub="Mar 25" delay={0.25} />
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600 }}>Top Products</h2>
      <span style={{ fontSize: 12, color: t.textTertiary, cursor: "pointer" }}>View all →</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {mockProducts.map((p, i) => (<LR key={i} onClick={() => setModal({ type: "productDetail", data: p })} delay={0.1*i}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: t.bgElevated, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontFamily: fontY2K, fontWeight: 700, color: t.textSecondary, flexShrink: 0 }}>{i+1}</div>
          <div style={{ minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 500, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 400 }}>{p.name}</div>
          <div style={{ fontSize: 11, color: t.textTertiary, marginTop: 2 }}>{p.orders} orders / {p.units} units / ${p.avg} avg</div></div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, fontFamily: fontY2K, color: t.textPrimary }}>${p.total.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: p.fulfilled >= 80 ? t.green : p.fulfilled >= 50 ? t.yellow : t.red, marginTop: 2 }}>{p.fulfilled}% fulfilled</div>
        </div>
      </LR>))}
    </div>
  </CW>);
}

function InsightsView({ setModal }) {
  const { t } = useTheme();
  const [tf, setTf] = useState("All");
  return (<CW><PH title="Insights" subtitle="1,026 orders / $69,697.83 total spend" />
    <TB tabs={["Overview","Accounts"]} active="Overview" onSelect={() => {}} />
    <TF value={tf} onChange={setTf} />
    <Hero>
      <div style={{ fontSize: 10, fontFamily: fontY2K, letterSpacing: 2, color: t.textSecondary, textTransform: "uppercase", marginBottom: 8 }}>Total Spend / Lifetime</div>
      <div style={{ fontSize: 48, fontWeight: 800, fontFamily: fontY2K, color: t.textPrimary }}>$69,697<span style={{ fontSize: 24, color: t.textSecondary }}>.83</span></div>
      <div style={{ fontSize: 13, color: t.textSecondary, marginTop: 4 }}>1,026 orders / avg $67.93</div>
      <div style={{ display: "flex", gap: 4, alignItems: "flex-end", marginTop: 20, height: 40 }}>
        {[35,20,15,25,18,22,30,28,45,38,20,60].map((v,i) => (<div key={i} style={{ flex: 1, height: `${v}px`, borderRadius: 3, background: i===11 ? t.accent+"80" : t.accentBg, transition: "height 0.3s" }} />))}
      </div>
    </Hero>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <SC label="Avg Order" value="$67.93" delay={0.1} /><SC label="Orders" value="1,026" delay={0.15} />
      <SC label="Biggest Period" value="$6,881.53" sub="Mar 25" delay={0.2} /><SC label="Retailers" value="12" sub="Top: Target" delay={0.25} />
    </div>
  </CW>);
}

function TrackingView({ setModal }) {
  const { t } = useTheme();
  const [filter, setFilter] = useState("All");
  const counts = { "All": 477, "In Transit": 2, "Out for Delivery": 0, "Delivered": 468, "Late": 2 };
  return (<CW><PH title="Tracking" subtitle="477 packages / 2 in transit, 468 delivered">
    <Btn><I.Export /> Export</Btn><Btn variant="primary" onClick={() => setModal({ type: "addTracking" })}><I.Plus /> Add Tracking</Btn><Btn><I.Refresh /> Refresh</Btn>
  </PH>
    <Hero>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><span style={{ fontSize: 10, fontFamily: fontY2K, letterSpacing: 2, color: t.textSecondary, textTransform: "uppercase" }}>In Transit</span><SB status="Live" /></div>
          <div style={{ fontSize: 48, fontWeight: 800, fontFamily: fontY2K, color: t.textPrimary }}>2</div>
          <div style={{ fontSize: 12, color: t.textTertiary, marginTop: 4 }}>0 arriving today / 2 running late</div>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {[["Delivered","468","completed"],["Late","2","needs attention"],["Carriers","4","UPS / FedEx / USPS"]].map(([l,v,s]) => (<div key={l} style={{ textAlign: "center" }}><div style={{ fontSize: 10, fontFamily: fontY2K, letterSpacing: 2, color: t.textSecondary, textTransform: "uppercase" }}>{l}</div><div style={{ fontSize: 28, fontWeight: 700, fontFamily: fontY2K, color: l==="Late" ? t.red : t.textPrimary }}>{v}</div><div style={{ fontSize: 11, color: t.textTertiary }}>{s}</div></div>))}
        </div>
      </div>
    </Hero>
    <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
      {Object.entries(counts).map(([l,c]) => (<button key={l} onClick={() => setFilter(l)} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${filter===l ? t.borderActive : t.border}`, background: filter===l ? t.accentBg : "transparent", color: filter===l ? t.textPrimary : t.textSecondary, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: fontBody, display: "flex", alignItems: "center", gap: 6 }}>{l} <span style={{ fontSize: 10, opacity: 0.6 }}>{c}</span></button>))}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {mockTracking.map((p, i) => (<LR key={i} onClick={() => setModal({ type: "trackingDetail", data: p })} delay={0.08*i}>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 500, color: t.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 450 }}>{p.product}</div>
        <div style={{ fontSize: 11, color: t.textTertiary, marginTop: 3 }}>{p.order} / {p.retailer} / {p.carrier} / {p.date}</div></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}><SB status={p.status} /><span style={{ fontSize: 12, color: t.textSecondary }}>{p.eta}</span></div>
      </LR>))}
    </div>
  </CW>);
}

function AccountsView({ setModal }) {
  const { t } = useTheme();
  return (<CW><PH title="Accounts" subtitle="5 accounts / 5 live"><Btn><I.Refresh /> Run Sync</Btn></PH>
    <Hero>
      <div style={{ fontSize: 10, fontFamily: fontY2K, letterSpacing: 2, color: t.textSecondary, textTransform: "uppercase", marginBottom: 8 }}>Email Sync</div>
      <div style={{ fontSize: 48, fontWeight: 800, fontFamily: fontY2K, color: t.textPrimary }}>5 <span style={{ fontSize: 20, fontWeight: 400, color: t.textSecondary }}>accounts</span></div>
      <div style={{ fontSize: 13, color: t.textSecondary, marginTop: 4 }}>5 live / tap any account to sync</div>
    </Hero>
    <div onClick={() => setModal({ type: "connectAccount" })} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, marginBottom: 20, cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: t.bgElevated, display: "flex", alignItems: "center", justifyContent: "center", color: t.textSecondary }}><I.Plus /></div>
        <div><div style={{ fontSize: 14, fontWeight: 500, color: t.textPrimary }}>Connect an account</div><div style={{ fontSize: 12, color: t.textTertiary }}>Gmail, Outlook, or custom IMAP</div></div>
      </div><span style={{ color: t.textTertiary }}>→</span>
    </div>
    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: t.textPrimary }}>Connected <span style={{ fontSize: 12, color: t.textTertiary, fontWeight: 400 }}>{mockAccounts.length}</span></h3>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {mockAccounts.map((a, i) => (<LR key={i} delay={0.08*i}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: a.type==="Gmail" ? t.blueBg : t.bgElevated, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: a.type==="Gmail" ? t.blue : t.textSecondary }}>{a.type==="Gmail" ? "G" : "IM"}</div>
          <div><div style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{a.email}</div><div style={{ fontSize: 11, color: t.textTertiary }}>{a.type}</div></div>
        </div><SB status="Live" />
      </LR>))}
    </div>
  </CW>);
}

function InvoicesView({ setModal }) {
  const { t } = useTheme();
  const [filter, setFilter] = useState("All");
  const tP = mockInvoices.filter(i=>i.status==="Paid").reduce((a,b)=>a+b.amount,0);
  const tPe = mockInvoices.filter(i=>i.status==="Pending").reduce((a,b)=>a+b.amount,0);
  const tO = mockInvoices.filter(i=>i.status==="Overdue").reduce((a,b)=>a+b.amount,0);
  const filtered = filter==="All" ? mockInvoices : mockInvoices.filter(i=>i.status===filter);
  return (<CW><PH title="Invoices" subtitle={`${mockInvoices.length} invoices / $${mockInvoices.reduce((a,b)=>a+b.amount,0).toLocaleString()} total`}>
    <Btn variant="primary" onClick={() => setModal({ type: "newInvoice" })}><I.Plus /> New Invoice</Btn><Btn><I.Export /> Export</Btn>
  </PH>
    <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
      <SC label="Paid" value={`$${tP.toLocaleString()}`} color={t.green} delay={0.1} />
      <SC label="Pending" value={`$${tPe.toLocaleString()}`} color={t.yellow} delay={0.15} />
      <SC label="Overdue" value={`$${tO.toLocaleString()}`} color={t.red} delay={0.2} />
      <SC label="PAS Fees" value={`$${mockInvoices.reduce((a,b)=>a+b.fee,0).toLocaleString()}`} delay={0.25} />
    </div>
    <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
      {["All","Paid","Pending","Overdue"].map(f => (<button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${filter===f ? t.borderActive : t.border}`, background: filter===f ? t.accentBg : "transparent", color: filter===f ? t.textPrimary : t.textSecondary, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: fontBody }}>{f}</button>))}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {filtered.map((inv, i) => (<LR key={i} delay={0.08*i}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1 }}>
          <div style={{ fontSize: 12, fontFamily: fontY2K, fontWeight: 600, color: t.textSecondary, minWidth: 110 }}>{inv.id}</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{inv.client}</div><div style={{ fontSize: 11, color: t.textTertiary, marginTop: 2 }}>Issued {inv.date} / Due {inv.dueDate}</div></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}><div style={{ fontSize: 15, fontWeight: 600, fontFamily: fontY2K, color: t.textPrimary }}>${inv.amount.toLocaleString()}</div><div style={{ fontSize: 11, color: t.textTertiary }}>Fee: ${inv.fee.toLocaleString()}</div></div>
          <SB status={inv.status} />
        </div>
      </LR>))}
    </div>
  </CW>);
}

function CalendarView({ setModal }) {
  const { t } = useTheme();
  return (<CW><PH title="Calendar" subtitle="Upcoming drops and events"><Btn variant="primary" onClick={() => setModal({ type: "newDrop" })}><I.Plus /> Schedule Drop</Btn></PH>
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {mockDrops.map((d, i) => {
        const full = d.filled >= d.slots;
        return (<div key={d.id} style={{ padding: "20px 24px", background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, animation: `fadeIn 0.4s ease ${0.1*i}s both`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: `${(d.filled/d.slots)*100}%`, height: 2, background: full ? t.red+"99" : t.accent+"40" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div style={{ flex: 1, minWidth: 250 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: t.textPrimary }}>{d.title}</h3>
                <SB status={full ? "Full" : "Open"} />
                {d.signedUp && <span style={{ fontSize: 11, color: t.green, fontFamily: fontY2K }}>SIGNED UP</span>}
              </div>
              <div style={{ fontSize: 12, color: t.textSecondary, marginBottom: 4 }}>{d.products}</div>
              <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                {[["DATE",d.date],["TIME",d.time],["RETAILER",d.retailer]].map(([l,v]) => (<div key={l} style={{ fontSize: 12, color: t.textSecondary }}><span style={{ fontFamily: fontY2K, fontSize: 10, letterSpacing: 1, color: t.textTertiary }}>{l} </span>{v}</div>))}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: fontY2K, color: t.textPrimary }}>{d.filled}<span style={{ fontSize: 14, color: t.textTertiary }}>/{d.slots}</span></div>
              <div style={{ fontSize: 11, color: t.textSecondary }}>slots filled</div>
              {!full && !d.signedUp && <button onClick={() => setModal({ type: "confirmDrop", data: d })} style={{ marginTop: 10, padding: "6px 16px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bgElevated, color: t.textPrimary, fontSize: 12, cursor: "pointer", fontFamily: fontBody }}>Sign Up</button>}
            </div>
          </div>
        </div>);
      })}
    </div>
  </CW>);
}

function SettingsView({ setModal }) {
  const { t, theme, toggleTheme } = useTheme();
  const [notifs, setNotifs] = useState({ newOrder: true, shipped: true, delivered: true, cancelled: true });
  return (<CW><PH title="Settings" subtitle="Manage integrations and preferences" />
    <div style={{ padding: "20px 24px", background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: t.logoGrad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, fontFamily: fontY2K, color: t.logoText }}>H</div>
        <div><div style={{ fontSize: 16, fontWeight: 600, color: t.textPrimary }}>hunterdkeeter</div><div style={{ fontSize: 12, color: t.textSecondary }}>hunterdkeeter@gmail.com</div><div style={{ fontSize: 11, color: t.textTertiary, marginTop: 2 }}>Connected via Discord</div></div>
      </div>
    </div>
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 10, fontFamily: fontY2K, letterSpacing: 2, color: t.textSecondary, textTransform: "uppercase", marginBottom: 12 }}>Appearance</h3>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: t.textPrimary }}>Theme</span>
        <div onClick={toggleTheme} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, background: t.bgElevated, border: `1px solid ${t.border}`, cursor: "pointer" }}>
          {theme==="dark" ? <I.Moon /> : <I.Sun />}<span style={{ fontSize: 12, color: t.textSecondary }}>{theme==="dark" ? "Dark" : "Light"}</span>
        </div>
      </div>
    </div>
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 10, fontFamily: fontY2K, letterSpacing: 2, color: t.textSecondary, textTransform: "uppercase", marginBottom: 12 }}>Live Tracking</h3>
      <div style={{ padding: "16px 20px", background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12 }}>
        <div style={{ fontSize: 13, color: t.textSecondary, marginBottom: 12 }}>Automatic tracking updates from carrier APIs.</div>
        <div style={{ display: "flex", gap: 8 }}>{["FedEx","UPS","USPS"].map(c => <SB key={c} status="Live" />)}</div>
      </div>
    </div>
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 10, fontFamily: fontY2K, letterSpacing: 2, color: t.textSecondary, textTransform: "uppercase", marginBottom: 12 }}>Discord</h3>
      <div style={{ padding: "16px 20px", background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}><span style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary }}>Webhook</span><SB status="Active" /></div>
        <input readOnly value="https://discord.com/api/webhooks/..." style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bgInput, color: t.textSecondary, fontSize: 12, fontFamily: fontMono }} />
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}><Btn variant="primary">Save Webhook</Btn><Btn>Send Test</Btn></div>
      </div>
    </div>
    <div>
      <h3 style={{ fontSize: 10, fontFamily: fontY2K, letterSpacing: 2, color: t.textSecondary, textTransform: "uppercase", marginBottom: 12 }}>Notifications</h3>
      {Object.entries(notifs).map(([k, v]) => (<div key={k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 12, marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: t.textPrimary, textTransform: "capitalize" }}>{k.replace(/([A-Z])/g, " $1")}</span>
        <div onClick={() => setNotifs(p => ({ ...p, [k]: !p[k] }))} style={{ width: 44, height: 24, borderRadius: 12, background: v ? t.greenBg : t.toggleBg, cursor: "pointer", position: "relative", transition: "background 0.2s", border: `1px solid ${v ? t.green+"40" : t.border}` }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: v ? t.green : t.textTertiary, position: "absolute", top: 2, left: v ? 23 : 2, transition: "left 0.2s, background 0.2s" }} />
        </div>
      </div>))}
    </div>
  </CW>);
}

function AdminView({ setModal }) {
  const { t } = useTheme();
  const [tab, setTab] = useState("Members");
  const tierC = { Gold: [t.yellowBg, t.yellow], Silver: [t.badgeBg, t.textSecondary], Bronze: ["rgba(205,127,50,0.1)", "#cd7f32"] };
  return (<CW><PH title="Admin Panel" subtitle="Manage members, invoices, and drops" />
    <TB tabs={["Members","Invoices","Drops","Overview"]} active={tab} onSelect={setTab} />
    {tab === "Overview" && <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <SC label="Active Members" value={mockMembers.filter(m=>m.status==="Active").length.toString()} color={t.green} delay={0.1} />
      <SC label="Total Revenue" value="$46,550" delay={0.15} />
      <SC label="Pending Invoices" value={mockInvoices.filter(i=>i.status==="Pending").length.toString()} color={t.yellow} delay={0.2} />
      <SC label="Upcoming Drops" value={mockDrops.length.toString()} color={t.blue} delay={0.25} />
    </div>}
    {tab === "Members" && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {mockMembers.map((m, i) => (<LR key={i} delay={0.08*i}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: t.bgElevated, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, fontFamily: fontY2K, color: t.textSecondary }}>{m.name.charAt(0)}</div>
          <div><div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{m.name}</div><div style={{ fontSize: 11, color: t.textTertiary }}>{m.email} / Joined {m.joined}</div></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: fontY2K, background: tierC[m.tier][0], color: tierC[m.tier][1] }}>{m.tier}</span>
          <div style={{ textAlign: "right", minWidth: 100 }}><div style={{ fontSize: 14, fontWeight: 600, fontFamily: fontY2K, color: t.textPrimary }}>${m.totalSpend.toLocaleString()}</div><div style={{ fontSize: 11, color: t.textTertiary }}>total spend</div></div>
          <SB status={m.status} />
        </div>
      </LR>))}
    </div>}
    {tab === "Invoices" && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {mockInvoices.map((inv, i) => (<LR key={i} delay={0.08*i}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
          <span style={{ fontSize: 12, fontFamily: fontY2K, color: t.textSecondary, minWidth: 110 }}>{inv.id}</span>
          <div><div style={{ fontSize: 13, fontWeight: 500, color: t.text }}>{inv.client}</div><div style={{ fontSize: 11, color: t.textTertiary }}>Due {inv.dueDate}</div></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, fontFamily: fontY2K, color: t.textPrimary }}>${inv.amount.toLocaleString()}</span><SB status={inv.status} /><Btn>Manage</Btn>
        </div>
      </LR>))}
    </div>}
    {tab === "Drops" && <>
      <div style={{ marginBottom: 16 }}><Btn variant="primary" onClick={() => setModal({ type: "newDrop" })}><I.Plus /> New Drop</Btn></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {mockDrops.map((d, i) => (<LR key={d.id} delay={0.08*i}>
          <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 500, color: t.text }}>{d.title}</div><div style={{ fontSize: 12, color: t.textTertiary, marginTop: 4 }}>{d.date} at {d.time} / {d.retailer}</div></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, fontFamily: fontY2K, fontWeight: 600, color: t.textPrimary }}>{d.filled}/{d.slots}</span><SB status={d.filled >= d.slots ? "Full" : "Open"} /><Btn>Edit</Btn>
          </div>
        </LR>))}
      </div>
    </>}
  </CW>);
}
