/* global React, ReactDOM, BrowserChrome, AdSidebar, AdTopBar,
   V3_1_Ops, V3_2_Triage, V3_3_Safety, V3_4_Ledger, V3_5_Krafts, V3_6_Settings, AdBtn, Pill */
const { useState, useEffect, useLayoutEffect, useRef } = React;

const NAV = [
  { id: "v1", icon: "layout-dashboard", label: "Regional Ops" },
  { id: "v2", icon: "broadcast", label: "Triage Desk", badge: "3" },
  { id: "v3", icon: "shield-half", label: "Safety & Hygiene", badge: "3" },
  { id: "v4", icon: "users-group", label: "Pro Ledger" },
  { id: "v5", icon: "photo-check", label: "Kraft Verification", badge: "2" },
  { id: "v6", icon: "settings", label: "Node Settings" },
];
const VIEWS = { v1: V3_1_Ops, v2: V3_2_Triage, v3: V3_3_Safety, v4: V3_4_Ledger, v5: V3_5_Krafts, v6: V3_6_Settings };
const META = {
  v1: ["3.1 · Regional Core Ops", "Live command center for node southwest-us-04"],
  v2: ["3.2 · Cross-Channel Triage Desk", "Dispatch unrouted emergencies over SMS + WhatsApp"],
  v3: ["3.3 · Safety & Hygiene", "Verification compliance and dispute moderation"],
  v4: ["3.4 · Pro Ledger", "142 active tradespeople in this node"],
  v5: ["3.5 · Kraft Verification", "Enforce the mandatory After photo + invoice rule"],
  v6: ["3.6 · Node Settings & Billing", "Configuration and the node revenue ledger"],
};

function useScale(w0, h0) {
  const ref = useRef(null); const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const calc = () => { const w = ref.current; if (!w) return; setScale(Math.min(1, (w.clientWidth - 40) / w0, (w.clientHeight - 40) / h0)); };
    calc(); const ro = new ResizeObserver(calc); if (ref.current) ro.observe(ref.current);
    window.addEventListener("resize", calc); return () => { ro.disconnect(); window.removeEventListener("resize", calc); };
  }, []);
  return [ref, scale];
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("gk_theme") || "light");
  const [view, setView] = useState(() => localStorage.getItem("gk_a_view") || "v1");
  const [toastMsg, setToastMsg] = useState(null);
  const [wrapRef, scale] = useScale(1440, 900);

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("gk_theme", theme); }, [theme]);
  useEffect(() => { localStorage.setItem("gk_a_view", view); }, [view]);
  const toast = (m) => { if (!m) return; setToastMsg(m); clearTimeout(window.__t); window.__t = setTimeout(() => setToastMsg(null), 2200); };

  const Active = VIEWS[view];
  const [title, sub] = META[view];

  return (
    <div ref={wrapRef} style={{ height: "100vh", width: "100vw", overflow: "hidden", background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <div style={{ width: 1440, height: 900, transform: `scale(${scale})`, transformOrigin: "center center", flex: "0 0 auto" }}>
        <BrowserChrome url="admin.gigkraft.com/node/southwest-us-04/control-panel">
          <AdSidebar nav={NAV} active={view} onNav={setView} />
          <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg)" }}>
            <AdTopBar title={title} subtitle={sub} theme={theme} onTheme={() => setTheme(theme === "light" ? "dark" : "light")}
              actions={<><Pill tone="green" dot>Node live</Pill><AdBtn tone="default" icon="bell">Alerts</AdBtn></>} />
            <div style={{ flex: 1, overflow: "hidden" }}><Active toast={toast} /></div>
          </main>
        </BrowserChrome>
      </div>
      {toastMsg && <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "var(--gray-9)", color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center", gap: 8, zIndex: 50 }}><span style={{ color: "var(--blue-3)", display: "flex" }}>✓</span>{toastMsg}</div>}
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
