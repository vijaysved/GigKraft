/* global React, AppBar, Screen, Body, Card, Btn, IconBtn, TextInput, Textarea, Select, Segmented, Icon, Eyebrow, Divider, Photo, Avatar, Badge, Stars */
// GigKraft Handyman — Portfolio & Recommendations screens 1.6–1.8.
const { useState: useStateP } = React;

/* 1.6 — Project Creator ("Add Kraft") */
function S1_6_ProjectCreator({ toast, tabBar }) {
  const [ba, setBa] = useStateP(true);
  const [pre, setPre] = useStateP([false, false]);
  const [post, setPost] = useStateP([true, false]);
  const fill = (arr, set, i) => set(arr.map((v, j) => (j === i ? true : v)));
  const hasAfter = post.some(Boolean);
  return (
    <Screen
      appBar={<AppBar title="Add a Kraft" subtitle="Publish a verified before/after" right={<Badge tone="blue" icon="bolt">Proof</Badge>} />}
      tabBar={tabBar}
      footer={
        <Btn disabled={!hasAfter} leftIcon="cloud-upload"
          onClick={() => toast(hasAfter ? "Kraft published to node directory." : "")}>
          {hasAfter ? "Publish Kraft" : "Add an After photo to publish"}
        </Btn>
      }>
      <Body>
        <TextInput label="Project title" required defaultValue="Copper riser re‑pipe" maxLength={100} />
        <Textarea label="Description" rows={3} defaultValue="Replaced corroded galvanized riser with type‑L copper, pressure‑tested the line and patched drywall." maxLength={1000} />
        <Select label="Final job cost" defaultValue="2">
          <option value="0">Under $250</option>
          <option value="1">$250 – $500</option>
          <option value="2">$500 – $1,000</option>
          <option value="3">$1,000+</option>
        </Select>

        <Card style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>Before / after project?</div>
            <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 2 }}>Shows the transformation, not just the result.</div>
          </div>
          <button className={`gk-switch${ba ? " gk-switch--on" : ""}`} onClick={() => setBa(!ba)}><span className="gk-switch__dot" /></button>
        </Card>

        {ba && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span className="gk-field__label">Before photos</span>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>Optional · max 5</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {pre.map((f, i) => <Photo key={i} h={96} filled={f} tone="before" label={f ? "before · riser" : "Add before"} dashed={!f} onClick={() => fill(pre, setPre, i)} />)}
            </div>
          </div>
        )}

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
            <span className="gk-field__label">After photos<span className="gk-field__req">*</span></span>
            <Badge tone={hasAfter ? "green" : "yellow"} icon={hasAfter ? "check" : "alert-triangle"}>{hasAfter ? "Proof set" : "Required"}</Badge>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {post.map((f, i) => <Photo key={i} h={96} filled={f} tone="after" accent={!f} label={f ? "after · copper" : "Add after"} dashed={!f} onClick={() => fill(post, setPost, i)} />)}
          </div>
          <div className="gk-field__hint" style={{ marginTop: 8 }}>A real After image is mandatory — it's what makes the Kraft verifiable.</div>
        </div>
      </Body>
    </Screen>
  );
}

