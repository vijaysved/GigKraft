/* global React, PhoneFrame, GkButton, GkInput, GkCard, GkBadge, GkStatus, BeforeAfter, GkEyebrow */
// GigKraft Mobile — screens + click-through state machine.

const { useState } = React;

const PRO_TABS = [
  { id: "pro-dash", icon: "📊", label: "Dashboard" },
  { id: "pro-add", icon: "➕", label: "Add Kraft" },
  { id: "pro-billing", icon: "💳", label: "Billing" },
];
const CLIENT_TABS = [
  { id: "client-feed", icon: "🔍", label: "Discover" },
  { id: "client-broadcast", icon: "🚨", label: "Emergency" },
];

// ---------- GUEST ----------
function SplashScreen({ go }) {
  return (
    <PhoneFrame brand="gigkraft" brandTail=".com" right={<span className="gk-loc">📍 SW-04</span>}>
      <div className="gk-splash">
        <img className="gk-splash__logo" src="../../assets/gigkraft-logo.png" alt="GigKraft" />
        <h1 className="gk-splash__h">Local Handyman Proof, Fast.</h1>
        <p className="gk-splash__p">
          Skip the reviews. See actual before/after invoices confirmed within your immediate zip code node.
        </p>
        <GkButton variant="navy" onClick={() => go("router")}>Enter Neighborhood Hub</GkButton>
      </div>
    </PhoneFrame>
  );
}

function RouterScreen({ go }) {
  return (
    <PhoneFrame brand="gigkraft" brandTail="" right={<span className="gk-hsub">Intent Route</span>}>
      <div className="gk-router">
        <GkEyebrow>Screen 2 of 4 • Onboarding</GkEyebrow>
        <GkCard variant="select" onClick={() => go("signup")} style={{ textAlign: "center" }}>
          <h3 className="gk-router__t gk-router__t--o">🔧 I am a Trade Pro</h3>
          <p className="gk-router__p">Publish case studies &amp; claim local leads for $19.99/mo.</p>
        </GkCard>
        <GkCard onClick={() => go("client-feed")} style={{ textAlign: "center" }}>
          <h3 className="gk-router__t">🏠 I Need to Hire</h3>
          <p className="gk-router__p">Search local project feeds and post emergency broadcasts.</p>
        </GkCard>
      </div>
    </PhoneFrame>
  );
}

function SignupScreen({ go, toast }) {
  const [phone, setPhone] = useState("+1 (555) 014-9988");
  return (
    <PhoneFrame brand="gigkraft" brandTail="" right={<span className="gk-hsub">Secure Account</span>}>
      <div className="gk-stack">
        <GkEyebrow>Screen 3 of 4 • Onboarding</GkEyebrow>
        <GkCard>
          <GkInput
            label="Enter Mobile Terminal Number"
            value={phone}
            onChange={setPhone}
            hint="A secure 4-digit token challenge will be issued instantly via SMS."
          />
        </GkCard>
        <GkButton onClick={() => { toast("SMS token broadcast triggered."); go("paywall"); }}>
          Issue Verification Token
        </GkButton>
      </div>
    </PhoneFrame>
  );
}

function PaywallScreen({ go, toast }) {
  return (
    <PhoneFrame brand="gk" brandTail=".pro" right={<span className="gk-hsub">Ledger Setup</span>}>
      <div className="gk-stack">
        <GkEyebrow>Screen 4 of 4 • Onboarding</GkEyebrow>
        <GkCard variant="hero">
          <h3 className="gk-hero__t">GigKraft Pro Vault Tier</h3>
          <p className="gk-hero__p">$19.99 / month micro-subscription ledger</p>
        </GkCard>
        <GkCard>
          <GkInput label="Credit Card Number" value="4111 •••• •••• 8832" onChange={() => {}} />
          <div className="gk-grid2">
            <GkInput label="Expiry" value="12/28" onChange={() => {}} />
            <GkInput label="CVC" value="092" onChange={() => {}} />
          </div>
        </GkCard>
        <GkButton onClick={() => { toast("Account set to PRO ACTIVE."); go("pro-dash"); }}>
          Activate Account ($19.99)
        </GkButton>
      </div>
    </PhoneFrame>
  );
}

