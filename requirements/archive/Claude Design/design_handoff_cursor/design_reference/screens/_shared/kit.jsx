/* global React */
// GigKraft Mobile — UI kit (Mantine-flavored primitives + device shell).
// Tabler icons via webfont: <i class="ti ti-NAME" />.
const { useState } = React;

/* ----------------------------- atoms ----------------------------- */
function Icon({ name, size, style, className = "" }) {
  return <i className={`ti ti-${name} ${className}`} style={{ fontSize: size, ...style }} />;
}

function Btn({ variant = "filled", size, leftIcon, rightIcon, auto, children, ...rest }) {
  const cls = ["gk-btn", `gk-btn--${variant}`];
  if (size) cls.push(`gk-btn--${size}`);
  if (auto) cls.push("gk-btn--auto");
  return (
    <button className={cls.join(" ")} {...rest}>
      {leftIcon && <Icon name={leftIcon} />}
      {children}
      {rightIcon && <Icon name={rightIcon} />}
    </button>
  );
}

function IconBtn({ icon, ...rest }) {
  return <button className="gk-iconbtn" {...rest}><Icon name={icon} /></button>;
}

function Card({ press, selected, flat, padLg, className = "", children, ...rest }) {
  const cls = ["gk-card"];
  if (press) cls.push("gk-card--press");
  if (selected) cls.push("gk-card--selected");
  if (flat) cls.push("gk-card--flat");
  if (padLg) cls.push("gk-card--pad-lg");
  if (className) cls.push(className);
  return <div className={cls.join(" ")} {...rest}>{children}</div>;
}

function Eyebrow({ children, style }) { return <div className="gk-eyebrow" style={style}>{children}</div>; }
function Divider({ style }) { return <hr className="gk-divider" style={style} />; }

function Badge({ tone, icon, children }) {
  return <span className={`gk-badge${tone ? " gk-badge--" + tone : ""}`}>{icon && <Icon name={icon} />}{children}</span>;
}

function Avatar({ src, name = "", size = 40, style }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  const hue = (name.charCodeAt(0) || 0) * 37 % 360;
  return (
    <span className="gk-avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: src ? "transparent" : `oklch(0.62 0.13 ${hue})`, ...style }}>
      {src ? <img src={src} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
    </span>
  );
}

/* ----------------------------- inputs ----------------------------- */
function Field({ label, required, hint, children }) {
  return (
    <label className="gk-field">
      {label && <span className="gk-field__label">{label}{required && <span className="gk-field__req">*</span>}</span>}
      {children}
      {hint && <span className="gk-field__hint">{hint}</span>}
    </label>
  );
}

function TextInput({ label, required, hint, icon, ...rest }) {
  return (
    <Field label={label} required={required} hint={hint}>
      {icon ? (
        <span className="gk-input-wrap">
          <Icon name={icon} className="gk-input-wrap__icon" />
          <input className="gk-input" {...rest} />
        </span>
      ) : <input className="gk-input" {...rest} />}
    </Field>
  );
}

function Textarea({ label, required, hint, rows = 3, ...rest }) {
  return (
    <Field label={label} required={required} hint={hint}>
      <textarea className="gk-input" rows={rows} {...rest} />
    </Field>
  );
}

function Select({ label, required, hint, children, ...rest }) {
  return (
    <Field label={label} required={required} hint={hint}>
      <span style={{ position: "relative", display: "block" }}>
        <select className="gk-input" {...rest}>{children}</select>
        <Icon name="chevron-down" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", pointerEvents: "none", fontSize: 18 }} />
      </span>
    </Field>
  );
}

function Switch({ on, onChange }) {
  return <button className={`gk-switch${on ? " gk-switch--on" : ""}`} onClick={() => onChange(!on)}><span className="gk-switch__dot" /></button>;
}

function SwitchRow({ label, desc, on, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 0" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "var(--fz-md)", fontWeight: 600 }}>{label}</div>
        {desc && <div style={{ fontSize: "var(--fz-sm)", color: "var(--text-3)", marginTop: 2 }}>{desc}</div>}
      </div>
      <Switch on={on} onChange={onChange} />
    </div>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="gk-seg">
      {options.map((o) => {
        const v = o.value ?? o; const lbl = o.label ?? o;
        return <button key={v} className={`gk-seg__item${value === v ? " gk-seg__item--on" : ""}`} onClick={() => onChange(v)}>{lbl}</button>;
      })}
    </div>
  );
}

function Slider({ min = 0, max = 100, value, onChange, unit = "" }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: "var(--fz-sm)", color: "var(--text-3)" }}>{min}{unit}</span>
        <span className="mono" style={{ fontSize: "var(--fz-md)", fontWeight: 600, color: "var(--primary)" }}>{value}{unit}</span>
        <span style={{ fontSize: "var(--fz-sm)", color: "var(--text-3)" }}>{max}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(+e.target.value)}
        style={{ width: "100%", accentColor: "var(--primary)", "--pct": pct + "%" }} />
    </div>
  );
}

