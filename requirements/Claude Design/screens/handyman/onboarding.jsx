/* global React, AppBar, Screen, Steps, Body, Card, Btn, TextInput, Textarea, Select, Segmented, Switch, SwitchRow, Slider, Chip, Icon, Eyebrow, Divider, Photo, Avatar, Badge */
// GigKraft Handyman — Onboarding screens 1.1–1.5.
const { useState: useStateOnb } = React;

function OnbHead({ title, step, onBack }) {
  return (
    <div style={{ flex: "0 0 auto", background: "var(--surface)", borderBottom: "1px solid var(--border)", paddingBottom: 10 }}>
      <AppBar title={title} subtitle={`Step ${step + 1} of 5 · Pro onboarding`} onBack={onBack}
        right={<button className="gk-btn gk-btn--subtle gk-btn--xs" style={{ color: "var(--text-3)" }}>Skip</button>} />
      <div style={{ paddingTop: 10 }}><Steps total={5} current={step} /></div>
    </div>
  );
}

/* 1.1 — Authentication (Signup / Login) */
function S1_1_Auth({ go }) {
  return (
    <Screen appBar={<OnbHead title="Create your account" step={0} />}
      footer={<Btn rightIcon="arrow-right" onClick={() => go("s1_2")}>Continue</Btn>}>
      <Body>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-.5px" }}>Join the proof network.</div>
          <div style={{ color: "var(--text-3)", marginTop: 4, fontSize: "var(--fz-md)" }}>Publish before/after Krafts and claim local leads in node SW‑04.</div>
        </div>
        <Btn variant="default" leftIcon="brand-google">Continue with Google</Btn>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-3)" }}>
          <Divider style={{ flex: 1 }} /><span style={{ fontSize: 12, fontWeight: 600 }}>or</span><Divider style={{ flex: 1 }} />
        </div>
        <Card style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <TextInput label="Email" required icon="mail" type="email" defaultValue="marcus.bell@gmail.com" />
          <TextInput label="Mobile number" required icon="phone" defaultValue="+1 (602) 555‑0148"
            hint="We send a 4‑digit SMS token to verify your number." />
        </Card>
        <div style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center", lineHeight: 1.5 }}>
          By continuing you agree to GigKraft's Terms &amp; Privacy Policy.
        </div>
      </Body>
    </Screen>
  );
}

/* 1.2 — Base Service Area */
function S1_2_ServiceArea({ go }) {
  const [mode, setMode] = useStateOnb("explicit");
  const [zips, setZips] = useStateOnb(["85004", "85016", "85254"]);
  const [miles, setMiles] = useStateOnb(15);
  return (
    <Screen appBar={<OnbHead title="Service area" step={1} onBack={() => go("s1_1")} />}
      footer={<Btn rightIcon="arrow-right" onClick={() => go("s1_3")}>Continue</Btn>}>
      <Body>
        <TextInput label="Home ZIP code" required icon="map-pin" defaultValue="85004" inputMode="numeric"
          hint="Your base — used to rank you by proximity in local search." />
        <div>
          <div className="gk-field__label" style={{ marginBottom: 8 }}>How do you cover your area?</div>
          <Segmented value={mode} onChange={setMode} options={[{ value: "explicit", label: "Specific ZIPs" }, { value: "radial", label: "Center + radius" }]} />
        </div>

        {mode === "explicit" ? (
          <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="gk-field__label">Served ZIP codes</span>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>{zips.length} of 3</span>
            </div>
            {zips.map((z, i) => (
              <div key={i} className="gk-input-wrap">
                <Icon name="map-pin" className="gk-input-wrap__icon" />
                <input className="gk-input mono" defaultValue={z} inputMode="numeric" />
                <button className="gk-iconbtn" style={{ position: "absolute", right: 4 }} onClick={() => setZips(zips.filter((_, j) => j !== i))}><Icon name="x" size={18} /></button>
              </div>
            ))}
            {zips.length < 3 && <Btn variant="light" size="sm" leftIcon="plus" onClick={() => setZips([...zips, ""])}>Add ZIP code</Btn>}
          </Card>
        ) : (
          <Card style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <TextInput label="Center ZIP code" icon="map-pin" defaultValue="85004" inputMode="numeric" />
            <div>
              <div className="gk-field__label" style={{ marginBottom: 10 }}>Coverage radius</div>
              <Slider min={1} max={100} value={miles} onChange={setMiles} unit=" mi" />
            </div>
            <div style={{ height: 150, borderRadius: "var(--r-md)", border: "1px solid var(--border-2)", position: "relative", overflow: "hidden", background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "26px 26px", opacity: .6 }} />
              <div style={{ width: 40 + miles * 1.0, height: 40 + miles * 1.0, maxWidth: 150, maxHeight: 130, borderRadius: "50%", background: "var(--tint)", border: "2px solid var(--primary)" }} />
              <Icon name="map-pin-filled" size={20} style={{ position: "absolute", color: "var(--primary)" }} />
            </div>
          </Card>
        )}
      </Body>
    </Screen>
  );
}