// ---------- PRO TRACK ----------
function ProDashboard({ go }) {
  return (
    <PhoneFrame brand="gk" brandTail=".pro" tabs={PRO_TABS} activeTab="pro-dash" onTab={go}
      right={<GkStatus>Active</GkStatus>}>
      <div className="gk-stack">
        <div className="gk-grid2">
          <GkCard style={{ textAlign: "center" }}>
            <span className="gk-metric__k">VIEWS</span>
            <div className="gk-metric__v gk-metric__v--o">42 Pros</div>
          </GkCard>
          <GkCard style={{ textAlign: "center" }}>
            <span className="gk-metric__k">OPEN GIGS</span>
            <div className="gk-metric__v">3 Leads</div>
          </GkCard>
        </div>
        <p className="gk-section-lbl">⚡ Live Local Pro Triage Alerts</p>
        <GkCard style={{ borderLeft: "5px solid var(--gk-orange)" }}>
          <div className="gk-lead__t">Kitchen Line Valve Leak</div>
          <p className="gk-lead__p">Proximity: 1.4 miles away • Downtown</p>
          <GkButton style={{ marginTop: 8, padding: "7px" }} onClick={() => go("pro-chat")}>
            Claim Chat Routing
          </GkButton>
        </GkCard>
        <GkCard style={{ borderLeft: "5px solid var(--gk-muted)" }}>
          <div className="gk-lead__t">Breaker Panel Trip</div>
          <p className="gk-lead__p">Proximity: 2.8 miles away • Eastside</p>
          <GkButton variant="secondary" style={{ marginTop: 8, padding: "7px" }} onClick={() => go("pro-chat")}>
            Claim Chat Routing
          </GkButton>
        </GkCard>
      </div>
    </PhoneFrame>
  );
}

function ProAddKraft({ go, toast }) {
  const [active, setActive] = useState(false);
  return (
    <PhoneFrame brand="gk" brandTail=".pro" tabs={PRO_TABS} activeTab="pro-add" onTab={go}
      right={<span className="gk-hsub">Add Case Asset</span>}>
      <div className="gk-stack">
        <GkCard>
          <GkInput label="Project Title Descriptor" value="Copper Pipe Valve Resolder" onChange={() => {}} />
          <div className="gk-grid2" style={{ margin: "10px 0" }}>
            <div className="gk-upload gk-upload--optional">📷 Before<br /><small>(Optional)</small></div>
            <div
              className={`gk-upload gk-upload--mandatory ${active ? "gk-upload--filled" : ""}`}
              onClick={() => setActive(true)}
            >
              {active ? "✅ After Saved" : <>✨ After Image<br /><small>(MANDATORY)</small></>}
            </div>
          </div>
          <GkInput label="Real Final Job Cost ($)" value="120.00" onChange={() => {}} />
        </GkCard>
        <GkButton
          onClick={() =>
            active ? toast("Case study published to node directory.") : toast("⚠️ After image is mandatory.")
          }
        >
          Publish Portfolio Record
        </GkButton>
      </div>
    </PhoneFrame>
  );
}

function ProMessenger({ go, toast }) {
  const [draft, setDraft] = useState("Heading out now...");
  return (
    <PhoneFrame brand="gk" brandTail=".chat" right={<span className="gk-hsub">T. Jenkins</span>}>
      <div className="gk-chat">
        <button className="gk-back" onClick={() => go("pro-dash")}>‹ Back to dashboard</button>
        <div className="gk-chat__feed">
          <div className="gk-bubble gk-bubble--them">
            Water is isolated at the street valve but the kitchen floor is getting soggy. Can you fix today?
          </div>
          <div className="gk-bubble gk-bubble--me">
            Yes — torch and solder fittings are loaded in my rig now. Sticking to the $120 baseline.
          </div>
        </div>
        <div className="gk-chat__compose">
          <input className="gk-field__input" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <GkButton style={{ width: "auto", padding: "9px 13px" }} onClick={() => { toast("Message dispatched."); setDraft(""); }}>➔</GkButton>
        </div>
      </div>
    </PhoneFrame>
  );
}

function ProBilling({ go, toast }) {
  return (
    <PhoneFrame brand="gk" brandTail=".vault" tabs={PRO_TABS} activeTab="pro-billing" onTab={go}
      right={<span className="gk-hsub">Ledger</span>}>
      <div className="gk-stack">
        <GkCard>
          <div className="gk-metric__k">CURRENT STATUS</div>
          <GkStatus>Subscription Paid</GkStatus>
          <p className="gk-lead__p" style={{ marginTop: 6 }}>Next billing recurrence: <strong>June 1, 2026</strong></p>
        </GkCard>
        <GkButton variant="secondary" onClick={() => toast("Opening secure card update link...")}>Update Card Credentials</GkButton>
        <GkButton variant="danger" onClick={() => toast("Subscription ledger paused.")}>Pause Account Subscription</GkButton>
      </div>
    </PhoneFrame>
  );
}

