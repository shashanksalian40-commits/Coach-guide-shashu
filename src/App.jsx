import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, X, Dumbbell, UtensilsCrossed, CheckCircle2, Users, Flame, ChevronRight, Trash2, Search, LineChart as LineChartIcon, Link2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import storageClient from "./storageClient";

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);

const TABS = [
  { id: "clients", label: "Clients", icon: Users },
  { id: "checkins", label: "Check-ins", icon: CheckCircle2 },
  { id: "workouts", label: "Workout Library", icon: Dumbbell },
  { id: "recipes", label: "Recipe Library", icon: UtensilsCrossed },
];

function useStore(key, fallback, shared = false) {
  const [value, setValue] = useState(fallback);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await storageClient.get(key, shared);
        if (res && res.value) setValue(JSON.parse(res.value));
      } catch (e) {
        // key not found yet, keep fallback
      }
      setLoaded(true);
    })();
  }, [key, shared]);

  const update = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        storageClient.set(key, JSON.stringify(resolved), shared).catch(() => {});
        return resolved;
      });
    },
    [key, shared]
  );

  const refresh = useCallback(async () => {
    try {
      const res = await storageClient.get(key, shared);
      if (res && res.value) setValue(JSON.parse(res.value));
    } catch (e) {}
  }, [key, shared]);

  return [value, update, loaded, refresh];
}

const accent = "#FF5A1F";
const ink = "#15130F";

function Shell({ children }) {
  return (
    <div style={{ background: "#F6F3EC", minHeight: "100vh", color: ink, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap');
        .disp { font-family: 'Oswald', sans-serif; letter-spacing: 0.01em; }
        input, textarea, select { font-family: 'Inter', sans-serif; }
        button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid ${accent}; outline-offset: 2px; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #d8d2c4; border-radius: 3px; }
      `}</style>
      {children}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: "#fff", border: `1px solid #E4DECE`, borderRadius: 10, padding: 18, ...style }}>
      {children}
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px", color: "#9b9486" }}>
      <Icon size={28} style={{ marginBottom: 10, opacity: 0.6 }} />
      <div className="disp" style={{ fontSize: 16, color: ink, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, maxWidth: 320, margin: "0 auto" }}>{body}</div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6557", marginBottom: 10 }}>
      {label}
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          display: "block",
          width: "100%",
          marginTop: 5,
          padding: "9px 11px",
          border: "1px solid #DCD5C4",
          borderRadius: 7,
          fontSize: 14,
          color: ink,
          boxSizing: "border-box",
        }}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6557", marginBottom: 10 }}>
      {label}
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        style={{
          display: "block",
          width: "100%",
          marginTop: 5,
          padding: "9px 11px",
          border: "1px solid #DCD5C4",
          borderRadius: 7,
          fontSize: 14,
          color: ink,
          boxSizing: "border-box",
          resize: "vertical",
          fontFamily: "inherit",
        }}
      />
    </label>
  );
}

function PrimaryButton({ children, onClick, style, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: ink,
        color: "#F6F3EC",
        border: "none",
        borderRadius: 7,
        padding: "10px 16px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function IconBtn({ onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: "transparent",
        border: "none",
        color: "#9b9486",
        cursor: "pointer",
        padding: 4,
        display: "flex",
      }}
    >
      {children}
    </button>
  );
}

// ---------- CLIENTS ----------
// Photo → base64 helper
const fileToBase64 = (file) =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

function Avatar({ photo, name, size = 44 }) {
  const initials = name ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "?";
  return photo ? (
    <img
      src={photo}
      alt={name}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid #E4DECE" }}
    />
  ) : (
    <div
      style={{
        width: size, height: size, borderRadius: "50%", background: ink, color: "#F6F3EC",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.35, fontWeight: 700, flexShrink: 0, fontFamily: "Oswald, sans-serif",
      }}
    >
      {initials}
    </div>
  );
}

