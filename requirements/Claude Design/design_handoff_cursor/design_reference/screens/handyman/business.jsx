/* global React, AppBar, Screen, Body, Card, Btn, IconBtn, TextInput, Icon, Eyebrow, Divider, Photo, Avatar, Badge, Segmented, Stat, BarChart */
// GigKraft Handyman — Analytics, Billing, Network + Account hub (1.11–1.13).
const { useState: useStateB } = React;

/* 1.11 — Performance & Analytics */
function S1_11_Analytics({ tabBar }) {
  const [range, setRange] = useStateB("30");
  return (
    <Screen
      appBar={<AppBar title="Performance" subtitle="Your numbers in node SW‑04" right={<IconBtn icon="download" />} />}
      tabBar={tabBar}>
      <div style={{ padding: "12px 16px 6px", position: "sticky", top: 0, background: "var(--bg)", zIndex: 2 }}>
        <Segmented value={range} onChange={setRange} options={[{ value: "7", label: "7 days" }, { value: "30", label: "30 days" }, { value: "90", label: "90 days" }]} />
      </div>
      <Body style={{ paddingTop: 6 }}>
        <Eyebrow>Profile</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Stat k="Profile views" v="1,284" delta="+18%" icon="eye" />
          <Stat k="Search appearances" v="3,902" delta="+9%" icon="search" />
          <Stat k="Link clicks" v="221" delta="+24%" icon="link" />
          <Stat k="Won jobs" v="14" delta="+3" icon="briefcase" />
        </div>

        <Eyebrow style={{ marginTop: 4 }}>Leads</Eyebrow>
        <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600 }}>Conversion rate</div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.5px" }}>38%</div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>14 won of 37 inquiries</div>
            </div>
            <div style={{ width: 76, height: 76, borderRadius: "50%", background: `conic-gradient(var(--primary) 0 38%, var(--bg-2) 38% 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>38%</div>
            </div>
          </div>
          <Divider />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--green-bg)", color: "var(--green-fg)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="clock-check" size={20} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>Avg response 1h 52m</div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>Well inside your 4‑hour promise</div>
            </div>
            <Badge tone="green" icon="check">On target</Badge>
          </div>
        </Card>

        <Eyebrow style={{ marginTop: 4 }}>Revenue</Eyebrow>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.5px" }}>$11,460</div>
            <Badge tone="green" icon="trending-up">+22% vs prev</Badge>
          </div>
          <BarChart data={[{ l: "Jan", v: 1.2 }, { l: "Feb", v: 1.6 }, { l: "Mar", v: 1.4 }, { l: "Apr", v: 2.1 }, { l: "May", v: 2.4 }, { l: "Jun", v: 2.7, hl: true }]} />
        </Card>

        <Eyebrow style={{ marginTop: 4 }}>Trust</Eyebrow>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Stat k="Approved recs" v="42" icon="rosette-discount-check" />
          <Stat k="Pending requests" v="3" icon="hourglass" deltaTone="muted" />
        </div>
      </Body>
    </Screen>
  );
}

/* 1.12 — Subscription & Billing */
const INVOICES = [
  { id: "GK‑20460", date: "Jun 1, 2026", amt: "$199.00" },
  { id: "GK‑19884", date: "Jun 1, 2025", amt: "$199.00" },
  { id: "GK‑11237", date: "Apr 12, 2025", amt: "$19.99" },
];
function S1_12_Billing({ go, toast }) {
  return (
    <Screen appBar={<AppBar title="Subscription & billing" onBack={() => go("account")} />}>
      <Body>
        <Card padLg style={{ background: "linear-gradient(135deg, var(--blue-7), var(--blue-9))", border: "none", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".5px", opacity: .8 }}>CURRENT PLAN</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>Pro Vault · Annual</div>
            </div>
            <Icon name="discount-check-filled" size={30} style={{ opacity: .9 }} />
          </div>
          <div style={{ marginTop: 16, fontSize: 13, opacity: .85 }}>Renews <strong>June 1, 2027</strong> · $199/yr</div>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TextInput label="Coupon code" icon="ticket" placeholder="Enter code" defaultValue="" />
          <Btn variant="light" size="sm" onClick={() => toast("Coupon applied — 20% off next renewal.")}>Apply coupon</Btn>
        </Card>

        <div>
          <div className="gk-field__label" style={{ marginBottom: 8 }}>Payment method</div>
          <Card style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 30, borderRadius: 6, background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="credit-card" size={20} style={{ color: "var(--text-2)" }} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }} className="mono">•••• 8832</div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>Visa · expires 12/28</div>
            </div>
            <Btn variant="default" size="xs" onClick={() => toast("Opening secure card update…")}>Update</Btn>
          </Card>
        </div>

        <div>
          <Eyebrow style={{ marginBottom: 8 }}>Billing history</Eyebrow>
          <Card flat style={{ padding: 4 }}>
            {INVOICES.map((inv, i) => (
              <div key={inv.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 10px" }}>
                  <Icon name="file-invoice" size={20} style={{ color: "var(--text-3)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }} className="mono">{inv.id}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)" }}>{inv.date}</div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{inv.amt}</span>
                  <IconBtn icon="download" onClick={() => toast("Downloading " + inv.id)} />
                </div>
                {i < INVOICES.length - 1 && <Divider />}
              </div>
            ))}
          </Card>
        </div>
      </Body>
    </Screen>
  );
}

/* 1.13 — B2B Networking Search */
const PROS = [
  { name: "Tasha Quinn", trade: "Drywall & Paint", dist: "2.1 mi", phone: "(602) 555‑0192", tags: ["Patch", "Texture"] },
  { name: "Leo Park", trade: "Electrical", dist: "3.4 mi", phone: "(602) 555‑0177", tags: ["Panels", "EV chargers"] },
  { name: "Ramon Alvarez", trade: "HVAC", dist: "4.0 mi", phone: "(480) 555‑0143", tags: ["AC", "Ducting"] },
  { name: "Bea Foster", trade: "Tile & Flooring", dist: "5.2 mi", phone: "(480) 555‑0110", tags: ["Bath", "LVP"] },
];
function S1_13_Network({ tabBar, toast }) {
  return (
    <Screen
      appBar={<AppBar title="Pro network" subtitle="Find complementary trades to refer" />}
      tabBar={tabBar}>
      <div style={{ padding: "12px 16px 6px", position: "sticky", top: 0, background: "var(--bg)", zIndex: 2, display: "flex", gap: 8 }}>
        <div className="gk-input-wrap" style={{ flex: 2 }}><Icon name="tools" className="gk-input-wrap__icon" /><input className="gk-input" placeholder="Trade or skill" defaultValue="" /></div>
        <div className="gk-input-wrap" style={{ flex: 1 }}><input className="gk-input mono" placeholder="ZIP" defaultValue="85004" /></div>
      </div>
      <Body style={{ paddingTop: 6 }} gap={10}>
        <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600 }}>{PROS.length} pros near 85004</div>
        {PROS.map((p) => (
          <Card key={p.name} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Avatar name={p.name} size={46} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 600 }}>{p.trade}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                {p.tags.map((t) => <span key={t} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", background: "var(--bg-2)", padding: "2px 8px", borderRadius: 999 }}>{t}</span>)}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <span style={{ fontSize: 12, color: "var(--text-3)", display: "inline-flex", alignItems: "center", gap: 3 }}><Icon name="map-pin" size={13} />{p.dist}</span>
              <IconBtn icon="phone" onClick={() => toast("Calling " + p.name)} />
            </div>
          </Card>
        ))}
      </Body>
    </Screen>
  );
}

/* Account hub — ties the secondary screens together (Account tab) */
function AccountHub({ go, tabBar }) {
  const groups = [
    { title: "Recommendations", items: [
      { icon: "send", label: "Request a recommendation", to: "s1_7" },
      { icon: "checkup-list", label: "Review queue", to: "s1_8", badge: "3" },
    ] },
    { title: "Profile", items: [
      { icon: "map-pin", label: "Service area", to: "s1_2" },
      { icon: "photo", label: "Profile look", to: "s1_3" },
      { icon: "shield-check", label: "Credentials", to: "s1_4" },
      { icon: "tools", label: "Trade & skills", to: "s1_5" },
    ] },
    { title: "Account", items: [
      { icon: "credit-card", label: "Subscription & billing", to: "s1_12" },
    ] },
  ];
  return (
    <Screen appBar={<AppBar title="Account" right={<IconBtn icon="settings" />} />} tabBar={tabBar}>
      <Body>
        <Card style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar name="Marcus Bell" size={56} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 17 }}>Marcus Bell</div>
            <div style={{ fontSize: 13, color: "var(--text-3)" }}>Plumbing Pro · SW‑04</div>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <Badge tone="green" icon="discount-check">Verified</Badge>
              <Badge tone="blue" icon="shield-check">Insured</Badge>
            </div>
          </div>
        </Card>
        {groups.map((g) => (
          <div key={g.title}>
            <Eyebrow style={{ marginBottom: 8 }}>{g.title}</Eyebrow>
            <Card flat style={{ padding: 4 }}>
              {g.items.map((it, i) => (
                <div key={it.label}>
                  <button onClick={() => go(it.to)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 10px", background: "none", border: "none", cursor: "pointer", color: "var(--text)", textAlign: "left" }}>
                    <Icon name={it.icon} size={20} style={{ color: "var(--text-2)" }} />
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5 }}>{it.label}</span>
                    {it.badge && <span style={{ minWidth: 20, height: 20, borderRadius: 999, background: "var(--primary)", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>{it.badge}</span>}
                    <Icon name="chevron-right" size={18} style={{ color: "var(--text-3)" }} />
                  </button>
                  {i < g.items.length - 1 && <Divider />}
                </div>
              ))}
            </Card>
          </div>
        ))}
      </Body>
    </Screen>
  );
}

Object.assign(window, { S1_11_Analytics, S1_12_Billing, S1_13_Network, AccountHub });
