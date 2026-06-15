/* global React, AppBar, Screen, Body, Card, Btn, IconBtn, TextInput, Textarea, Select, Segmented, Icon, Eyebrow, Divider, Photo, BeforeAfter, Avatar, Badge, Chip, Stars, Slider */
// GigKraft Consumer — screens 2.1–2.6 (homeowner discovery, emergency, review, account).
const { useState: useC, useRef: useCRef, useEffect: useCEffect } = React;

const PROOFS = [
  { id: "p1", pro: "Marcus Bell", trade: "Plumbing", title: "Copper riser re-pipe", dist: "1.4 mi", invoice: "$1,840", stars: 5, recs: 42, verified: true, tag: "Re-pipe" },
  { id: "p2", pro: "Tasha Quinn", trade: "Drywall & Paint", title: "Ceiling water-stain patch", dist: "2.1 mi", invoice: "$420", stars: 5, recs: 31, verified: true, tag: "Patch" },
  { id: "p3", pro: "Leo Park", trade: "Electrical", title: "Panel + EV charger", dist: "3.4 mi", invoice: "$2,160", stars: 4, recs: 27, verified: true, tag: "EV charger" },
  { id: "p4", pro: "Ramon Alvarez", trade: "HVAC", title: "Condenser swap", dist: "4.0 mi", invoice: "$3,400", stars: 5, recs: 38, verified: true, tag: "AC" },
];
const TRADES = ["All", "Plumbing", "Electrical", "HVAC", "Drywall", "Carpentry"];

/* 2.1 — Visual Discovery Feed */
function S2_1_Discover({ go, tabBar }) {
  const [trade, setTrade] = useC("All");
  const list = trade === "All" ? PROOFS : PROOFS.filter((p) => p.trade.includes(trade));
  return (
    <Screen
      appBar={<AppBar title="Discover proof" subtitle="Node SW-04 · before/after, not reviews"
        right={<IconBtn icon="bell" />} />}
      tabBar={tabBar}>
      <div style={{ padding: "12px 16px 6px", position: "sticky", top: 0, background: "var(--bg)", zIndex: 2 }}>
        <div className="gk-input-wrap"><Icon name="search" className="gk-input-wrap__icon" /><input className="gk-input" placeholder="Search a job — “slab leak”, “panel”…" /></div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 10, paddingBottom: 2 }} className="gk-scroll">
          {TRADES.map((t) => <button key={t} onClick={() => setTrade(t)} style={{ flex: "0 0 auto", fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 999, cursor: "pointer", border: `1px solid ${trade === t ? "var(--primary)" : "var(--border-2)"}`, background: trade === t ? "var(--tint)" : "var(--surface)", color: trade === t ? "var(--tint-text)" : "var(--text-2)" }}>{t}</button>)}
        </div>
      </div>
      <Body style={{ paddingTop: 6 }} gap={12}>
        {list.map((p) => (
          <Card key={p.id} press onClick={() => go("s2_2", p)} style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ position: "relative" }}>
              <BeforeAfter h={150} before={p.title} after="verified result" />
              {p.verified && <span style={{ position: "absolute", top: 10, right: 10, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 999, background: "var(--surface)", color: "var(--green-fg)", boxShadow: "var(--shadow-sm)" }}><Icon name="discount-check-filled" size={14} />Verified invoice</span>}
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={p.pro} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{p.title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--text-3)" }}>{p.pro} · {p.trade}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{p.invoice}</div>
                  <div style={{ fontSize: 11, color: "var(--text-3)" }}>actual cost</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, fontSize: 12.5, color: "var(--text-3)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Icon name="map-pin" size={14} />{p.dist}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}><Icon name="rosette-discount-check" size={14} />{p.recs} recommendations</span>
                <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 3, color: "var(--yellow-6)", fontWeight: 700 }}><Icon name="star-filled" size={14} />{p.stars}.0</span>
              </div>
            </div>
          </Card>
        ))}
      </Body>
    </Screen>
  );
}

