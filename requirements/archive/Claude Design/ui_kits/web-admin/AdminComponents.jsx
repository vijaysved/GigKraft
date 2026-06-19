/* global React */
// GigKraft Admin — desktop console components (browser shell, sidebar, tiles, table).

const { useState: useStateAdmin } = React;

function BrowserShell({ url, children }) {
  return (
    <div className="ad-browser">
      <div className="ad-browser__bar">
        <span className="ad-dot" style={{ background: "#EF4444" }} />
        <span className="ad-dot" style={{ background: "#FBBF24" }} />
        <span className="ad-dot" style={{ background: "#34D399" }} />
        <div className="ad-browser__url">{url}</div>
      </div>
      <div className="ad-browser__body">{children}</div>
    </div>
  );
}

function Sidebar({ items, active, onNav }) {
  return (
    <div className="ad-sidebar">
      <div className="ad-sidebar__brand">gigkraft<span>.admin</span></div>
      {items.map((it) => (
        <div
          key={it.id}
          className={`ad-nav ${active === it.id ? "ad-nav--active" : ""}`}
          onClick={() => onNav(it.id)}
        >
          <span>{it.icon}</span>{it.label}
        </div>
      ))}
      <div className="ad-sidebar__foot">
        <div className="ad-node">📍 Southwest US-04</div>
        <div className="ad-node__sub">Regional Operational Node</div>
      </div>
    </div>
  );
}

function MetricTile({ k, v, accent }) {
  return (
    <div className="ad-tile">
      <span className="ad-tile__k">{k}</span>
      <div className="ad-tile__v" style={accent ? { color: "var(--gk-orange)" } : null}>{v}</div>
    </div>
  );
}

function SectionHead({ title, badge }) {
  return (
    <div className="ad-head">
      <h3 className="ad-head__t">{title}</h3>
      {badge && <span className="ad-head__badge">{badge}</span>}
    </div>
  );
}

function InlineBtn({ tone, children, onClick }) {
  const bg = { whatsapp: "var(--gk-success)", sms: "var(--gk-info)", green: "#34D399", red: "var(--gk-danger)" }[tone] || "var(--gk-orange)";
  return (
    <button className="ad-ibtn" style={{ background: bg }} onClick={onClick}>{children}</button>
  );
}

Object.assign(window, { BrowserShell, Sidebar, MetricTile, SectionHead, InlineBtn });
