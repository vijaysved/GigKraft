/* global React, Icon, Avatar, Panel, AdMetric, Pill, AdBtn, Table, SearchBox, Donut, Bars, BeforeAfter, Photo, Badge */
// GigKraft Admin — views 3.1–3.6 (Community Node Manager console).
const { useState: useV } = React;

const wrap = (children) => <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18, height: "100%", overflowY: "auto" }} className="gk-scroll">{children}</div>;

/* 3.1 — Regional Core Ops (dashboard) */
function V3_1_Ops() {
  const acts = [
    ["Marcus Bell", "published a Kraft · Copper riser re-pipe · $1,840", "2m", "green"],
    ["Emergency broadcast", "Kitchen pipe burst · Downtown · budget $150", "8m", "red"],
    ["R. Alvarez", "claimed lead · Breaker panel trip · Eastside", "14m", "blue"],
    ["Tasha Quinn", "earned 5★ recommendation from Priya Shah", "31m", "green"],
    ["New pro", "Leo Park activated Pro Vault · $199/yr", "1h", "blue"],
  ];
  return wrap(<>
    <div style={{ display: "flex", gap: 16 }}>
      <AdMetric label="Pending triage" value="3 tasks" delta="2 urgent" deltaTone="red" icon="urgent" />
      <AdMetric label="Active pros" value="142" delta="+6 this week" icon="users" />
      <AdMetric label="Avg response" value="1h 52m" delta="inside 4h SLA" icon="clock-check" />
      <AdMetric label="Monthly run rate" value="$2,838" delta="+22%" icon="cash" accent />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18 }}>
      <Panel title="Node throughput · last 6 weeks" action={<Pill tone="green" dot>Healthy</Pill>}>
        <Bars data={[{ t: "82", l: "Apr 28", v: 82 }, { t: "96", l: "May 5", v: 96 }, { t: "88", l: "May 12", v: 88 }, { t: "104", l: "May 19", v: 104 }, { t: "121", l: "May 26", v: 121 }, { t: "138", l: "Jun 2", v: 138, hl: true }]} />
        <div style={{ display: "flex", gap: 24, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <div><div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600 }}>Jobs closed</div><div style={{ fontSize: 20, fontWeight: 800 }}>629</div></div>
          <div><div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600 }}>Win rate</div><div style={{ fontSize: 20, fontWeight: 800 }}>41%</div></div>
          <div><div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600 }}>Repeat clients</div><div style={{ fontSize: 20, fontWeight: 800 }}>33%</div></div>
        </div>
      </Panel>
      <Panel title="SLA compliance">
        <Donut pct={92} label="Within 4h promise" sub="131 of 142 pros on target" />
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {[["Plumbing", 96, "green"], ["Electrical", 91, "green"], ["HVAC", 78, "yellow"]].map(([t, v, tone]) => (
            <div key={t}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}><span style={{ fontWeight: 600 }}>{t}</span><span className="mono" style={{ color: "var(--text-3)" }}>{v}%</span></div>
              <div style={{ height: 7, borderRadius: 99, background: "var(--bg-2)" }}><div style={{ width: `${v}%`, height: "100%", borderRadius: 99, background: tone === "yellow" ? "var(--yellow-6)" : "var(--green-6)" }} /></div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
    <Panel title="Recent node activity" action={<AdBtn tone="ghost" icon="refresh">Refresh</AdBtn>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {acts.map(([who, ctx, t, tone], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 4px", borderBottom: i < acts.length - 1 ? "1px solid var(--border)" : "none" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", flex: "0 0 auto", background: tone === "red" ? "var(--red-6)" : tone === "blue" ? "var(--blue-6)" : "var(--green-6)" }} />
            <span style={{ fontSize: 13.5 }}><strong>{who}</strong> {ctx}</span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-3)" }} className="mono">{t} ago</span>
          </div>
        ))}
      </div>
    </Panel>
  </>);
}