function ClientsTab({ clients, setClients, checkins }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", goal: "", plan: "", notes: "", photo: "" });
  const [selected, setSelected] = useState(null);
  const photoRef = React.useRef();

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setForm((f) => ({ ...f, photo: b64 }));
  };

  const addClient = () => {
    if (!form.name.trim()) return;
    setClients((prev) => [...prev, { id: uid(), ...form, createdAt: today() }]);
    setForm({ name: "", goal: "", plan: "", notes: "", photo: "" });
    setAdding(false);
  };

  const removeClient = (id) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    if (selected === id) setSelected(null);
  };

  const lastCheckin = (clientId) => {
    const list = checkins.filter((c) => c.clientId === clientId).sort((a, b) => (a.date < b.date ? 1 : -1));
    return list[0];
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="disp" style={{ fontSize: 20, margin: 0, textTransform: "uppercase" }}>Your Roster</h2>
        <PrimaryButton onClick={() => setAdding((v) => !v)}>
          <Plus size={15} /> Add client
        </PrimaryButton>
      </div>

      {adding && (
        <Card>
          {/* Photo upload */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <Avatar photo={form.photo} name={form.name || "?"} size={56} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b6557", marginBottom: 6 }}>Profile photo</div>
              <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
              <PrimaryButton onClick={() => photoRef.current.click()} style={{ background: "transparent", color: ink, border: "1px solid #DCD5C4", padding: "7px 12px", fontSize: 12 }}>
                {form.photo ? "Change photo" : "Upload photo"}
              </PrimaryButton>
            </div>
          </div>
          <TextField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Client name" />
          <TextField label="Primary goal" value={form.goal} onChange={(v) => setForm({ ...form, goal: v })} placeholder="e.g. Fat loss, 35lbs by Dec" />
          <TextField label="Program / plan" value={form.plan} onChange={(v) => setForm({ ...form, plan: v })} placeholder="e.g. 12-Week Transform — Online" />
          <TextArea label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Injuries, preferences, schedule constraints..." />
          <div style={{ display: "flex", gap: 8 }}>
            <PrimaryButton onClick={addClient}>Save client</PrimaryButton>
            <PrimaryButton onClick={() => setAdding(false)} style={{ background: "transparent", color: ink, border: "1px solid #DCD5C4" }}>
              Cancel
            </PrimaryButton>
          </div>
        </Card>
      )}

      {clients.length === 0 && !adding && (
        <Card>
          <EmptyState icon={Users} title="No clients yet" body="Add your first client to start tracking their goals, check-ins, and plan." />
        </Card>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {clients.map((c) => {
          const lc = lastCheckin(c.id);
          return (
            <Card key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar photo={c.photo} name={c.name} size={44} />
                <div>
                  <div className="disp" style={{ fontSize: 16, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: "#6b6557", marginTop: 2 }}>{c.goal || "No goal set"}</div>
                  <div style={{ fontSize: 12, color: "#9b9486", marginTop: 4 }}>
                    {c.plan && <span>{c.plan} · </span>}
                    Last check-in: {lc ? lc.date : "none yet"}
                  </div>
                </div>
              </div>
              <IconBtn onClick={() => removeClient(c.id)} title="Remove client">
                <Trash2 size={16} />
              </IconBtn>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ---------- CHECK-INS ----------
function ProgressChart({ clients, checkins }) {
  const [clientId, setClientId] = useState(clients[0]?.id || "");

  useEffect(() => {
    if (!clientId && clients[0]) setClientId(clients[0].id);
  }, [clients]);

  const data = useMemo(() => {
    return checkins
      .filter((c) => c.clientId === clientId)
      .map((c) => ({
        date: c.date,
        weight: c.weight ? parseFloat(c.weight) : null,
        adherence: c.adherence ? parseFloat(c.adherence) : null,
      }))
      .filter((d) => !Number.isNaN(d.weight) || !Number.isNaN(d.adherence))
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [checkins, clientId]);

  if (clients.length === 0) return null;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
        <h2 className="disp" style={{ fontSize: 16, margin: 0, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
          <LineChartIcon size={16} /> Progress
        </h2>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          style={{ padding: "7px 10px", border: "1px solid #DCD5C4", borderRadius: 7, fontSize: 13 }}
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {data.length < 2 ? (
        <div style={{ fontSize: 13, color: "#9b9486", padding: "20px 0", textAlign: "center" }}>
          Need at least 2 check-ins with weight or adherence data to plot a trend.
        </div>
      ) : (
        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="#EDE8DA" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9b9486" }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#9b9486" }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#9b9486" }} domain={[0, 100]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #DCD5C4" }} />
              <Line yAxisId="left" type="monotone" dataKey="weight" name="Weight" stroke={accent} strokeWidth={2} dot={{ r: 3 }} connectNulls />
              <Line yAxisId="right" type="monotone" dataKey="adherence" name="Adherence %" stroke={ink} strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

function CheckinsTab({ clients, checkins, setCheckins }) {
  const [form, setForm] = useState({
    clientId: clients[0]?.id || "",
    date: today(),
    weight: "",
    adherence: "",
    energy: "",
    notes: "",
    // body measurements
    chest: "", waist: "", hips: "", thighs: "", arms: "", shoulders: "", calves: "", bodyFat: "",
    // progress photo
    progressPhoto: "",
  });
  const progressPhotoRef = React.useRef();

  const handleProgressPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setForm((f) => ({ ...f, progressPhoto: b64 }));
  };

  useEffect(() => {
    if (!form.clientId && clients[0]) setForm((f) => ({ ...f, clientId: clients[0].id }));
  }, [clients]);

  const addCheckin = () => {
    if (!form.clientId) return;
    setCheckins((prev) => [{ id: uid(), ...form }, ...prev]);
    setForm((f) => ({
      ...f,
      weight: "", adherence: "", energy: "", notes: "",
      chest: "", waist: "", hips: "", thighs: "", arms: "", shoulders: "", calves: "", bodyFat: "",
      progressPhoto: "",
    }));
  };

  const removeCheckin = (id) => setCheckins((prev) => prev.filter((c) => c.id !== id));

  const clientName = (id) => clients.find((c) => c.id === id)?.name || "Unknown";

  if (clients.length === 0) {
    return (
      <Card>
        <EmptyState icon={CheckCircle2} title="Add a client first" body="Check-ins are logged per client. Add someone to your roster in the Clients tab." />
      </Card>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <ProgressChart clients={clients} checkins={checkins} />
      <Card>
        <h2 className="disp" style={{ fontSize: 18, margin: "0 0 14px", textTransform: "uppercase" }}>Log a check-in</h2>

        {/* Client + date */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6557" }}>
            Client
            <select
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              style={{ display: "block", width: "100%", marginTop: 5, padding: "9px 11px", border: "1px solid #DCD5C4", borderRadius: 7, fontSize: 14 }}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <TextField label="Date" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} />
        </div>

        {/* Vitals */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "#9b9486", letterSpacing: "0.08em", textTransform: "uppercase", margin: "12px 0 8px" }}>Vitals</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <TextField label="Weight (kg / lbs)" value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} placeholder="e.g. 78.2" />
          <TextField label="Body fat %" value={form.bodyFat} onChange={(v) => setForm({ ...form, bodyFat: v })} placeholder="e.g. 22" />
          <TextField label="Plan adherence %" value={form.adherence} onChange={(v) => setForm({ ...form, adherence: v })} placeholder="e.g. 90" />
          <TextField label="Energy / mood (1-10)" value={form.energy} onChange={(v) => setForm({ ...form, energy: v })} placeholder="e.g. 7" />
        </div>

        {/* Body measurements */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "#9b9486", letterSpacing: "0.08em", textTransform: "uppercase", margin: "12px 0 8px" }}>Body measurements (cm / in)</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <TextField label="Chest" value={form.chest} onChange={(v) => setForm({ ...form, chest: v })} placeholder="e.g. 100" />
          <TextField label="Waist" value={form.waist} onChange={(v) => setForm({ ...form, waist: v })} placeholder="e.g. 82" />
          <TextField label="Hips" value={form.hips} onChange={(v) => setForm({ ...form, hips: v })} placeholder="e.g. 96" />
          <TextField label="Shoulders" value={form.shoulders} onChange={(v) => setForm({ ...form, shoulders: v })} placeholder="e.g. 118" />
          <TextField label="Arms (flexed)" value={form.arms} onChange={(v) => setForm({ ...form, arms: v })} placeholder="e.g. 36" />
          <TextField label="Thighs" value={form.thighs} onChange={(v) => setForm({ ...form, thighs: v })} placeholder="e.g. 56" />
          <TextField label="Calves" value={form.calves} onChange={(v) => setForm({ ...form, calves: v })} placeholder="e.g. 38" />
        </div>

        {/* Progress photo */}
        <div style={{ fontSize: 11, fontWeight: 700, color: "#9b9486", letterSpacing: "0.08em", textTransform: "uppercase", margin: "12px 0 8px" }}>Progress photo</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          {form.progressPhoto ? (
            <img src={form.progressPhoto} alt="progress" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1px solid #E4DECE" }} />
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: 8, background: "#F6F3EC", border: "1px dashed #DCD5C4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={20} style={{ color: "#C4BCAC" }} />
            </div>
          )}
          <div>
            <input ref={progressPhotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleProgressPhoto} />
            <PrimaryButton onClick={() => progressPhotoRef.current.click()} style={{ background: "transparent", color: ink, border: "1px solid #DCD5C4", padding: "7px 12px", fontSize: 12 }}>
              {form.progressPhoto ? "Change photo" : "Attach photo"}
            </PrimaryButton>
            {form.progressPhoto && (
              <button onClick={() => setForm((f) => ({ ...f, progressPhoto: "" }))} style={{ marginLeft: 8, fontSize: 12, color: "#9b9486", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
            )}
          </div>
        </div>

        <TextArea label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Sleep, soreness, wins, struggles..." />
        <PrimaryButton onClick={addCheckin}>
          <Plus size={15} /> Save check-in
        </PrimaryButton>
      </Card>

      <div style={{ display: "grid", gap: 10 }}>
        {checkins.length === 0 && (
          <Card>
            <EmptyState icon={Flame} title="No check-ins logged" body="Once you log one, it'll show up here with a quick history per client." />
          </Card>
        )}
        {checkins.map((c) => {
          const client = clients.find((cl) => cl.id === c.clientId);
          const hasMeasurements = c.chest || c.waist || c.hips || c.shoulders || c.arms || c.thighs || c.calves || c.bodyFat;
          return (
            <Card key={c.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flex: 1 }}>
                  {client && <Avatar photo={client.photo} name={client.name} size={36} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>
                      {clientName(c.clientId)} <span style={{ color: "#9b9486", fontWeight: 500 }}>· {c.date}</span>
                    </div>

                    {/* Vitals row */}
                    <div style={{ fontSize: 12, color: "#6b6557", marginTop: 5, display: "flex", gap: 14, flexWrap: "wrap" }}>
                      {c.weight && <span>⚖️ {c.weight} kg</span>}
                      {c.bodyFat && <span>🔥 {c.bodyFat}% BF</span>}
                      {c.adherence && <span>✅ {c.adherence}% adherence</span>}
                      {c.energy && <span>⚡ {c.energy}/10 energy</span>}
                    </div>

                    {/* Measurements grid */}
                    {hasMeasurements && (
                      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                        {[
                          { l: "Chest", v: c.chest },
                          { l: "Waist", v: c.waist },
                          { l: "Hips", v: c.hips },
                          { l: "Shoulders", v: c.shoulders },
                          { l: "Arms", v: c.arms },
                          { l: "Thighs", v: c.thighs },
                          { l: "Calves", v: c.calves },
                        ].filter((m) => m.v).map((m) => (
                          <span key={m.l} style={{ fontSize: 11, color: "#6b6557" }}>
                            <span style={{ fontWeight: 600 }}>{m.l}:</span> {m.v}
                          </span>
                        ))}
                      </div>
                    )}

                    {c.notes && <div style={{ fontSize: 13, marginTop: 6, color: "#3a362d" }}>{c.notes}</div>}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <IconBtn onClick={() => removeCheckin(c.id)} title="Delete check-in">
                    <Trash2 size={16} />
                  </IconBtn>