/* 1.7 — Recommendation Request Engine */
const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp", icon: "brand-whatsapp", c: "var(--whatsapp)" },
  { id: "sms", label: "SMS", icon: "message-2", c: "var(--blue-6)" },
  { id: "email", label: "Email", icon: "mail", c: "var(--grape-6)" },
];
const RECENT_REQ = [
  { name: "Priya Shah", via: "WhatsApp", when: "2h ago", status: "Opened" },
  { name: "Dana Whitfield", via: "SMS", when: "Yesterday", status: "Sent" },
  { name: "Carl & Mei Ortega", via: "Email", when: "3 days ago", status: "Reviewed" },
];
function S1_7_RecRequest({ go, toast }) {
  const [ch, setCh] = useStateP("whatsapp");
  return (
    <Screen
      appBar={<AppBar title="Request a recommendation" onBack={() => go("account")} />}
      footer={<Btn leftIcon="send" onClick={() => toast("Magic link sent via " + CHANNELS.find((c) => c.id === ch).label + ".")}>Send review link</Btn>}>
      <Body>
        <Card style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <TextInput label="Client name" icon="user" defaultValue="Priya Shah" />
          <TextInput label="Phone or email" icon="at" defaultValue="priya.shah@gmail.com" />
        </Card>

        <div>
          <div className="gk-field__label" style={{ marginBottom: 8 }}>Send via</div>
          <div style={{ display: "flex", gap: 8 }}>
            {CHANNELS.map((c) => (
              <button key={c.id} onClick={() => setCh(c.id)} style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 6px",
                borderRadius: "var(--r-md)", cursor: "pointer", background: ch === c.id ? "var(--tint)" : "var(--surface)",
                border: `1px solid ${ch === c.id ? "var(--primary)" : "var(--border-2)"}`,
              }}>
                <Icon name={c.icon} size={24} style={{ color: c.c }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: ch === c.id ? "var(--tint-text)" : "var(--text-2)" }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="gk-field__label" style={{ marginBottom: 8 }}>Secure magic link</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: "var(--r-md)", background: "var(--bg-2)", border: "1px solid var(--border)" }}>
            <Icon name="link" size={18} style={{ color: "var(--text-3)" }} />
            <span className="mono" style={{ fontSize: 12, color: "var(--text-2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>gigkraft.com/review?t=8fK2…aQ9</span>
            <IconBtn icon="copy" onClick={() => toast("Link copied.")} />
          </div>
          <div className="gk-field__hint" style={{ marginTop: 8 }}>Passwordless — your client rates the job without making an account.</div>
        </div>

        <div>
          <Eyebrow style={{ marginBottom: 8 }}>Recent requests</Eyebrow>
          <Card flat style={{ padding: 4 }}>
            {RECENT_REQ.map((r, i) => (
              <div key={r.name}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 10px" }}>
                  <Avatar name={r.name} size={36} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-3)" }}>{r.via} · {r.when}</div>
                  </div>
                  <Badge tone={r.status === "Reviewed" ? "green" : r.status === "Opened" ? "blue" : undefined}>{r.status}</Badge>
                </div>
                {i < RECENT_REQ.length - 1 && <Divider />}
              </div>
            ))}
          </Card>
        </div>
      </Body>
    </Screen>
  );
}

/* 1.8 — Recommendation Moderation Queue */
const PENDING = [
  { name: "Priya Shah", rel: "Repeat client", when: "2h ago", stars: 5, photos: 2,
    text: "Marcus found the slab leak two other plumbers missed. Clean copper work and he sent the invoice the same day." },
  { name: "Dana Whitfield", rel: "Neighbor", when: "Yesterday", stars: 4, photos: 1,
    text: "Fast and tidy. Water heater swap done in an afternoon, no mess left behind." },
];
function S1_8_Moderation({ go, toast }) {
  const [done, setDone] = useStateP([]);
  const approve = (n) => { setDone([...done, n]); toast("Published to your public profile."); };
  return (
    <Screen appBar={<AppBar title="Review queue" subtitle={`${PENDING.length - done.length} pending`} onBack={() => go("account")} right={<Badge tone="yellow">{PENDING.length - done.length} new</Badge>} />}>
      <Body>
        {PENDING.map((r) => {
          const isDone = done.includes(r.name);
          return (
            <Card key={r.name} style={{ display: "flex", flexDirection: "column", gap: 12, opacity: isDone ? .55 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar name={r.name} size={42} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)" }}>{r.rel} · {r.when}</div>
                </div>
                <Stars value={r.stars} size={18} />
              </div>
              <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.55 }}>"{r.text}"</div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${r.photos}, 1fr)`, gap: 8 }}>
                {Array.from({ length: r.photos }).map((_, i) => <Photo key={i} h={80} filled tone="after" label="job photo" />)}
              </div>
              <Divider />
              {isDone ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--green-fg)", fontWeight: 600, fontSize: 14, justifyContent: "center" }}>
                  <Icon name="circle-check-filled" size={18} /> Published to profile
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="default" size="sm" leftIcon="message" auto style={{ flex: 1 }} onClick={() => go("s1_10")}>Reply</Btn>
                  <Btn size="sm" leftIcon="check" auto style={{ flex: 2 }} onClick={() => approve(r.name)}>Approve &amp; publish</Btn>
                </div>
              )}
            </Card>
          );
        })}
        <div style={{ textAlign: "center", color: "var(--text-3)", fontSize: 13, padding: "8px 0" }}>
          Approved recommendations show on your public profile.
        </div>
      </Body>
    </Screen>
  );
}

Object.assign(window, { S1_6_ProjectCreator, S1_7_RecRequest, S1_8_Moderation });
