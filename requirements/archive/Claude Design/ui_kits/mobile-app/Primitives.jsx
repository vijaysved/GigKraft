/* global React */
// GigKraft Mobile — Primitive UI components.
// Visuals are driven by classNames defined in index.html's <style>.

const { useState } = React;

// ---- Button -----------------------------------------------------------------
function GkButton({ variant = "primary", children, onClick, style }) {
  return (
    <button className={`gk-btn gk-btn--${variant}`} onClick={onClick} style={style}>
      {children}
    </button>
  );
}

// ---- Text input -------------------------------------------------------------
function GkInput({ label, value, onChange, hint, placeholder, type = "text" }) {
  return (
    <div className="gk-field">
      {label && <label className="gk-field__label">{label}</label>}
      <input
        className="gk-field__input"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
      {hint && <p className="gk-field__hint">{hint}</p>}
    </div>
  );
}

// ---- Card -------------------------------------------------------------------
function GkCard({ variant = "default", children, onClick, style }) {
  return (
    <div
      className={`gk-card gk-card--${variant}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default", ...style }}
    >
      {children}
    </div>
  );
}

// ---- Badge / status ---------------------------------------------------------
function GkBadge({ tone = "lime", children }) {
  return <span className={`gk-badge gk-badge--${tone}`}>{children}</span>;
}

function GkStatus({ children, color = "var(--gk-success)" }) {
  return (
    <span className="gk-status" style={{ color }}>
      <span className="gk-status__dot" style={{ background: color }} />
      {children}
    </span>
  );
}

// ---- Before / After proof split --------------------------------------------
function BeforeAfter({ before, after, height = 96 }) {
  return (
    <div className="gk-split" style={{ height }}>
      <div className="gk-split__before">
        <span className="gk-split__icon">📷</span>
        <span>{before}</span>
      </div>
      <div className="gk-split__after">
        <span className="gk-split__icon">✨</span>
        <span>{after}</span>
      </div>
    </div>
  );
}

// ---- Eyebrow ----------------------------------------------------------------
function GkEyebrow({ children }) {
  return <div className="gk-eyebrow-lbl">{children}</div>;
}

Object.assign(window, { GkButton, GkInput, GkCard, GkBadge, GkStatus, BeforeAfter, GkEyebrow });