function Chip({ on, icon, children, onClick }) {
  return <button className={`gk-chip${on ? " gk-chip--on" : ""}`} onClick={onClick}>{icon && <Icon name={icon} />}{children}{on && <Icon name="x" style={{ fontSize: 14 }} />}</button>;
}

function Stars({ value, onChange, size = 28 }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon key={n} name={n <= value ? "star-filled" : "star"} size={size}
          style={{ color: n <= value ? "var(--yellow-6)" : "var(--border-2)", cursor: onChange ? "pointer" : "default" }}
          {...(onChange ? { onClick: () => onChange(n) } : {})} />
      ))}
    </div>
  );
}

/* --------------------------- media slots --------------------------- */
// Striped placeholder the user/dev fills with a real photo.
function Photo({ label, h = 120, filled, tone = "neutral", icon = "photo", onClick, dashed, accent }) {
  const tones = {
    neutral: "var(--bg-2)", before: "var(--bg-2)", after: "var(--green-bg)",
  };
  return (
    <div onClick={onClick} style={{
      height: h, borderRadius: "var(--r-md)", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 6, cursor: onClick ? "pointer" : "default",
      color: filled ? (tone === "after" ? "var(--green-fg)" : "var(--text-2)") : "var(--text-3)",
      background: filled ? tones[tone] : "transparent",
      border: `${dashed ? "1.5px dashed" : "1px solid"} ${accent ? "var(--primary)" : "var(--border-2)"}`,
      backgroundImage: filled ? `repeating-linear-gradient(135deg, transparent 0 11px, rgba(0,0,0,.025) 11px 12px)` : "none",
      position: "relative", overflow: "hidden", textAlign: "center", padding: 8,
    }}>
      <Icon name={filled ? "check" : icon} size={filled ? 24 : 22} />
      <span style={{ fontSize: "var(--fz-xs)", fontWeight: 600, lineHeight: 1.3 }}>{label}</span>
    </div>
  );
}

