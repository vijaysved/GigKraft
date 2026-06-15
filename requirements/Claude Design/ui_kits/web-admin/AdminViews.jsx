/* global React, BrowserShell, Sidebar, MetricTile, SectionHead, InlineBtn */
// GigKraft Admin — views + app shell (Community Node Manager console).

const { useState } = React;

const NAV = [
  { id: "ops", icon: "⚡", label: "Regional Core Ops" },
  { id: "triage", icon: "📡", label: "Cross-Channel Desk" },
  { id: "safety", icon: "⚠️", label: "Safety & Hygiene" },
];

function OpsView({ toast }) {
  return (
    <div>
      <SectionHead title="Regional Core Operations Command" badge="HUB: SOUTHWEST US-04" />
      <div className="ad-metrics">
        <MetricTile k="PENDING TRIAGE" v="3 Tasks" />
        <MetricTile k="ACTIVE LEDGER PROS" v="142 Pros" />
        <MetricTile k="MONTHLY RUN RATE" v="$2,838.58" accent />
      </div>
      <p className="ad-note">
        This control screen monitors real-time regional key metrics. Programmatic alerts fire instantly
        if emergency requests sit unassigned for more than 15 minutes.
      </p>
      <div className="ad-feed-head">Recent Node Activity</div>
      <div className="ad-activity">
        <div className="ad-act"><span className="ad-act__dot" style={{ background: "var(--gk-success)" }} /><span><strong>Dave Miller</strong> published a Kraft · Copper Pipe Valve Resolder · $120.00</span><span className="ad-act__t">2m ago</span></div>
        <div className="ad-act"><span className="ad-act__dot" style={{ background: "var(--gk-orange)" }} /><span><strong>Emergency broadcast</strong> received · Kitchen Pipe Burst · Downtown</span><span className="ad-act__t">8m ago</span></div>
        <div className="ad-act"><span className="ad-act__dot" style={{ background: "var(--gk-info)" }} /><span><strong>R. Alvarez</strong> claimed lead · Breaker Panel Trip · Eastside</span><span className="ad-act__t">14m ago</span></div>
      </div>
    </div>
  );
}

function TriageView({ toast }) {
  const rows = [
    { id: "TSK-8902", ctx: "Kitchen Pipe Main Line Burst", sub: "Water pooling on floor • Downtown Node", budget: "$120.00" },
    { id: "TSK-8911", ctx: "Breaker Panel Total Trip", sub: "No power to property • Eastside Node", budget: "$240.00" },
  ];
  return (
    <div>
      <SectionHead title="Cross-Channel Outreach Triage Desk" />
      <table className="ad-table">
        <thead>
          <tr><th>Task ID</th><th>Context Parameters</th><th>Budget</th><th>Outbound Dispatch Triggers</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td><strong>#{r.id}</strong></td>
              <td><strong>{r.ctx}</strong><br /><span className="ad-sub">{r.sub}</span></td>
              <td className="ad-price">{r.budget}</td>
              <td>
                <div className="ad-actions">
                  <InlineBtn tone="whatsapp" onClick={() => toast("WhatsApp Business blast dispatched.")}>WhatsApp Blast</InlineBtn>
                  <InlineBtn tone="sms" onClick={() => toast("Twilio SMS pin broadcast.")}>SMS Pin</InlineBtn>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="ad-note">Beams payload data instantly to proven local pros over native SMS and WhatsApp automation channels.</p>
    </div>
  );
}

function SafetyView({ toast }) {
  const [hidden, setHidden] = useState([]);
  const rows = [
    { id: "DISP-302", who: "John Doe (Carpenter)", ctx: "Reported off-platform pricing variance vs visual portfolio parameters." },
    { id: "DISP-318", who: "M. Reyes (Roofer)", ctx: "Missing mandatory After image on 2 published Krafts." },
  ];
  return (
    <div>
      <SectionHead title="Verification Compliance & Safety Queue" />
      <table className="ad-table">
        <thead>
          <tr><th>Log ID</th><th>Target Profile</th><th>Infraction Context</th><th>Override Options</th></tr>
        </thead>
        <tbody>
          {rows.filter((r) => !hidden.includes(r.id)).map((r) => (
            <tr key={r.id}>
              <td><strong>#{r.id}</strong></td>
              <td>{r.who}</td>
              <td className="ad-infraction">{r.ctx}</td>
              <td>
                <div className="ad-actions">
                  <InlineBtn tone="green" onClick={() => { setHidden((h) => [...h, r.id]); toast("Dispute dismissed & archived."); }}>Dismiss</InlineBtn>
                  <InlineBtn tone="red" onClick={() => { setHidden((h) => [...h, r.id]); toast("Profile suspended (hidden from directory)."); }}>Suspend</InlineBtn>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.every((r) => hidden.includes(r.id)) && <p className="ad-note">✅ Queue clear — local marketplace hygiene maintained.</p>}
    </div>
  );
}

function AdminApp() {
  const [view, setView] = useState("ops");
  const [toastMsg, setToastMsg] = useState(null);
  const toast = (m) => { setToastMsg(m); clearTimeout(window.__adT); window.__adT = setTimeout(() => setToastMsg(null), 2200); };
  const Views = { ops: OpsView, triage: TriageView, safety: SafetyView };
  const Active = Views[view];

  return (
    <div className="ad-stage">
      <BrowserShell url="https://admin.gigkraft.com/node/southwest-us-04/control-panel">
        <div className="ad-layout">
          <Sidebar items={NAV} active={view} onNav={setView} />
          <div className="ad-canvas"><Active toast={toast} /></div>
        </div>
      </BrowserShell>
      {toastMsg && <div className="ad-toast">{toastMsg}</div>}
    </div>
  );
}

Object.assign(window, { AdminApp });
