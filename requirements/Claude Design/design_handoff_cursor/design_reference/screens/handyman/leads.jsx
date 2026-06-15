/* global React, AppBar, Screen, Body, Card, Btn, IconBtn, Icon, Eyebrow, Divider, Photo, Avatar, Badge, Segmented */
// GigKraft Handyman — Leads & Communication screens 1.9–1.10.
const { useState: useStateL, useRef: useRefL, useEffect: useEffectL } = React;

const LEADS = {
  active: [
    { id: "jenkins", name: "Tom Jenkins", job: "Kitchen valve leak", frag: "Water's isolated at the street valve but the floor is getting soggy — can you fix today?", when: "12m", unread: 2, left: "3h 48m", urgent: false },
    { id: "shah", name: "Priya Shah", job: "Water heater swap", frag: "Can you quote a 50‑gal water heater replacement for next week?", when: "1h", unread: 1, left: "2h 10m", urgent: false },
    { id: "castellano", name: "R. Castellano", job: "Garbage disposal", frag: "Disposal just hums and won't spin. Smells a bit electrical.", when: "3h", unread: 0, left: "38m", urgent: true },
  ],
  progress: [
    { id: "whitfield", name: "Dana Whitfield", job: "Water heater install", frag: "Great — see you at 2pm. I'll leave the side gate open.", when: "Today", unread: 0, tag: "Scheduled" },
    { id: "okafor", name: "M. Okafor", job: "Slab leak repair", frag: "Invoice received, thank you! Booking the drywall patch.", when: "Today", unread: 0, tag: "Quoted" },
  ],
  archived: [
    { id: "ortega", name: "Carl & Mei Ortega", job: "Re‑pipe", frag: "Job closed · $1,840 · 5★ recommendation", when: "May 28", unread: 0, tag: "Won" },
    { id: "tran", name: "L. Tran", job: "Faucet replace", frag: "Job closed · $180", when: "May 24", unread: 0, tag: "Won" },
  ],
};

/* 1.9 — Leads Dashboard */
function S1_9_Leads({ go, tabBar }) {
  const [tab, setTab] = useStateL("active");
  const list = LEADS[tab];
  return (
    <Screen
      appBar={<AppBar title="Leads" subtitle="Node SW‑04 · 4‑hour response promise"
        right={<div style={{ display: "flex" }}><IconBtn icon="search" /><IconBtn icon="bell" /></div>} />}
      tabBar={tabBar}>
      <div style={{ padding: "12px 16px 8px", position: "sticky", top: 0, background: "var(--bg)", zIndex: 2 }}>
        <Segmented value={tab} onChange={setTab} options={[
          { value: "active", label: "Active" }, { value: "progress", label: "In‑progress" }, { value: "archived", label: "Archived" },
        ]} />
      </div>
      <Body style={{ paddingTop: 4 }} gap={10}>
        {list.map((l) => (
          <Card key={l.id} press onClick={() => go("s1_10")} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <Avatar name={l.name} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{l.name}</span>
                <span style={{ fontSize: 11, color: "var(--text-3)", marginLeft: "auto" }}>{l.when}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600, margin: "1px 0 4px" }}>{l.job}</div>
              <div style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{l.frag}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                {tab === "active" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999,
                    background: l.urgent ? "var(--red-bg)" : "var(--green-bg)", color: l.urgent ? "var(--red-fg)" : "var(--green-fg)" }}>
                    <Icon name="clock" size={13} />{l.left} left
                  </span>
                ) : <Badge tone={l.tag === "Won" ? "green" : "blue"}>{l.tag}</Badge>}
                {l.unread > 0 && <span style={{ marginLeft: "auto", minWidth: 20, height: 20, borderRadius: 999, background: "var(--primary)", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 6px" }}>{l.unread}</span>}
              </div>
            </div>
          </Card>
        ))}
        {tab === "archived" && <div style={{ textAlign: "center", color: "var(--text-3)", fontSize: 13, padding: 8 }}>2 jobs won · $2,020 lifetime in this view</div>}
      </Body>
    </Screen>
  );
}

/* 1.10 — Direct Chat Interface */
const QUICK = [
  { label: "Send quote", icon: "file-dollar" },
  { label: "Send invoice", icon: "receipt" },
  { label: "Mark complete", icon: "circle-check" },
  { label: "Request review", icon: "star" },
];
function S1_10_Chat({ go, toast }) {
  const [draft, setDraft] = useStateL("Heading over now — torch and fittings are in the rig.");
  const feedRef = useRefL(null);
  const [msgs, setMsgs] = useStateL([
    { me: false, t: "Water's isolated at the street valve but the kitchen floor is getting soggy. Can you fix today?", time: "1:02 PM" },
    { me: true, t: "Yes — I can be there within the hour. Holding to the $120 valve‑repair baseline.", time: "1:04 PM" },
    { me: false, t: "Perfect. Here's the access photo.", time: "1:05 PM", photo: true },
  ]);
  const send = () => { if (!draft.trim()) return; setMsgs([...msgs, { me: true, t: draft, time: "1:06 PM" }]); setDraft(""); };
  useEffectL(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [msgs]);

  return (
    <Screen scrollRef={feedRef}
      appBar={<AppBar onBack={() => go("s1_9")}
        left={<Avatar name="Tom Jenkins" size={38} />}
        title="Tom Jenkins" subtitle="Kitchen valve leak · 1.4 mi"
        right={<div style={{ display: "flex" }}><IconBtn icon="phone" onClick={() => toast("Calling…")} /><IconBtn icon="dots-vertical" /></div>} />}
      footer={
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", margin: "0 -16px", padding: "0 16px" }} className="gk-scroll">
            {QUICK.map((q) => (
              <button key={q.label} onClick={() => toast(q.label + " sent.")} style={{ flex: "0 0 auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, padding: "7px 12px", borderRadius: 999, border: "1px solid var(--border-2)", background: "var(--surface)", color: "var(--text-2)", cursor: "pointer" }}>
                <Icon name={q.icon} size={15} />{q.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconBtn icon="paperclip" onClick={() => toast("Attach a photo, quote or invoice")} />
            <input className="gk-input" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Message…" style={{ flex: 1 }} />
            <button className="gk-btn gk-btn--filled gk-btn--auto" style={{ width: 46, height: 46, padding: 0, borderRadius: 12 }} onClick={send}><Icon name="send" /></button>
          </div>
        </div>
      }>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--text-3)", fontWeight: 600, margin: "2px 0 6px" }}>TODAY</div>
        {msgs.map((m, i) => (
          <div key={i} style={{ alignSelf: m.me ? "flex-end" : "flex-start", maxWidth: "82%" }}>
            <div style={{
              padding: m.photo ? 6 : "10px 14px", borderRadius: 16,
              borderBottomRightRadius: m.me ? 4 : 16, borderBottomLeftRadius: m.me ? 16 : 4,
              background: m.me ? "var(--primary)" : "var(--surface)", color: m.me ? "#fff" : "var(--text)",
              border: m.me ? "none" : "1px solid var(--border)", fontSize: 14.5, lineHeight: 1.5,
            }}>
              {m.photo ? <Photo h={120} filled label="under‑sink access" /> : m.t}
            </div>
            <div style={{ fontSize: 10.5, color: "var(--text-3)", textAlign: m.me ? "right" : "left", marginTop: 3, padding: "0 4px" }}>{m.time}</div>
          </div>
        ))}
      </div>
    </Screen>
  );
}

Object.assign(window, { S1_9_Leads, S1_10_Chat });