function BeforeAfter({ before = "Before", after = "After", h = 130 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, borderRadius: "var(--r-md)", overflow: "hidden" }}>
      {[["before", before, "#868e96"], ["after", after, "var(--green-6)"]].map(([k, lbl, c]) => (
        <div key={k} style={{
          height: h, position: "relative", display: "flex", alignItems: "flex-end", padding: 8,
          background: k === "after" ? "var(--green-bg)" : "var(--bg-2)",
          backgroundImage: `repeating-linear-gradient(135deg, transparent 0 13px, rgba(0,0,0,.03) 13px 14px)`,
        }}>
          <span style={{ position: "absolute", top: 8, left: 8, fontSize: 9, fontWeight: 800, letterSpacing: ".6px", textTransform: "uppercase", color: c, background: "var(--surface)", padding: "3px 7px", borderRadius: 5 }}>
            {k === "after" ? "✦ After" : "Before"}
          </span>
          <span style={{ fontSize: "var(--fz-xs)", color: "var(--text-3)", fontWeight: 600 }}>{lbl}</span>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- device shell ----------------------------- */
function StatusBar() {
  return (
    <div className="gk-statusbar" style={{
      height: 50, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px", position: "relative", flex: "0 0 auto", color: "var(--text)",
    }}>
      <span className="mono" style={{ fontSize: 14, fontWeight: 600, letterSpacing: ".5px" }}>9:41</span>
      <div style={{ position: "absolute", left: "50%", top: 9, transform: "translateX(-50%)", width: 104, height: 30, background: "#000", borderRadius: 999 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Icon name="antenna-bars-5" size={17} />
        <Icon name="wifi" size={17} />
        <Icon name="battery-3" size={20} style={{ transform: "rotate(0deg)" }} />
      </div>
    </div>
  );
}

function PhoneFrame({ children }) {
  return (
    <div className="gk-phone" style={{
      width: 398, height: 836, background: "var(--surface)", borderRadius: 52,
      padding: 10, boxShadow: "var(--shadow-device)", flex: "0 0 auto",
      border: "1px solid var(--border)",
    }}>
      <div style={{
        width: "100%", height: "100%", background: "var(--bg)", borderRadius: 44,
        overflow: "hidden", display: "flex", flexDirection: "column", position: "relative",
      }}>
        <StatusBar />
        {children}
      </div>
    </div>
  );
}

function AppBar({ title, subtitle, onBack, left, right }) {
  return (
    <div style={{
      flex: "0 0 auto", display: "flex", alignItems: "center", gap: 10, padding: "6px 12px 10px",
      borderBottom: "1px solid var(--border)", background: "var(--surface)",
    }}>
      {onBack && <IconBtn icon="arrow-left" onClick={onBack} />}
      {left}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        {subtitle && <div style={{ fontSize: "var(--fz-xs)", color: "var(--text-3)", fontWeight: 500 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

function BottomTab({ tabs, active, onTab }) {
  return (
    <div style={{
      flex: "0 0 auto", display: "flex", borderTop: "1px solid var(--border)",
      background: "var(--surface)", padding: "8px 6px 22px",
    }}>
      {tabs.map((t) => {
        const on = t.id === active;
        const primary = t.primary;
        return (
          <button key={t.id} onClick={() => onTab(t.id)} style={{
            flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex",
            flexDirection: "column", alignItems: "center", gap: 3, padding: "2px 0",
            color: on ? "var(--primary)" : "var(--text-3)",
          }}>
            {primary ? (
              <span style={{ width: 46, height: 32, marginTop: -2, borderRadius: 10, background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={t.icon} size={22} />
              </span>
            ) : <Icon name={on ? (t.iconOn || t.icon) : t.icon} size={23} />}
            <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 500 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Layout: sticky app bar + scroll body + optional sticky footer + optional tab bar.
function Screen({ appBar, children, footer, tabBar, scrollRef }) {
  return (
    <>
      {appBar}
      <div className="gk-scroll" ref={scrollRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {children}
      </div>
      {footer && <div style={{ flex: "0 0 auto", padding: "12px 16px", borderTop: "1px solid var(--border)", background: "var(--surface)" }}>{footer}</div>}
      {tabBar}
    </>
  );
}

// Onboarding progress dots.
function Steps({ total, current }) {
  return (
    <div style={{ display: "flex", gap: 5, padding: "0 16px 4px" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= current ? "var(--primary)" : "var(--border-2)" }} />
      ))}
    </div>
  );
}

// Generic body padding wrapper.
function Body({ children, gap = 14, style }) {
  return <div style={{ padding: 16, display: "flex", flexDirection: "column", gap, ...style }}>{children}</div>;
}

function Stat({ k, v, delta, deltaTone = "green", icon }) {
  return (
    <Card style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span className="gk-eyebrow">{k}</span>
        {icon && <Icon name={icon} size={17} style={{ color: "var(--text-3)" }} />}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.5px", lineHeight: 1 }}>{v}</div>
      {delta && (
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 7, fontSize: 12, fontWeight: 700, color: deltaTone === "green" ? "var(--green-fg)" : deltaTone === "red" ? "var(--red-fg)" : "var(--text-3)" }}>
          <Icon name={deltaTone === "red" ? "trending-down" : "trending-up"} size={14} />{delta}
        </div>
      )}
    </Card>
  );
}

// Bar chart (simple, themed).
function BarChart({ data, h = 120, color = "var(--primary)" }) {
  const max = Math.max(...data.map((d) => d.v));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: h }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
          <div style={{ width: "100%", maxWidth: 30, height: `${(d.v / max) * 100}%`, minHeight: 4, background: d.hl ? color : "var(--tint-strong)", borderRadius: "5px 5px 3px 3px", transition: "height .3s" }} />
          <span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600 }}>{d.l}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {
  Icon, Btn, IconBtn, Card, Eyebrow, Divider, Badge, Avatar,
  Field, TextInput, Textarea, Select, Switch, SwitchRow, Segmented, Slider, Chip, Stars,
  Photo, BeforeAfter, PhoneFrame, AppBar, BottomTab, Screen, Steps, Body, Stat, BarChart,
});
