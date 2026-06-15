/* global React, ReactDOM, PhoneFrame, BottomTab, Icon,
   S2_1_Discover, S2_2_ProofDetail, S2_3_Emergency, S2_4_QuoteChat, S2_5_Review, S2_6_Account */
const { useState, useEffect, useLayoutEffect, useRef } = React;

const SCREENS = { s2_1: S2_1_Discover, s2_2: S2_2_ProofDetail, s2_3: S2_3_Emergency, s2_4: S2_4_QuoteChat, s2_5: S2_5_Review, account: S2_6_Account };
const TABS = [
  { id: "s2_1", icon: "search", label: "Discover" },
  { id: "s2_4", icon: "message-circle", label: "Messages" },
  { id: "s2_3", icon: "urgent", label: "Emergency", primary: true },
  { id: "s2_5", icon: "star", label: "Recommend" },
  { id: "account", icon: "user", label: "You" },
];
const TAB_IDS = TABS.map((t) => t.id);
const RAIL = [
  ["s2_1", "2.1", "Discovery feed"],
  ["s2_2", "2.2", "Proof detail"],
  ["s2_3", "2.3", "Emergency broadcast"],
  ["s2_4", "2.4", "Request a quote"],
  ["s2_5", "2.5", "Leave a recommendation"],
  ["account", "2.6", "Your account"],
];

function useScale() {
  const ref = useRef(null); const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const calc = () => { const w = ref.current; if (!w) return; setScale(Math.min(1, (w.clientHeight - 24) / 836, (w.clientWidth - 24) / 398)); };
    calc(); const ro = new ResizeObserver(calc); if (ref.current) ro.observe(ref.current);
    window.addEventListener("resize", calc); return () => { ro.disconnect(); window.removeEventListener("resize", calc); };
  }, []);
  return [ref, scale];
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("gk_theme") || "light");
  const [screen, setScreen] = useState(() => localStorage.getItem("gk_c_screen") || "s2_1");
  const [ctx, setCtx] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [wrapRef, scale] = useScale();

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("gk_theme", theme); }, [theme]);
  useEffect(() => { localStorage.setItem("gk_c_screen", screen); }, [screen]);

  const go = (s, payload) => { if (SCREENS[s] || s === "account") { setScreen(s); if (payload) setCtx(payload); } };
  const toast = (m) => { if (!m) return; setToastMsg(m); clearTimeout(window.__t); window.__t = setTimeout(() => setToastMsg(null), 2200); };

  const Active = SCREENS[screen] || S2_1_Discover;
  const tabBar = TAB_IDS.includes(screen) ? <BottomTab tabs={TABS} active={screen} onTab={go} /> : null;

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "var(--bg-2)" }}>
      <aside style={{ width: 268, flex: "0 0 auto", borderRight: "1px solid var(--border)", background: "var(--surface)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--teal-6)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="home" size={20} style={{ color: "#fff" }} /></div>
          <div><div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-.3px", lineHeight: 1 }}>GigKraft</div><div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>Homeowner · 6 screens</div></div>
        </div>
        <div className="gk-scroll" style={{ flex: 1, overflowY: "auto", padding: "16px 12px" }}>
          <div className="gk-eyebrow" style={{ padding: "0 10px 8px" }}>Consumer / recommender</div>
          {RAIL.map(([id, num, label]) => {
            const on = screen === id;
            return (
              <button key={id} onClick={() => go(id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px", marginBottom: 2, borderRadius: 9, border: "none", cursor: "pointer", textAlign: "left", background: on ? "var(--tint)" : "transparent", color: on ? "var(--tint-text)" : "var(--text-2)" }}>
                <span className="mono" style={{ fontSize: 11, fontWeight: 600, width: 26, color: on ? "var(--primary)" : "var(--text-3)" }}>{num}</span>
                <span style={{ fontSize: 13.5, fontWeight: on ? 700 : 500 }}>{label}</span>
              </button>
            );
          })}
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
          <a href="../../GigKraft App.html" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--text-3)", textDecoration: "none" }}><Icon name="arrow-left" size={15} />All roles</a>
        </div>
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ flex: "0 0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{RAIL.find(([id]) => id === screen)?.[2] || "Account"}<span style={{ color: "var(--text-3)", fontWeight: 500, marginLeft: 8, fontSize: 13 }}>iPhone · 390×844</span></div>
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 38, padding: "0 14px", borderRadius: 999, border: "1px solid var(--border-2)", background: "var(--surface)", color: "var(--text-2)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}><Icon name={theme === "light" ? "moon" : "sun"} size={17} />{theme === "light" ? "Dark" : "Light"}</button>
        </header>
        <div ref={wrapRef} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
            <PhoneFrame><Active go={go} toast={toast} ctx={ctx} tabBar={tabBar} /></PhoneFrame>
          </div>
          {toastMsg && <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "var(--gray-9)", color: "#fff", padding: "11px 18px", borderRadius: 12, fontSize: 13.5, fontWeight: 600, boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center", gap: 8, maxWidth: 360, zIndex: 50 }}><Icon name="circle-check-filled" size={18} style={{ color: "var(--blue-3)" }} />{toastMsg}</div>}
        </div>
      </main>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