/* 3.2 — Cross-Channel Triage Desk */
function V3_2_Triage({ toast }) {
  const [done, setDone] = useV([]);
  const rows = [
    { id: "TSK-8902", ctx: "Kitchen pipe main-line burst", sub: "Water pooling · Downtown node", budget: "$150", age: "4m", urgent: true },
    { id: "TSK-8911", ctx: "Breaker panel total trip", sub: "No power to property · Eastside node", budget: "$240", age: "12m", urgent: true },
    { id: "TSK-8920", ctx: "Water heater leaking", sub: "Garage flooding slowly · North node", budget: "$400", age: "26m", urgent: false },
  ];
  const live = rows.filter((r) => !done.includes(r.id));
  return wrap(<>
    <div style={{ display: "flex", gap: 16 }}>
      <AdMetric label="Unrouted" value={live.length} delta="dispatch now" deltaTone="red" icon="broadcast" />
      <AdMetric label="Claimed today" value="11" delta="+4" icon="check" />
      <AdMetric label="Avg claim time" value="3m 40s" icon="clock" />
    </div>
    <Panel title="Outreach triage desk" pad={false} action={<Pill tone="red" dot>{live.length} awaiting dispatch</Pill>}>
      {live.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "var(--text-3)" }}><Icon name="circle-check" size={40} style={{ color: "var(--green-fg)" }} /><div style={{ marginTop: 10, fontWeight: 600 }}>Queue clear — all emergencies dispatched.</div></div>
      ) : (
        <Table cols={[{ key: "id", label: "Task", w: 120 }, { key: "ctx", label: "Context" }, { key: "budget", label: "Budget", align: "right", w: 100 }, { key: "act", label: "Dispatch", align: "right", w: 250 }]}
          rows={live}
          render={(r, k) => {
            if (k === "id") return <span><strong className="mono" style={{ fontSize: 12.5 }}>#{r.id}</strong>{r.urgent && <div style={{ marginTop: 4 }}><Pill tone="red">{r.age} old</Pill></div>}</span>;
            if (k === "ctx") return <span><strong>{r.ctx}</strong><br /><span style={{ fontSize: 12.5, color: "var(--text-3)" }}>{r.sub}</span></span>;
            if (k === "budget") return <span className="mono" style={{ fontWeight: 800, color: "var(--green-fg)" }}>{r.budget}</span>;
            return <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <AdBtn tone="whatsapp" icon="brand-whatsapp" onClick={() => toast("WhatsApp blast dispatched to node.")}>Blast</AdBtn>
              <AdBtn tone="sms" icon="message-2" onClick={() => { setDone([...done, r.id]); toast("SMS pin broadcast — task routed."); }}>SMS pin</AdBtn>
            </div>;
          }} />
      )}
    </Panel>
    <Panel title="" pad><div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-2)", fontSize: 13 }}><Icon name="info-circle" size={18} style={{ color: "var(--text-3)" }} />Payloads beam instantly to proven local pros over native SMS + WhatsApp automation. Alerts escalate if a task sits unassigned beyond 15 minutes.</div></Panel>
  </>);
}

/* 3.3 — Safety & Hygiene moderation */
function V3_3_Safety({ toast }) {
  const [resolved, setResolved] = useV([]);
  const rows = [
    { id: "DISP-302", who: "John Doe", trade: "Carpenter", ctx: "Off-platform pricing variance vs published portfolio.", sev: "yellow" },
    { id: "DISP-318", who: "M. Reyes", trade: "Roofer", ctx: "Missing mandatory After image on 2 published Krafts.", sev: "red" },
    { id: "DISP-325", who: "K. Obi", trade: "Painter", ctx: "Client reported no-show after lead claim.", sev: "yellow" },
  ];
  const open = rows.filter((r) => !resolved.includes(r.id));
  return wrap(<>
    <div style={{ display: "flex", gap: 16 }}>
      <AdMetric label="Open disputes" value={open.length} icon="flag" deltaTone="red" delta={open.length ? "needs review" : "clear"} />
      <AdMetric label="Suspended pros" value="2" icon="user-off" />
      <AdMetric label="Hygiene score" value="A−" delta="directory healthy" icon="shield-check" />
    </div>
    <Panel title="Verification compliance & safety queue" pad={false}>
      {open.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", color: "var(--text-3)" }}><Icon name="shield-check" size={40} style={{ color: "var(--green-fg)" }} /><div style={{ marginTop: 10, fontWeight: 600 }}>Queue clear — marketplace hygiene maintained.</div></div>
      ) : (
        <Table cols={[{ key: "id", label: "Log", w: 120 }, { key: "who", label: "Profile", w: 200 }, { key: "ctx", label: "Infraction" }, { key: "act", label: "Override", align: "right", w: 220 }]}
          rows={open}
          render={(r, k) => {
            if (k === "id") return <span><strong className="mono" style={{ fontSize: 12.5 }}>#{r.id}</strong><div style={{ marginTop: 4 }}><Pill tone={r.sev}>{r.sev === "red" ? "High" : "Medium"}</Pill></div></span>;
            if (k === "who") return <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={r.who} size={32} /><div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{r.who}</div><div style={{ fontSize: 12, color: "var(--text-3)" }}>{r.trade}</div></div></div>;
            if (k === "ctx") return <span style={{ fontSize: 13, color: "var(--text-2)" }}>{r.ctx}</span>;
            return <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <AdBtn tone="green" icon="check" onClick={() => { setResolved([...resolved, r.id]); toast("Dispute dismissed & archived."); }}>Dismiss</AdBtn>
              <AdBtn tone="red" icon="ban" onClick={() => { setResolved([...resolved, r.id]); toast("Profile suspended — hidden from directory."); }}>Suspend</AdBtn>
            </div>;
          }} />
      )}
    </Panel>
  </>);
}