/* 2.2 — Pro Profile / Proof Detail */
function S2_2_ProofDetail({ go, ctx }) {
  const p = ctx || PROOFS[0];
  const more = [["Slab leak repair", "$980"], ["Water heater swap", "$1,250"], ["Faucet + disposal", "$310"]];
  return (
    <Screen appBar={<AppBar onBack={() => go("s2_1")} left={<Avatar name={p.pro} size={38} />} title={p.pro} subtitle={`${p.trade} · ${p.dist}`} right={<IconBtn icon="heart" />} />}
      footer={<div style={{ display: "flex", gap: 10 }}>
        <Btn variant="default" leftIcon="message" auto style={{ flex: 1 }} onClick={() => go("s2_4")}>Message</Btn>
        <Btn leftIcon="file-dollar" auto style={{ flex: 2 }} onClick={() => go("s2_4")}>Request a quote</Btn>
      </div>}>
      <Body>
        <Card style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)" }}>{p.recs}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>RECS</div>
          </div>
          <Divider style={{ width: 1, height: 40 }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: "var(--yellow-6)" }}>{p.stars}.0</div>
            <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>RATING</div>
          </div>
          <Divider style={{ width: 1, height: 40 }} />
          <div style={{ flex: 1 }}>
            <Badge tone="green" icon="discount-check">Verified</Badge>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>Licensed · Insured · 4h response</div>
          </div>
        </Card>

        <div>
          <Eyebrow style={{ marginBottom: 8 }}>Featured Kraft · {p.title}</Eyebrow>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <BeforeAfter h={170} before={p.title} after="copper, pressure-tested" />
            <div style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: "var(--r-md)", background: "var(--green-bg)", border: "1px solid var(--green-bd)" }}>
                <Icon name="receipt" size={18} style={{ color: "var(--green-fg)" }} />
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--green-fg)" }}>Verified job invoice</span>
                <span className="mono" style={{ marginLeft: "auto", fontWeight: 800, color: "var(--green-fg)" }}>{p.invoice}</span>
              </div>
              <div style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.55, marginTop: 12 }}>Replaced corroded galvanized riser with type-L copper, pressure-tested the line and patched the drywall. Same-day invoice issued.</div>
            </div>
          </Card>
        </div>

        <div>
          <Eyebrow style={{ marginBottom: 8 }}>More verified work</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {more.map(([t, c]) => (
              <Card key={t} press style={{ padding: 0, overflow: "hidden" }}>
                <Photo h={84} filled tone="after" label={t} />
                <div style={{ padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t}</span>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "var(--green-fg)" }}>{c}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Eyebrow style={{ marginBottom: 8 }}>What clients say</Eyebrow>
          <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name="Priya Shah" size={34} /><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>Priya Shah</div><div style={{ fontSize: 11, color: "var(--text-3)" }}>Repeat client</div></div><Stars value={5} size={15} />
            </div>
            <div style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.55 }}>"Found the slab leak two other plumbers missed. Clean copper work, invoice same day."</div>
          </Card>
        </div>
      </Body>
    </Screen>
  );
}