/* 1.3 — Visual Customization */
const WALLPAPERS = [
  { id: 0, c: "linear-gradient(135deg,#228be6,#1864ab)" },
  { id: 1, c: "linear-gradient(135deg,#0ca678,#087f5b)" },
  { id: 2, c: "linear-gradient(135deg,#343a40,#101113)" },
  { id: 3, c: "linear-gradient(135deg,#f76707,#d9480f)" },
  { id: 4, c: "linear-gradient(135deg,#7048e8,#5f3dc4)" },
];
function S1_3_Visual({ go }) {
  const [wp, setWp] = useStateOnb(0);
  return (
    <Screen appBar={<OnbHead title="Profile look" step={2} onBack={() => go("s1_2")} />}
      footer={<Btn rightIcon="arrow-right" onClick={() => go("s1_4")}>Continue</Btn>}>
      <Body>
        {/* live preview */}
        <Card flat style={{ padding: 0, overflow: "hidden", border: "1px solid var(--border)" }}>
          <div style={{ height: 96, background: WALLPAPERS[wp].c }} />
          <div style={{ padding: "0 16px 16px", marginTop: -36 }}>
            <Avatar name="Marcus Bell" size={72} style={{ border: "4px solid var(--surface)" }} />
            <div style={{ fontWeight: 800, fontSize: 18, marginTop: 8 }}>Marcus Bell</div>
            <div style={{ color: "var(--text-3)", fontSize: 13 }}>Plumbing Pro · SW‑04</div>
          </div>
        </Card>

        <div>
          <div className="gk-field__label" style={{ marginBottom: 8 }}>Profile photo</div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="default" size="sm" leftIcon="brand-google" auto style={{ flex: 1 }}>Use Google photo</Btn>
            <Btn variant="default" size="sm" leftIcon="upload" auto style={{ flex: 1 }}>Upload</Btn>
          </div>
        </div>

        <div>
          <div className="gk-field__label" style={{ marginBottom: 8 }}>Header wallpaper</div>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {WALLPAPERS.map((w) => (
              <button key={w.id} onClick={() => setWp(w.id)} style={{ width: 52, height: 52, borderRadius: 12, background: w.c, border: wp === w.id ? "3px solid var(--primary)" : "3px solid transparent", boxShadow: "var(--shadow-xs)", cursor: "pointer", outline: "1px solid var(--border)" }} />
            ))}
            <button style={{ width: 52, height: 52, borderRadius: 12, border: "1.5px dashed var(--border-2)", background: "transparent", color: "var(--text-3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="plus" /></button>
          </div>
        </div>
      </Body>
    </Screen>
  );
}

/* 1.4 — Professional Credentials */
function S1_4_Credentials({ go }) {
  const [emp, setEmp] = useStateOnb("full");
  const [lic, setLic] = useStateOnb(true);
  const [ins, setIns] = useStateOnb(true);
  return (
    <Screen appBar={<OnbHead title="Credentials" step={3} onBack={() => go("s1_3")} />}
      footer={<Btn rightIcon="arrow-right" onClick={() => go("s1_5")}>Continue</Btn>}>
      <Body>
        <div>
          <div className="gk-field__label" style={{ marginBottom: 8 }}>Availability</div>
          <Segmented value={emp} onChange={setEmp} options={[{ value: "full", label: "Full‑time" }, { value: "part", label: "Part‑time" }]} />
        </div>

        <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SwitchRow label="Licensed" desc="Show a verified license badge on your profile" on={lic} onChange={setLic} />
          {lic && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingLeft: 2 }}>
              <TextInput label="License number" defaultValue="AZ‑ROC‑284517" />
              <Photo label="Upload license PDF" h={64} icon="file-text" dashed onClick={() => {}} />
            </div>
          )}
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <SwitchRow label="Insured" desc="Upload a Certificate of Insurance (COI)" on={ins} onChange={setIns} />
          {ins && <Photo label="Upload COI PDF" h={64} icon="file-certificate" dashed onClick={() => {}} />}
        </Card>

        <Select label="Guaranteed response time" defaultValue="4"
          hint="Leads track you against this promise. Default is 4 hours.">
          <option value="1">Within 1 hour</option>
          <option value="2">Within 2 hours</option>
          <option value="4">Within 4 hours</option>
          <option value="8">Within 8 hours</option>
          <option value="12">Within 12 hours</option>
          <option value="24">Within 24 hours</option>
        </Select>
      </Body>
    </Screen>
  );
}