// ---------- CLIENT TRACK ----------
function ClientFeed({ go }) {
  return (
    <PhoneFrame brand="gk" brandTail=".feed" tabs={CLIENT_TABS} activeTab="client-feed" onTab={go}
      right={<span className="gk-hsub">Plumbing</span>}>
      <div className="gk-stack">
        <GkInput value="Search Plumbing Proof..." onChange={() => {}} />
        <GkCard onClick={() => go("client-proof")}>
          <BeforeAfter before="LEAK VALVE" after="RESOLDER OK" height={88} />
          <div className="gk-lead__t" style={{ marginTop: 8 }}>Dave Miller • Plumbing Pro</div>
          <div className="gk-price">Verified Job Invoice: $120.00</div>
        </GkCard>
        <GkCard onClick={() => go("client-proof")}>
          <BeforeAfter before="DEAD PANEL" after="NEW BREAKER" height={88} />
          <div className="gk-lead__t" style={{ marginTop: 8 }}>R. Alvarez • Electrical Pro</div>
          <div className="gk-price">Verified Job Invoice: $240.00</div>
        </GkCard>
      </div>
    </PhoneFrame>
  );
}

function ClientProof({ go, toast }) {
  return (
    <PhoneFrame brand="gk" brandTail=".proof" right={<span className="gk-hsub">Case #902</span>}>
      <div className="gk-stack">
        <button className="gk-back" onClick={() => go("client-feed")}>‹ Back to feed</button>
        <BeforeAfter before="GREY CORROSION Main Line Rupture" after="SHINY NEW PVC Fittings Resoldered" height={140} />
        <GkCard>
          <h3 className="gk-router__t">Dave Miller</h3>
          <p className="gk-lead__p">Verified Regional Invoice: $120.00 total</p>
          <p className="gk-quote">“Dave responded instantly during the valve rupture emergency and handled the line fitting isolation flawlessly.”</p>
        </GkCard>
        <GkButton onClick={() => { toast("Secure messenger thread opened."); go("client-review"); }}>
          Request Direct Quote From Pro
        </GkButton>
      </div>
    </PhoneFrame>
  );
}

function ClientBroadcast({ go, toast }) {
  return (
    <PhoneFrame brand="gk" brandTail=".triage" tabs={CLIENT_TABS} activeTab="client-broadcast" onTab={go}
      right={<span className="gk-hsub">Fast Post</span>}>
      <div className="gk-stack">
        <GkBadge tone="orange">🚨 Emergency Broadcast</GkBadge>
        <GkCard>
          <GkInput label="Describe the Problem" value="Kitchen pipe main valve leak. Water pooling on flooring." onChange={() => {}} />
          <GkInput label="Proposed Budget ($)" value="120.00" onChange={() => {}} />
        </GkCard>
        <GkButton onClick={() => toast("Broadcast beamed to SW-04 node managers.")}>Blast to Local Node</GkButton>
      </div>
    </PhoneFrame>
  );
}

function ClientReview({ go, toast }) {
  const [stars, setStars] = useState(5);
  return (
    <PhoneFrame brand="gk" brandTail=".review" right={<span className="gk-hsub">Job Close</span>}>
      <div className="gk-stack">
        <GkCard style={{ textAlign: "center" }}>
          <div className="gk-lead__t">Rate Dave Miller's Fix</div>
          <div className="gk-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={n <= stars ? "on" : ""} onClick={() => setStars(n)}>★</span>
            ))}
          </div>
          <textarea className="gk-field__input" style={{ height: 64, resize: "none" }}
            defaultValue="Incredibly fast response and clean resolder line validation." />
        </GkCard>
        <GkButton onClick={() => { toast("Verified ledger entry submitted."); go("client-feed"); }}>
          Submit Verified Ledger Entry
        </GkButton>
      </div>
    </PhoneFrame>
  );
}

// ---------- APP SHELL ----------
function GkApp() {
  const [screen, setScreen] = useState("splash");
  const [toastMsg, setToastMsg] = useState(null);
  const toast = (m) => { setToastMsg(m); clearTimeout(window.__gkT); window.__gkT = setTimeout(() => setToastMsg(null), 2200); };
  const go = (s) => setScreen(s);

  const screens = {
    splash: SplashScreen, router: RouterScreen, signup: SignupScreen, paywall: PaywallScreen,
    "pro-dash": ProDashboard, "pro-add": ProAddKraft, "pro-chat": ProMessenger, "pro-billing": ProBilling,
    "client-feed": ClientFeed, "client-proof": ClientProof, "client-broadcast": ClientBroadcast, "client-review": ClientReview,
  };
  const Active = screens[screen];

  // Map for the role jump chips
  const chips = [
    { id: "splash", label: "Guest" },
    { id: "pro-dash", label: "Handyman Pro" },
    { id: "client-feed", label: "Consumer" },
  ];

  return (
    <div className="gk-stage">
      <div className="gk-chrome">
        <div className="gk-chrome__title">gigkraft<span>.app</span></div>
        <div className="gk-chrome__chips">
          {chips.map((c) => (
            <button key={c.id} className="gk-chip" onClick={() => go(c.id)}>{c.label}</button>
          ))}
        </div>
      </div>
      <div className="gk-device-wrap">
        <Active go={go} toast={toast} />
      </div>
      {toastMsg && <div className="gk-toast">{toastMsg}</div>}
    </div>
  );
}

Object.assign(window, { GkApp });