/* 2.3 — Emergency Broadcast */
const EM_TYPES = [
  { id: "burst", icon: "droplet", label: "Burst pipe / leak" },
  { id: "power", icon: "bolt", label: "Power / electrical" },
  { id: "hvac", icon: "temperature", label: "No heat / AC" },
  { id: "lock", icon: "lock", label: "Lock / door" },
  { id: "other", icon: "alert-triangle", label: "Other" },
];
function S2_3_Emergency({ tabBar, go, toast }) {
  const [type, setType] = useC("burst");
  const [budget, setBudget] = useC(150);
  const [sent, setSent] = useC(false);
  if (sent) {
    return (
      <Screen appBar={<AppBar title="Broadcast live" />} tabBar={tabBar}>
        <Body gap={16} style={{ paddingTop: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}>
            <div style={{ width: 84, height: 84, borderRadius: "50%", background: "var(--red-bg)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <span style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid var(--red-fg)", animation: "gkpulse 1.6s ease-out infinite" }} />
              <Icon name="broadcast" size={40} style={{ color: "var(--red-fg)" }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Dispatched to 8 local pros</div>
            <div style={{ color: "var(--text-3)", fontSize: 14, maxWidth: 280 }}>Beamed over SMS + WhatsApp to proven pros within node SW-04. First to claim chats you directly.</div>
          </div>
          <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[["Marcus Bell", "Plumbing", "claimed · 1m"], ["Tasha Quinn", "Drywall", "notified"], ["Leo Park", "Electrical", "notified"]].map(([n, t, s]) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={n} size={36} /><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{n}</div><div style={{ fontSize: 12, color: "var(--text-3)" }}>{t}</div></div>
                <Badge tone={s.includes("claimed") ? "green" : undefined}>{s}</Badge>
              </div>
            ))}
          </Card>
          <Btn leftIcon="message" onClick={() => go("s2_4")}>Open chat with Marcus</Btn>
        </Body>
        <style>{`@keyframes gkpulse{0%{transform:scale(1);opacity:.9}100%{transform:scale(1.5);opacity:0}}`}</style>
      </Screen>
    );
  }
  return (
    <Screen
      appBar={<AppBar title="Emergency broadcast" subtitle="Blast nearby pros now" right={<Badge tone="red" icon="bolt">Live</Badge>} />}
      tabBar={tabBar}
      footer={<Btn variant="danger" leftIcon="broadcast" onClick={() => { setSent(true); toast("Broadcast sent to node SW-04."); }} style={{ background: "var(--red-6)", color: "#fff", border: "none" }}>Broadcast to local pros</Btn>}>
      <Body>
        <div>
          <div className="gk-field__label" style={{ marginBottom: 8 }}>What's the emergency?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {EM_TYPES.map((e) => (
              <button key={e.id} onClick={() => setType(e.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 12px", borderRadius: "var(--r-md)", cursor: "pointer", background: type === e.id ? "var(--tint)" : "var(--surface)", border: `1px solid ${type === e.id ? "var(--primary)" : "var(--border-2)"}`, color: type === e.id ? "var(--tint-text)" : "var(--text-2)", fontWeight: 600, fontSize: 13.5, textAlign: "left" }}>
                <Icon name={e.icon} size={20} />{e.label}
              </button>
            ))}
          </div>
        </div>
        <Textarea label="Describe what's happening" rows={3} defaultValue="Kitchen pipe burst under the sink, water pooling on the floor. Shut-off valve isn't holding." />
        <TextInput label="Address" icon="map-pin" defaultValue="1820 W Roosevelt St, 85007" />
        <div>
          <div className="gk-field__label" style={{ marginBottom: 10 }}>Budget ceiling</div>
          <Slider min={50} max={1000} value={budget} onChange={setBudget} unit="" />
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>Pros see this upfront — concrete budgets get faster claims.</div>
        </div>
        <Card flat style={{ display: "flex", gap: 10, alignItems: "center", background: "var(--bg-2)", border: "1px solid var(--border)" }}>
          <Icon name="messages" size={22} style={{ color: "var(--text-2)" }} />
          <div style={{ fontSize: 12.5, color: "var(--text-2)" }}>Sent over <strong>SMS + WhatsApp</strong> to proven pros in your ZIP node.</div>
        </Card>
      </Body>
    </Screen>
  );
}