/* 3.4 — Pro Ledger */
function V3_4_Ledger() {
  const rows = [
    { id: 1, name: "Marcus Bell", trade: "Plumbing", krafts: 12, recs: 42, sla: "1h 52m", plan: "Annual", status: "Active" },
    { id: 2, name: "Tasha Quinn", trade: "Drywall & Paint", krafts: 9, recs: 31, sla: "2h 10m", plan: "Monthly", status: "Active" },
    { id: 3, name: "Leo Park", trade: "Electrical", krafts: 7, recs: 27, sla: "3h 04m", plan: "Annual", status: "Active" },
    { id: 4, name: "Ramon Alvarez", trade: "HVAC", krafts: 15, recs: 38, sla: "5h 20m", plan: "Monthly", status: "At risk" },
    { id: 5, name: "Bea Foster", trade: "Tile & Flooring", krafts: 6, recs: 19, sla: "2h 41m", plan: "Annual", status: "Active" },
    { id: 6, name: "M. Reyes", trade: "Roofing", krafts: 2, recs: 4, sla: "—", plan: "Monthly", status: "Suspended" },
  ];
  return wrap(<>
    <Panel title="Pro ledger · 142 active" pad={false}
      action={<div style={{ display: "flex", gap: 10 }}><SearchBox placeholder="Search pros…" w={220} /><AdBtn tone="primary" icon="user-plus">Invite pro</AdBtn></div>}>
      <Table cols={[{ key: "name", label: "Pro" }, { key: "trade", label: "Trade", w: 150 }, { key: "krafts", label: "Krafts", align: "center", w: 80 }, { key: "recs", label: "Recs", align: "center", w: 80 }, { key: "sla", label: "Avg SLA", align: "center", w: 100 }, { key: "plan", label: "Plan", w: 100 }, { key: "status", label: "Status", align: "right", w: 120 }]}
        rows={rows}
        render={(r, k) => {
          if (k === "name") return <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={r.name} size={32} /><span style={{ fontWeight: 600 }}>{r.name}</span></div>;
          if (k === "krafts" || k === "recs") return <span className="mono" style={{ fontWeight: 600 }}>{r[k]}</span>;
          if (k === "sla") return <span className="mono" style={{ color: r.status === "At risk" ? "var(--yellow-fg)" : "var(--text-2)" }}>{r.sla}</span>;
          if (k === "plan") return <Pill tone="gray">{r.plan}</Pill>;
          if (k === "status") return <Pill tone={r.status === "Active" ? "green" : r.status === "At risk" ? "yellow" : "red"} dot>{r.status}</Pill>;
          return r[k];
        }} />
    </Panel>
  </>);
}