/* 1.5 — Core Categorization */
const SUGGESTED = ["Faucet repair", "Clogged drains", "Drywall patch", "Water heaters", "Garbage disposal", "Re‑pipe", "Leak detection"];
function S1_5_Categorization({ go, toast }) {
  const [tags, setTags] = useStateOnb(["Leak detection", "Re‑pipe", "Water heaters"]);
  const [bio, setBio] = useStateOnb("15 yrs on the tools across Phoenix. Licensed + insured. I send a real invoice and a clean before/after on every job — no vague quotes.");
  const toggle = (t) => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]);
  return (
    <Screen appBar={<OnbHead title="Your trade" step={4} onBack={() => go("s1_4")} />}
      footer={<Btn rightIcon="check" onClick={() => { toast("Profile published to node SW‑04."); go("s1_9"); }}>Finish & go live</Btn>}>
      <Body>
        <Select label="Primary trade" required defaultValue="plumbing">
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
          <option value="carpentry">Carpentry</option>
          <option value="hvac">HVAC</option>
          <option value="drywall">Drywall &amp; Paint</option>
          <option value="handyman">General Handyman</option>
        </Select>

        <div>
          <div className="gk-field__label" style={{ marginBottom: 4 }}>Skill tags</div>
          <div className="gk-field__hint" style={{ marginBottom: 10 }}>Customers search these. Tap to add or remove.</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[...new Set([...tags, ...SUGGESTED])].map((t) => (
              <Chip key={t} on={tags.includes(t)} onClick={() => toggle(t)}>{t}</Chip>
            ))}
          </div>
        </div>

        <div>
          <Textarea label="Short bio" rows={4} maxLength={500} value={bio} onChange={(e) => setBio(e.target.value)} />
          <div style={{ textAlign: "right", fontSize: 11, color: "var(--text-3)", marginTop: 4 }} className="mono">{bio.length} / 500</div>
        </div>
      </Body>
    </Screen>
  );
}

Object.assign(window, { S1_1_Auth, S1_2_ServiceArea, S1_3_Visual, S1_4_Credentials, S1_5_Categorization });
