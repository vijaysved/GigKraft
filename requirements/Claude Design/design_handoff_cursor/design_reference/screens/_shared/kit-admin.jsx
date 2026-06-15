/* global React, Icon, Badge, Avatar, Divider */
// GigKraft Admin — desktop UI kit (Community Node Manager console).
// Reuses Icon/Badge/Avatar from the shared kit. Adds browser chrome, sidebar,
// metric tiles, data tables, toolbars — a clean fintech admin shell.
const { useState: useAd } = React;

function BrowserChrome({ url, children }) {
  return (
    <div style={{ width: "100%", height: "100%", background: "var(--surface)", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid var(--border)", boxShadow: "var(--shadow-device)" }}>
      <div style={{ flex: "0 0 auto", height: 46, display: "flex", alignItems: "center", gap: 14, padding: "0 16px", background: "var(--bg-2)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />)}
        </div>
        <div style={{ flex: 1, maxWidth: 520, display: "flex", alignItems: "center", gap: 8, height: 28, padding: "0 12px", background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 8, color: "var(--text-3)", fontSize: 12.5 }}>
          <Icon name="lock" size={13} /><span className="mono" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</span>
        </div>
        <Icon name="dots" size={18} style={{ color: "var(--text-3)" }} />
      </div>
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>{children}</div>
    </div>
  );
}

function AdSidebar({ nav, active, onNav }) {
  return (
    <aside style={{ width: 244, flex: "0 0 auto", background: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 18px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="tools" size={19} style={{ color: "#fff" }} /></div>
        <div><div style={{ fontWeight: 800, fontSize: 15.5, lineHeight: 1 }}>GigKraft</div><div style={{ fontSize: 10.5, color: "var(--text-3)", fontWeight: 600, marginTop: 2 }}>NODE CONSOLE</div></div>
      </div>
      <div style={{ padding: "10px 8px 6px", fontSize: 10.5, fontWeight: 700, letterSpacing: ".5px", color: "var(--text-3)", paddingLeft: 18 }}>SOUTHWEST US-04</div>
      <nav style={{ flex: 1, padding: "4px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }} className="gk-scroll">
        {nav.map((n) => {
          const on = active === n.id;
          return (
            <button key={n.id} onClick={() => onNav(n.id)} style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 11px", borderRadius: 8, border: "none", cursor: "pointer", textAlign: "left", background: on ? "var(--tint)" : "transparent", color: on ? "var(--tint-text)" : "var(--text-2)", fontWeight: on ? 700 : 500, fontSize: 13.5 }}>
              <Icon name={n.icon} size={18} style={{ color: on ? "var(--primary)" : "var(--text-3)" }} />
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.badge && <span style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: 999, background: on ? "var(--primary)" : "var(--red-6)", color: "#fff", fontSize: 10.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{n.badge}</span>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "12px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name="Dana Cruz" size={34} />
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 13 }}>Dana Cruz</div><div style={{ fontSize: 11, color: "var(--text-3)" }}>Node manager</div></div>
        <a href="../../GigKraft App.html" title="All roles" style={{ color: "var(--text-3)", display: "flex" }}><Icon name="grid-dots" size={18} /></a>
      </div>
    </aside>
  );
}

function AdTopBar({ title, subtitle, theme, onTheme, actions }) {
  return (
    <div style={{ flex: "0 0 auto", height: 64, display: "flex", alignItems: "center", gap: 16, padding: "0 24px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.3px" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 1 }}>{subtitle}</div>}
      </div>
      {actions}
      <button onClick={onTheme} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 9, border: "1px solid var(--border-2)", background: "var(--surface)", color: "var(--text-2)", cursor: "pointer" }}><Icon name={theme === "light" ? "moon" : "sun"} size={18} /></button>
    </div>
  );
}

function AdMetric({ label, value, delta, deltaTone = "green", icon, accent }) {
  return (
    <div style={{ flex: 1, padding: 18, borderRadius: 14, border: "1px solid var(--border)", background: accent ? "linear-gradient(135deg, var(--blue-7), var(--blue-9))" : "var(--surface)", color: accent ? "#fff" : "var(--text)", boxShadow: "var(--shadow-xs)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: ".4px", textTransform: "uppercase", color: accent ? "rgba(255,255,255,.8)" : "var(--text-3)" }}>{label}</span>
        <Icon name={icon} size={18} style={{ color: accent ? "rgba(255,255,255,.85)" : "var(--text-3)" }} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.6px", marginTop: 10, lineHeight: 1 }}>{value}</div>
      {delta && <div style={{ display: "inline-flex", alignItems: "center", gap: 3, marginTop: 9, fontSize: 12, fontWeight: 700, color: accent ? "rgba(255,255,255,.9)" : (deltaTone === "red" ? "var(--red-fg)" : "var(--green-fg)") }}><Icon name={deltaTone === "red" ? "trending-down" : "trending-up"} size={14} />{delta}</div>}
    </div>
  );
}

function Panel({ title, action, children, pad = true, style }) {
  return (
    <div style={{ borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", boxShadow: "var(--shadow-xs)", overflow: "hidden", ...style }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontWeight: 700, fontSize: 14.5 }}>{title}</span>{action}
        </div>
      )}
      <div style={{ padding: pad ? 18 : 0 }}>{children}</div>
    </div>
  );
}

function Pill({ tone, dot, children }) {
  const map = { green: ["var(--green-bg)", "var(--green-fg)"], red: ["var(--red-bg)", "var(--red-fg)"], yellow: ["var(--yellow-bg)", "var(--yellow-fg)"], blue: ["var(--tint)", "var(--tint-text)"], gray: ["var(--bg-2)", "var(--text-2)"] };
  const [bg, fg] = map[tone] || map.gray;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: bg, color: fg, whiteSpace: "nowrap" }}>{dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: fg }} />}{children}</span>;
}

function AdBtn({ tone = "default", icon, children, ...rest }) {
  const styles = {
    default: { background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border-2)" },
    primary: { background: "var(--primary)", color: "#fff", border: "1px solid transparent" },
    whatsapp: { background: "var(--whatsapp)", color: "#fff", border: "1px solid transparent" },
    sms: { background: "var(--tint)", color: "var(--tint-text)", border: "1px solid transparent" },
    green: { background: "var(--green-bg)", color: "var(--green-fg)", border: "1px solid var(--green-bd)" },
    red: { background: "var(--red-bg)", color: "var(--red-fg)", border: "1px solid var(--red-bd)" },
    ghost: { background: "transparent", color: "var(--text-2)", border: "1px solid transparent" },
  };
  return <button {...rest} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, padding: "7px 13px", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", ...styles[tone] }}>{icon && <Icon name={icon} size={15} />}{children}</button>;
}

// Data table — columns: [{key,label,w,align}], rows arbitrary, render(row,col).
function Table({ cols, rows, render }) {
  return (
    <div style={{ overflowX: "auto" }} className="gk-scroll">
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead>
          <tr>{cols.map((c) => <th key={c.key} style={{ textAlign: c.align || "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, letterSpacing: ".4px", textTransform: "uppercase", color: "var(--text-3)", borderBottom: "1px solid var(--border)", width: c.w, whiteSpace: "nowrap" }}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || i} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
              {cols.map((c) => <td key={c.key} style={{ textAlign: c.align || "left", padding: "13px 14px", verticalAlign: "middle" }}>{render(r, c.key)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SearchBox({ placeholder = "Search…", w = 260 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 12px", width: w, background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 9, color: "var(--text-3)" }}>
      <Icon name="search" size={16} /><input placeholder={placeholder} style={{ border: "none", outline: "none", background: "transparent", flex: 1, fontSize: 13.5, color: "var(--text)", fontFamily: "var(--font)" }} />
    </div>
  );
}

// Donut + horizontal mini bar utilities
function Donut({ pct, size = 84, label, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: `conic-gradient(var(--primary) 0 ${pct}%, var(--bg-2) ${pct}% 100%)`, display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
        <div style={{ width: size - 22, height: size - 22, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 }}>{pct}%</div>
      </div>
      <div><div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div><div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 2 }}>{sub}</div></div>
    </div>
  );
}

function Bars({ data, h = 150 }) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: h }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)" }}>{d.t}</span>
          <div style={{ width: "100%", maxWidth: 46, height: `${(d.v / max) * 100}%`, minHeight: 4, background: d.hl ? "var(--primary)" : "var(--tint-strong)", borderRadius: "6px 6px 3px 3px" }} />
          <span style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>{d.l}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { BrowserChrome, AdSidebar, AdTopBar, AdMetric, Panel, Pill, AdBtn, Table, SearchBox, Donut, Bars });