/* 3.5 — Kraft Verification (enforce mandatory After) */
function V3_5_Krafts({ toast }) {
  const [acted, setActed] = useV([]);
  const rows = [
    { id: "KR-4471", pro: "Ramon Alvarez", title: "Condenser swap", cost: "$3,400", hasAfter: true, hasInvoice: true },
    { id: "KR-4480", pro: "M. Reyes", title: "Ridge cap re-seal", cost: "$620", hasAfter: false, hasInvoice: true },
    { id: "KR-4488", pro: "Bea Foster", title: "Master bath re-tile", cost: "$2,150", hasAfter: true, hasInvoice: false },
  ];
  const open = rows.filter((r) => !acted.includes(r.id));
  return wrap(<>
    <div style={{ display: "flex", gap: 16 }}>
      <AdMetric label="Awaiting review" value={open.length} icon="photo-check" />
      <AdMetric label="Verified this week" value="48" delta="+12" icon="discount-check" />
      <AdMetric label="Rejected" value="3" icon="photo-x" deltaTone="red" delta="missing proof" />
    </div>
    <Panel title="Kraft verification queue" action={<Pill tone="blue">Mandatory After + invoice</Pill>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {open.map((r) => {
          const ok = r.hasAfter && r.hasInvoice;
          return (
            <div key={r.id} style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              <BeforeAfter h={130} before={r.title} after={r.hasAfter ? "after photo" : "MISSING after"} />
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={r.pro} size={30} />
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.title}</div><div style={{ fontSize: 12, color: "var(--text-3)" }}>{r.pro} · <span className="mono">#{r.id}</span></div></div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Pill tone={r.hasAfter ? "green" : "red"} dot>{r.hasAfter ? "After photo" : "No After"}</Pill>
                  <Pill tone={r.hasInvoice ? "green" : "red"} dot>{r.hasInvoice ? `Invoice ${r.cost}` : "No invoice"}</Pill>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <AdBtn tone="red" icon="x" onClick={() => { setActed([...acted, r.id]); toast("Kraft rejected — pro notified to add proof."); }}>Reject</AdBtn>
                  <AdBtn tone={ok ? "green" : "ghost"} icon="check" onClick={() => { if (!ok) { toast("Can't verify — proof incomplete."); return; } setActed([...acted, r.id]); toast("Kraft verified & published."); }} style={{ flex: 1, justifyContent: "center", opacity: ok ? 1 : .5, cursor: ok ? "pointer" : "not-allowed" }}>Verify</AdBtn>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {open.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "var(--text-3)" }}><Icon name="checks" size={36} style={{ color: "var(--green-fg)" }} /><div style={{ marginTop: 10, fontWeight: 600 }}>All Krafts reviewed.</div></div>}
    </Panel>
  </>);
}

/* 3.6 — Node Settings & Billing */
function V3_6_Settings({ toast }) {
  const [autoblast, setAutoblast] = useV(true);
  const [escalate, setEscalate] = useV(true);
  const Row = ({ label, desc, on, set }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
      <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div><div style={{ fontSize: 12.5, color: "var(--text-3)", marginTop: 2 }}>{desc}</div></div>
      <button onClick={() => set(!on)} className={`gk-switch${on ? " gk-switch--on" : ""}`}><span className="gk-switch__dot" /></button>
    </div>
  );
  return wrap(<>
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
      <Panel title="Node configuration">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Row label="Auto-blast emergencies" desc="Dispatch unrouted tasks to pros over SMS + WhatsApp automatically" on={autoblast} set={setAutoblast} />
          <Row label="15-min escalation alerts" desc="Notify me if a task sits unassigned past the threshold" on={escalate} set={setEscalate} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
          <label className="gk-field"><span className="gk-field__label">Node ID</span><input className="gk-input mono" defaultValue="southwest-us-04" /></label>
          <label className="gk-field"><span className="gk-field__label">Response SLA</span>
            <select className="gk-input" defaultValue="4"><option value="2">2 hours</option><option value="4">4 hours</option><option value="8">8 hours</option></select>
          </label>
        </div>
        <div style={{ marginTop: 18 }}><AdBtn tone="primary" icon="device-floppy" onClick={() => toast("Node settings saved.")}>Save changes</AdBtn></div>
      </Panel>
      <Panel title="Node billing ledger">
        <div style={{ padding: 16, borderRadius: 12, background: "var(--green-bg)", border: "1px solid var(--green-bd)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green-fg)", letterSpacing: ".4px" }}>MONTHLY RUN RATE</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: "var(--green-fg)", marginTop: 6 }}>$2,838.58</div>
          <div style={{ fontSize: 12.5, color: "var(--green-fg)", opacity: .85, marginTop: 4 }}>142 pros · blended $19.99/mo + annual</div>
        </div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 0 }}>
          {[["Subscriptions (monthly)", "$1,919.04"], ["Annual amortized", "$782.54"], ["Lead surcharges", "$137.00"]].map(([k, v], i, a) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: i < a.length - 1 ? "1px solid var(--border)" : "none", fontSize: 13.5 }}><span style={{ color: "var(--text-2)" }}>{k}</span><span className="mono" style={{ fontWeight: 700 }}>{v}</span></div>
          ))}
        </div>
        <div style={{ marginTop: 16 }}><AdBtn tone="default" icon="download" onClick={() => toast("Exporting node ledger…")}>Export CSV</AdBtn></div>
      </Panel>
    </div>
  </>);
}

Object.assign(window, { V3_1_Ops, V3_2_Triage, V3_3_Safety, V3_4_Ledger, V3_5_Krafts, V3_6_Settings });