/* 2.4 — Request a Quote / Chat with pro */
function S2_4_QuoteChat({ go, toast, tabBar }) {
  const [draft, setDraft] = useC("");
  const feedRef = useCRef(null);
  const [msgs, setMsgs] = useC([
    { me: true, t: "Hi Marcus — pipe burst under the kitchen sink. Can you come today?", time: "1:01 PM" },
    { me: false, t: "On it. I can be there within the hour. Quote below — covers valve, fittings and cleanup.", time: "1:03 PM" },
    { me: false, quote: true, time: "1:03 PM" },
  ]);
  const send = () => { if (!draft.trim()) return; setMsgs([...msgs, { me: true, t: draft, time: "1:05 PM" }]); setDraft(""); };
  useCEffect(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [msgs]);
  return (
    <Screen scrollRef={feedRef}
      appBar={<AppBar onBack={() => go("s2_1")} left={<Avatar name="Marcus Bell" size={38} />} title="Marcus Bell" subtitle="Plumbing · 1.4 mi · ⚡ responds in 4h"
        right={<IconBtn icon="phone" onClick={() => toast("Calling Marcus…")} />} />}
      footer={<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <IconBtn icon="paperclip" />
        <input className="gk-input" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message…" style={{ flex: 1 }} />
        <button className="gk-btn gk-btn--filled gk-btn--auto" style={{ width: 46, height: 46, padding: 0, borderRadius: 12 }} onClick={send}><Icon name="send" /></button>
      </div>}>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>TODAY</div>
        {msgs.map((m, i) => m.quote ? (
          <Card key={i} style={{ alignSelf: "flex-start", maxWidth: "88%", padding: 0, overflow: "hidden", border: "1px solid var(--primary)" }}>
            <div style={{ padding: "10px 14px", background: "var(--tint)", display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="file-dollar" size={18} style={{ color: "var(--primary)" }} /><span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--tint-text)" }}>Quote · Kitchen valve repair</span>
            </div>
            <div style={{ padding: 14 }}>
              {[["Emergency valve repair", "$120"], ["Fittings & solder", "$28"], ["Same-day call-out", "$0"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "5px 0", color: "var(--text-2)" }}><span>{k}</span><span className="mono">{v}</span></div>
              ))}
              <Divider style={{ margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16 }}><span>Total</span><span className="mono">$148</span></div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Btn variant="default" size="sm" auto style={{ flex: 1 }}>Counter</Btn>
                <Btn size="sm" leftIcon="check" auto style={{ flex: 2 }} onClick={() => toast("Quote accepted — Marcus is on the way.")}>Accept $148</Btn>
              </div>
            </div>
          </Card>
        ) : (
          <div key={i} style={{ alignSelf: m.me ? "flex-end" : "flex-start", maxWidth: "82%" }}>
            <div style={{ padding: "10px 14px", borderRadius: 16, borderBottomRightRadius: m.me ? 4 : 16, borderBottomLeftRadius: m.me ? 16 : 4, background: m.me ? "var(--primary)" : "var(--surface)", color: m.me ? "#fff" : "var(--text)", border: m.me ? "none" : "1px solid var(--border)", fontSize: 14.5, lineHeight: 1.5 }}>{m.t}</div>
            <div style={{ fontSize: 10.5, color: "var(--text-3)", textAlign: m.me ? "right" : "left", marginTop: 3, padding: "0 4px" }}>{m.time}</div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

/* 2.5 — Leave a Recommendation (magic-link review) */
function S2_5_Review({ go, toast }) {
  const [stars, setStars] = useC(5);
  const [photos, setPhotos] = useC([true, false]);
  const [text, setText] = useC("Marcus found the slab leak two other plumbers missed. Clean copper work and the invoice came same day.");
  return (
    <Screen appBar={<AppBar title="Recommend Marcus" subtitle="Secure link · no account needed" onBack={() => go("s2_2")} />}
      footer={<Btn leftIcon="rosette-discount-check" onClick={() => { toast("Recommendation submitted — thank you!"); go("s2_1"); }}>Publish recommendation</Btn>}>
      <Body>
        <Card style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name="Marcus Bell" size={44} />
          <div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>Marcus Bell</div><div style={{ fontSize: 12.5, color: "var(--text-3)" }}>Copper riser re-pipe · $1,840</div></div>
          <Badge tone="green" icon="check">Job done</Badge>
        </Card>
        <div style={{ textAlign: "center" }}>
          <div className="gk-field__label" style={{ marginBottom: 12 }}>How was the work?</div>
          <div style={{ display: "flex", justifyContent: "center" }}><Stars value={stars} onChange={setStars} size={38} /></div>
        </div>
        <Textarea label="Tell other neighbors what happened" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
        <div>
          <div className="gk-field__label" style={{ marginBottom: 8 }}>Add your own before/after <span style={{ color: "var(--text-3)", fontWeight: 500 }}>(optional)</span></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Photo h={92} filled={photos[0]} tone="before" label={photos[0] ? "your before" : "Add before"} dashed={!photos[0]} onClick={() => setPhotos([true, photos[1]])} />
            <Photo h={92} filled={photos[1]} tone="after" accent={!photos[1]} label={photos[1] ? "your after" : "Add after"} dashed={!photos[1]} onClick={() => setPhotos([photos[0], true])} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "var(--text-3)", padding: "0 2px" }}>
          <Icon name="lock" size={15} /> Verified through your secure GigKraft review link.
        </div>
      </Body>
    </Screen>
  );
}

/* 2.6 — Your account (homeowner) */
function S2_6_Account({ tabBar, go, toast }) {
  const [sms, setSms] = useC(true);
  const [whatsapp, setWhatsapp] = useC(true);
  const [digest, setDigest] = useC(false);

  const saved = [
    { pro: "Marcus Bell", trade: "Plumbing", dist: "1.4 mi", recs: 42, proof: PROOFS[0] },
    { pro: "Leo Park", trade: "Electrical", dist: "3.4 mi", recs: 27, proof: PROOFS[2] },
  ];
  const past = [
    { pro: "Marcus Bell", title: "Copper riser re-pipe", invoice: "$1,840", when: "Apr 2026", recommended: true },
    { pro: "Tasha Quinn", title: "Ceiling water-stain patch", invoice: "$420", when: "Feb 2026", recommended: false },
  ];
  const settings = [
    { icon: "map-pin", label: "Saved addresses", meta: "2 properties" },
    { icon: "credit-card", label: "Payment methods", meta: "Visa ··4291" },
    { icon: "shield-check", label: "Help & safety", meta: "" },
  ];

  return (
    <Screen
      appBar={<AppBar title="You" subtitle="Homeowner · node SW-04"
        right={<IconBtn icon="settings" onClick={() => toast("Account settings")} />} />}
      tabBar={tabBar}>
      <Body gap={16}>
        {/* profile */}
        <Card style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Avatar name="Jordan Avery" size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-.3px" }}>Jordan Avery</div>
            <div style={{ fontSize: 12.5, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <Icon name="map-pin" size={13} />1820 W Roosevelt St · 85007
            </div>
          </div>
          <Btn variant="default" size="sm" auto onClick={() => toast("Edit profile")}>Edit</Btn>
        </Card>

        {/* stats */}
        <Card flat style={{ display: "flex", alignItems: "center", justifyContent: "space-around", background: "var(--bg-2)", border: "1px solid var(--border)" }}>
          {[["4", "Jobs hired"], ["6", "Saved pros"], ["3", "Recs given"]].map(([v, k], i) => (
            <React.Fragment key={k}>
              {i > 0 && <Divider style={{ width: 1, height: 34 }} />}
              <div style={{ textAlign: "center", padding: "2px 4px" }}>
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.5px" }}>{v}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, marginTop: 2 }}>{k}</div>
              </div>
            </React.Fragment>
          ))}
        </Card>

        {/* saved pros */}
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
            <Eyebrow>Saved pros</Eyebrow>
            <button onClick={() => go("s2_1")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 700, color: "var(--primary)" }}>Discover more</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {saved.map((s) => (
              <Card key={s.pro} press onClick={() => go("s2_2", s.proof)} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <Avatar name={s.pro} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{s.pro}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 8, marginTop: 1, whiteSpace: "nowrap" }}>
                    <span>{s.trade}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}><Icon name="map-pin" size={12} />{s.dist}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}><Icon name="rosette-discount-check" size={12} />{s.recs}</span>
                  </div>
                </div>
                <IconBtn icon="message" onClick={(e) => { e.stopPropagation(); go("s2_4"); }} />
              </Card>
            ))}
          </div>
        </div>

        {/* past jobs */}
        <div>
          <Eyebrow style={{ marginBottom: 8 }}>Past jobs</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {past.map((j) => (
              <Card key={j.title} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Photo h={48} filled tone="after" label="" icon="check" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j.title}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 1 }}>{j.pro} · {j.when}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                  <span className="mono" style={{ fontWeight: 800, fontSize: 13.5, color: "var(--green-fg)" }}>{j.invoice}</span>
                  {j.recommended
                    ? <Badge tone="green" icon="check">Recommended</Badge>
                    : <button onClick={() => go("s2_5")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 3 }}><Icon name="star" size={13} />Recommend</button>}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* notifications */}
        <div>
          <Eyebrow style={{ marginBottom: 8 }}>Dispatch alerts</Eyebrow>
          <Card style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <SwitchRow label="SMS alerts" desc="Pro claims & quote updates by text" on={sms} onChange={setSms} />
            <Divider />
            <SwitchRow label="WhatsApp dispatch" desc="Emergency broadcasts to nearby pros" on={whatsapp} onChange={setWhatsapp} />
            <Divider />
            <SwitchRow label="Weekly node digest" desc="New verified Krafts in node SW-04" on={digest} onChange={setDigest} />
          </Card>
        </div>

        {/* settings list */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {settings.map((s, i) => (
            <button key={s.label} onClick={() => toast(s.label)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", background: "none", border: "none", borderTop: i > 0 ? "1px solid var(--border)" : "none", cursor: "pointer", textAlign: "left" }}>
              <Icon name={s.icon} size={20} style={{ color: "var(--text-2)" }} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{s.label}</span>
              {s.meta && <span style={{ fontSize: 12.5, color: "var(--text-3)" }}>{s.meta}</span>}
              <Icon name="chevron-right" size={18} style={{ color: "var(--text-3)" }} />
            </button>
          ))}
        </Card>

        <Btn variant="default" leftIcon="logout" onClick={() => toast("Signed out")} style={{ color: "var(--red-fg)" }}>Sign out</Btn>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-3)", paddingBottom: 4 }}>GigKraft · node southwest-us-04 · v1.0</div>
      </Body>
    </Screen>
  );
}

Object.assign(window, { S2_1_Discover, S2_2_ProofDetail, S2_3_Emergency, S2_4_QuoteChat, S2_5_Review, S2_6_Account });
