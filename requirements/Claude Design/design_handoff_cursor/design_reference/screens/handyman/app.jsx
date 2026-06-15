/* global React, ReactDOM, PhoneFrame, BottomTab, Icon,
   S1_1_Auth, S1_2_ServiceArea, S1_3_Visual, S1_4_Credentials, S1_5_Categorization,
   S1_6_ProjectCreator, S1_7_RecRequest, S1_8_Moderation, S1_9_Leads, S1_10_Chat,
   S1_11_Analytics, S1_12_Billing, S1_13_Network, AccountHub */
const { useState, useEffect, useLayoutEffect, useRef } = React;

const SCREENS = {
  s1_1: S1_1_Auth, s1_2: S1_2_ServiceArea, s1_3: S1_3_Visual, s1_4: S1_4_Credentials, s1_5: S1_5_Categorization,
  s1_6: S1_6_ProjectCreator, s1_7: S1_7_RecRequest, s1_8: S1_8_Moderation, s1_9: S1_9_Leads, s1_10: S1_10_Chat,
  s1_11: S1_11_Analytics, s1_12: S1_12_Billing, s1_13: S1_13_Network, account: AccountHub,
};

const TABS = [
  { id: "s1_9", icon: "inbox", iconOn: "inbox", label: "Leads" },
  { id: "s1_11", icon: "chart-bar", label: "Stats" },
  { id: "s1_6", icon: "plus", label: "Add", primary: true },
  { id: "s1_13", icon: "users", label: "Network" },
  { id: "account", icon: "user", label: "Account" },
];
const TAB_IDS = TABS.map((t) => t.id);

const RAIL = [
  { group: "Onboarding & account", items: [
    ["s1_1", "1.1", "Authentication"], ["s1_2", "1.2", "Service area"], ["s1_3", "1.3", "Visual customization"],
    ["s1_4", "1.4", "Credentials"], ["s1_5", "1.5", "Categorization"] ] },
  { group: "Portfolio & recommendations", items: [
    ["s1_6", "1.6", "Project creator"], ["s1_7", "1.7", "Recommendation request"], ["s1_8", "1.8", "Moderation queue"] ] },
  { group: "Leads & communication", items: [
    ["s1_9", "1.9", "Leads dashboard"], ["s1_10", "1.10", "Direct chat"] ] },
  { group: "Business operations", items: [
    ["s1_11", "1.11", "Performance & analytics"], ["s1_12", "1.12", "Subscription & billing"], ["s1_13", "1.13", "B2B network"] ] },
];

function useScale() {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const calc = () => {
      const wrap = ref.current; if (!wrap) return;
      const availH = wrap.clientHeight - 24;
      const availW = wrap.clientWidth - 24;
      setScale(Math.min(1, availH / 836, availW / 398));
    };
    calc();
    const ro = new ResizeObserver(calc);
    if (ref.current) ro.observe(ref.current);
    window.addEventListener("resize", calc);
    return () => { ro.disconnect(); window.removeEventListener("resize", calc); };
  }, []);
  return [ref, scale];
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("gk_theme") || "light");
  const [screen, setScreen] = useState(() => localStorage.getItem("gk_screen") || "s1_9");
  const [toastMsg, setToastMsg] = useState(null);
  const [wrapRef, scale] = useScale();

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); localStorage.setItem("gk_theme", theme); }, [theme]);
  useEffect(() => { localStorage.setItem("gk_screen", screen); }, [screen]);

  const go = (s) => { if (SCREENS[s]) setScreen(s); };
  const toast = (m) => { if (!m) return; setToastMsg(m); clearTimeout(window.__t); window.__t = setTimeout(() => setToastMsg(null), 2200); };

  const Active = SCREENS[screen];
  const tabBar = TAB_IDS.includes(screen)
    ? <BottomTab tabs={TABS} active={screen} onTab={go} />
    : null;

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "var(--bg-2)" }}>
      {/* ---- Screen index rail ---- */}
      <aside style={{ width: 268, flex: "0 0 auto", borderRight: "1px solid var(--border)", background: "var(--surface)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="tools" size={20} style={{ color: "#fff" }} /></div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-.3px", lineHeight: 1 }}>GigKraft</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>Handyman · 13 screens</div>
            </div>
          </div>
        </div>
        <div className="gk-scroll" style={{ flex: 1, overflowY: "auto", padding: "12px 12px 24px" }}>
          {RAIL.map((g) => (
            <div key={g.group} style={{ marginBottom: 16 }}>
              <div className="gk-eyebrow" style={{ padding: "6px 10px" }}>{g.group}</div>
              {g.items.map(([id, num, label]) => {
                const on = screen === id;
                return (
                  <button key={id} onClick={() => go(id)} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", marginBottom: 2,
                    borderRadius: 9, border: "none", cursor: "pointer", textAlign: "left",
                    background: on ? "var(--tint)" : "transparent", color: on ? "var(--tint-text)" : "var(--text-2)",
                  }}>
                    <span className="mono" style={{ fontSize: 11, fontWeight: 600, width: 26, color: on ? "var(--primary)" : "var(--text-3)" }}>{num}</span>
                    <span style={{ fontSize: 13.5, fontWeight: on ? 700 : 500 }}>{label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", fontSize: 11, color: "var(--text-3)", lineHeight: 1.5 }}>
          Mantine + Tabler · click any screen or use the in‑app tab bar.
        </div>
      </aside>

      {/* ---- Stage ---- */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ flex: "0 0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>
            {RAIL.flatMap((g) => g.items).find(([id]) => id === screen)?.[2]
              || (screen === "account" ? "Account" : "")}
            <span style={{ color: "var(--text-3)", fontWeight: 500, marginLeft: 8, fontSize: 13 }}>iPhone · 390×844</span>
          </div>
          <button onClick={() => setTheme(theme === "light" ? "dark" : "light")} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 38, padding: "0 14px", borderRadius: 999, border: "1px solid var(--border-2)", background: "var(--surface)", color: "var(--text-2)", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
            <Icon name={theme === "light" ? "moon" : "sun"} size={17} />{theme === "light" ? "Dark" : "Light"}
          </button>
        </header>

        <div ref={wrapRef} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
            <PhoneFrame><Active go={go} toast={toast} tabBar={tabBar} /></PhoneFrame>
          </div>
          {toastMsg && (
            <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", background: "var(--gray-9)", color: "#fff", padding: "11px 18px", borderRadius: 12, fontSize: 13.5, fontWeight: 600, boxShadow: "var(--shadow-lg)", display: "flex", alignItems: "center", gap: 8, maxWidth: 360, zIndex: 50 }}>
              <Icon name="circle-check-filled" size={18} style={{ color: "var(--blue-3)" }} />{toastMsg}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
