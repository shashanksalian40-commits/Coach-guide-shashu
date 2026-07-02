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
                                    {c.progressPhoto && (
                    <img src={c.progressPhoto} alt="progress" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 7, border: "1px solid #E4DECE", cursor: "pointer" }}
                      onClick={() => window.open(c.progressPhoto, "_blank")}
                    />
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ---------- LIBRARY (shared shape for workouts & recipes) ----------
function ExerciseRow({ exercise, onChange, onRemove }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 60px 60px",
        gap: 8,
        marginBottom: 8,
        padding: 10,
        border: "1px solid #EDE8DA",
        borderRadius: 8,
        background: "#FBF9F4",
      }}
    >
      <input
        value={exercise.name}
        onChange={(e) => onChange({ ...exercise, name: e.target.value })}
        placeholder="Exercise name (e.g. Bench Press)"
        style={{ gridColumn: "1 / -1", padding: "8px 10px", border: "1px solid #DCD5C4", borderRadius: 7, fontSize: 13, boxSizing: "border-box" }}
      />
      <input
        value={exercise.sets}
        onChange={(e) => onChange({ ...exercise, sets: e.target.value })}
        placeholder="Sets"
        style={{ padding: "8px 10px", border: "1px solid #DCD5C4", borderRadius: 7, fontSize: 13, boxSizing: "border-box" }}
      />
      <input
        value={exercise.reps}
        onChange={(e) => onChange({ ...exercise, reps: e.target.value })}
        placeholder="Reps"
        style={{ padding: "8px 10px", border: "1px solid #DCD5C4", borderRadius: 7, fontSize: 13, boxSizing: "border-box" }}
      />
      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
        <input
          value={exercise.video}
          onChange={(e) => onChange({ ...exercise, video: e.target.value })}
          placeholder="YouTube video link (optional)"
          style={{ flex: 1, padding: "8px 10px", border: "1px solid #DCD5C4", borderRadius: 7, fontSize: 13, boxSizing: "border-box" }}
        />
        <IconBtn onClick={onRemove} title="Remove exercise">
          <Trash2 size={16} />
        </IconBtn>
      </div>
    </div>
  );
}

function LibraryTab({ items, setItems, kind }) {
  const isWorkout = kind === "workout";
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(
    isWorkout
      ? { title: "", category: "", duration: "", exercises: [] }
      : { title: "", category: "", macros: "", details: "" }
  );

  const reset = () =>
    setForm(isWorkout ? { title: "", category: "", duration: "", exercises: [] } : { title: "", category: "", macros: "", details: "" });

  const addExerciseRow = () => {
    setForm((f) => ({ ...f, exercises: [...f.exercises, { id: uid(), name: "", sets: "", reps: "", video: "" }] }));
  };

  const updateExerciseRow = (id, next) => {
    setForm((f) => ({ ...f, exercises: f.exercises.map((ex) => (ex.id === id ? next : ex)) }));
  };

  const removeExerciseRow = (id) => {
    setForm((f) => ({ ...f, exercises: f.exercises.filter((ex) => ex.id !== id) }));
  };

  const addItem = () => {
    if (!form.title.trim()) return;
    setItems((prev) => [{ id: uid(), ...form }, ...prev]);
    reset();
    setAdding(false);
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const filtered = items.filter(
    (i) =>
      i.title.toLowerCase().includes(query.toLowerCase()) ||
      (i.category || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h2 className="disp" style={{ fontSize: 20, margin: 0, textTransform: "uppercase" }}>
          {isWorkout ? "Workout Library" : "Recipe Library"}
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: "#9b9486" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isWorkout ? "Search workouts..." : "Search recipes..."}
              style={{ padding: "8px 10px 8px 30px", border: "1px solid #DCD5C4", borderRadius: 7, fontSize: 13, width: 200 }}
            />
          </div>
          <PrimaryButton onClick={() => setAdding((v) => !v)}>
            <Plus size={15} /> Add
          </PrimaryButton>
        </div>
      </div>

      {adding && (
        <Card>
          <TextField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder={isWorkout ? "e.g. Upper Body Push — Day A" : "e.g. High-Protein Overnight Oats"} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TextField label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} placeholder={isWorkout ? "e.g. Strength / Hypertrophy" : "e.g. Breakfast / High-protein"} />
            {isWorkout ? (
              <TextField label="Duration" value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} placeholder="e.g. 45 min" />
            ) : (
              <TextField label="Macros" value={form.macros} onChange={(v) => setForm({ ...form, macros: v })} placeholder="e.g. 420 kcal · 38P 40C 12F" />
            )}
          </div>

          {isWorkout ? (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#6b6557", marginBottom: 8 }}>Exercises</div>
              {form.exercises.length === 0 && (
                <div style={{ fontSize: 12, color: "#9b9486", marginBottom: 8 }}>No exercises added yet — tap below to add your first one.</div>
              )}
              {form.exercises.map((ex) => (
                <ExerciseRow
                  key={ex.id}
                  exercise={ex}
                  onChange={(next) => updateExerciseRow(ex.id, next)}
                  onRemove={() => removeExerciseRow(ex.id)}
                />
              ))}
              <PrimaryButton onClick={addExerciseRow} style={{ background: "transparent", color: ink, border: "1px solid #DCD5C4", padding: "7px 12px", fontSize: 12, marginTop: 4 }}>
                <Plus size={14} /> Add exercise
              </PrimaryButton>
            </div>
          ) : (
            <TextArea label="Ingredients & method" rows={5} value={form.details} onChange={(v) => setForm({ ...form, details: v })} placeholder={"Ingredients:\n- ...\nMethod:\n1. ..."} />
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <PrimaryButton onClick={addItem}>Save to library</PrimaryButton>
            <PrimaryButton onClick={() => setAdding(false)} style={{ background: "transparent", color: ink, border: "1px solid #DCD5C4" }}>
              Cancel
            </PrimaryButton>
          </div>
        </Card>
      )}

      {filtered.length === 0 && (
        <Card>
          <EmptyState
            icon={isWorkout ? Dumbbell : UtensilsCrossed}
            title={items.length === 0 ? "Library is empty" : "No matches"}
            body={items.length === 0 ? `Build this once and reuse it across every client you onboard.` : "Try a different search term."}
          />
        </Card>
      )}

      <div style={{ display: "grid", gap: 10 }}>
        {filtered.map((i) => (
          <Card key={i.id}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div className="disp" style={{ fontSize: 15, fontWeight: 600 }}>{i.title}</div>
                <div style={{ fontSize: 12, color: "#9b9486", marginTop: 2 }}>
                  {[i.category, isWorkout ? i.duration : i.macros].filter(Boolean).join(" · ")}
                </div>
              </div>
              <IconBtn onClick={() => removeItem(i.id)} title="Remove">
                <Trash2 size={16} />
              </IconBtn>
            </div>

            {/* New structured exercises (with per-exercise video) */}
            {isWorkout && i.exercises && i.exercises.length > 0 && (
              <div style={{ marginTop: 10, display: "grid", gap: 4 }}>
                {i.exercises.map((ex) => (
                  <div
                    key={ex.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderTop: "1px solid #EDE8DA",
                    }}
                  >
                    <div style={{ fontSize: 13, color: "#3a362d" }}>
                      <span style={{ fontWeight: 600 }}>{ex.name}</span>
                      {(ex.sets || ex.reps) && (
                        <span style={{ color: "#9b9486" }}> · {ex.sets}x{ex.reps}</span>
                      )}
                    </div>
                    {ex.video ? (
                      <a
                        href={ex.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: accent,
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          whiteSpace: "nowrap",
                        }}
                      >
                        ▶ Watch
                      </a>
                    ) : (
                      <span style={{ fontSize: 11, color: "#C4BCAC" }}>No video yet</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Legacy freeform text (old workout entries typed before this update, and all recipes) */}
            {i.details && (
              <div style={{ fontSize: 13, marginTop: 10, whiteSpace: "pre-wrap", color: "#3a362d", lineHeight: 1.5 }}>{i.details}</div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
// ---------- CLIENT PORTAL (shared, public-facing) ----------
function ClientPortal({ sharedClients, submitCheckin }) {
  const [clientId, setClientId] = useState("");
  const [form, setForm] = useState({
    weight: "", adherence: "", energy: "", notes: "",
    chest: "", waist: "", hips: "", thighs: "", arms: "", shoulders: "", calves: "", bodyFat: "",
    progressPhoto: "",
  });
  const [done, setDone] = useState(false);
  const progressPhotoRef = React.useRef();

  const handleProgressPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const b64 = await fileToBase64(file);
    setForm((f) => ({ ...f, progressPhoto: b64 }));
  };

  const submit = () => {
    if (!clientId) return;
    submitCheckin({ id: uid(), clientId, date: today(), ...form });
    setForm({ weight: "", adherence: "", energy: "", notes: "", chest: "", waist: "", hips: "", thighs: "", arms: "", shoulders: "", calves: "", bodyFat: "", progressPhoto: "" });
    setDone(true);
    setTimeout(() => setDone(false), 3500);
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto" }}>
      <Card>
        <h2 className="disp" style={{ fontSize: 20, margin: "0 0 6px", textTransform: "uppercase" }}>Daily check-in</h2>
        <p style={{ fontSize: 13, color: "#6b6557", margin: "0 0 16px" }}>
          Pick your name and log today's numbers. Your coach sees this instantly.
        </p>

        {sharedClients.length === 0 ? (
          <EmptyState icon={Users} title="No clients set up yet" body="Ask your coach to add you in CoachOS first." />
        ) : done ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <CheckCircle2 size={28} color={accent} style={{ marginBottom: 8 }} />
            <div className="disp" style={{ fontSize: 16 }}>Check-in sent</div>
            <div style={{ fontSize: 13, color: "#6b6557", marginTop: 4 }}>Nice work. See you tomorrow.</div>
          </div>
        ) : (
          <>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b6557", marginBottom: 12 }}>
              Who are you?
              <select value={clientId} onChange={(e) => setClientId(e.target.value)}
                style={{ display: "block", width: "100%", marginTop: 5, padding: "9px 11px", border: "1px solid #DCD5C4", borderRadius: 7, fontSize: 14 }}>
                <option value="">Select your name</option>
                {sharedClients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#9b9486", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Vitals</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <TextField label="Weight (kg / lbs)" value={form.weight} onChange={(v) => setForm({ ...form, weight: v })} placeholder="e.g. 78.2" />
              <TextField label="Body fat %" value={form.bodyFat} onChange={(v) => setForm({ ...form, bodyFat: v })} placeholder="e.g. 22" />
              <TextField label="Plan adherence %" value={form.adherence} onChange={(v) => setForm({ ...form, adherence: v })} placeholder="e.g. 90" />
              <TextField label="Energy / mood (1-10)" value={form.energy} onChange={(v) => setForm({ ...form, energy: v })} placeholder="e.g. 7" />
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#9b9486", letterSpacing: "0.08em", textTransform: "uppercase", margin: "12px 0 8px" }}>Body measurements (cm / in)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <TextField label="Chest" value={form.chest} onChange={(v) => setForm({ ...form, chest: v })} placeholder="e.g. 100" />
              <TextField label="Waist" value={form.waist} onChange={(v) => setForm({ ...form, waist: v })} placeholder="e.g. 82" />
              <TextField label="Hips" value={form.hips} onChange={(v) => setForm({ ...form, hips: v })} placeholder="e.g. 96" />
              <TextField label="Shoulders" value={form.shoulders} onChange={(v) => setForm({ ...form, shoulders: v })} placeholder="e.g. 118" />
              <TextField label="Arms (flexed)" value={form.arms} onChange={(v) => setForm({ ...form, arms: v })} placeholder="e.g. 36" />
              <TextField label="Thighs" value={form.thighs} onChange={(v) => setForm({ ...form, thighs: v })} placeholder="e.g. 56" />
              <TextField label="Calves" value={form.calves} onChange={(v) => setForm({ ...form, calves: v })} placeholder="e.g. 38" />
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: "#9b9486", letterSpacing: "0.08em", textTransform: "uppercase", margin: "12px 0 8px" }}>Progress photo</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
              {form.progressPhoto ? (
                <img src={form.progressPhoto} alt="progress" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid #E4DECE" }} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: 8, background: "#F6F3EC", border: "1px dashed #DCD5C4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users size={18} style={{ color: "#C4BCAC" }} />
                </div>
              )}
              <div>
                <input ref={progressPhotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleProgressPhoto} />
                <PrimaryButton onClick={() => progressPhotoRef.current.click()} style={{ background: "transparent", color: ink, border: "1px solid #DCD5C4", padding: "7px 12px", fontSize: 12 }}>
                  {form.progressPhoto ? "Change photo" : "Attach photo"}
                </PrimaryButton>
              </div>
            </div>

            <TextArea label="Anything your coach should know?" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Sleep, soreness, wins, struggles..." />

            <PrimaryButton onClick={submit} style={{ width: "100%", justifyContent: "center" }}>
              Submit check-in
            </PrimaryButton>
          </>
        )}
      </Card>
    </div>
  );
}
function Header({ activeTab, setActiveTab, clientCount, onLock }) {
  return (
    <div style={{ borderBottom: `3px solid ${ink}`, background: "#F6F3EC", position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <h1 className="disp" style={{ fontSize: 28, fontWeight: 700, margin: 0, textTransform: "uppercase" }}>
            Coach<span style={{ color: accent }}>OS</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#9b9486", marginLeft: 10, letterSpacing: "0.04em", fontFamily: "Inter, sans-serif", textTransform: "none" }}>
              Coach Dashboard
            </span>
          </h1>
          <button onClick={onLock} style={{ fontSize: 12, fontWeight: 600, color: "#9b9486", background: "none", border: "1px solid #DCD5C4", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>
            🔒 Lock & exit
          </button>
        </div>
        <div style={{ fontSize: 12, color: "#9b9486", margin: "6px 0 0" }}>{clientCount} active client{clientCount === 1 ? "" : "s"}</div>
        <nav style={{ display: "flex", gap: 4, marginTop: 14, overflowX: "auto" }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 16px",
                  background: active ? ink : "transparent", color: active ? "#F6F3EC" : ink,
                  border: "none", borderRadius: "8px 8px 0 0", fontSize: 13, fontWeight: 600,
                  cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.15s",
                }}
              >
                <Icon size={15} />{t.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

const DEFAULT_PIN = "1234";

function PinScreen({ storedPin, onUnlock }) {
  const [digits, setDigits] = useState("");
  const [shake, setShake] = useState(false);
  const [settingPin, setSettingPin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMsg, setPinMsg] = useState({ text: "", ok: false });

  const pressDigit = (d) => {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === (storedPin || DEFAULT_PIN)) {
          onUnlock();
        } else {
          setShake(true);
          setTimeout(() => { setShake(false); setDigits(""); }, 600);
        }
      }, 150);
    }
  };

  const delDigit = () => setDigits((d) => d.slice(0, -1));

  if (settingPin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 340 }}>
          <Card>
            <h2 className="disp" style={{ fontSize: 18, textTransform: "uppercase", margin: "0 0 6px" }}>Set your PIN</h2>
            <p style={{ fontSize: 13, color: "#6b6557", marginBottom: 16 }}>Choose a 4-digit PIN to protect your coach dashboard.</p>
            <TextField label="New PIN (4 digits)" type="password" value={newPin} onChange={(v) => setNewPin(v.replace(/\D/g, "").slice(0, 4))} placeholder="e.g. 5678" />
            <TextField label="Confirm PIN" type="password" value={confirmPin} onChange={(v) => setConfirmPin(v.replace(/\D/g, "").slice(0, 4))} placeholder="Repeat PIN" />
            {pinMsg.text && (
              <div style={{ fontSize: 12, marginBottom: 10, color: pinMsg.ok ? "#22a45d" : accent }}>{pinMsg.text}</div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <PrimaryButton onClick={() => {
                if (newPin.length < 4) { setPinMsg({ text: "PIN must be 4 digits", ok: false }); return; }
                if (newPin !== confirmPin) { setPinMsg({ text: "PINs don't match", ok: false }); return; }
                storageClient.set("coachos:pin", newPin, false).catch(() => {});
                setPinMsg({ text: "PIN saved! Use it next time.", ok: true });
                setTimeout(() => { setSettingPin(false); setNewPin(""); setConfirmPin(""); setPinMsg({ text: "", ok: false }); }, 2000);
              }}>Save PIN</PrimaryButton>
              <PrimaryButton onClick={() => { setSettingPin(false); setNewPin(""); setConfirmPin(""); }}
                style={{ background: "transparent", color: ink, border: "1px solid #DCD5C4" }}>Cancel</PrimaryButton>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <h1 className="disp" style={{ fontSize: 32, fontWeight: 700, textTransform: "uppercase", margin: "0 0 6px" }}>
        Coach<span style={{ color: accent }}>OS</span>
      </h1>
      <p style={{ fontSize: 13, color: "#6b6557", margin: "0 0 36px" }}>Enter your coach PIN to access the dashboard</p>
      <div style={{ display: "flex", gap: 14, marginBottom: 36, animation: shake ? "shake 0.4s ease" : "none" }}>
        <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}`}</style>
        {[0,1,2,3].map((i) => (
          <div key={i} style={{
            width: 16, height: 16, borderRadius: "50%",
            background: i < digits.length ? ink : "transparent",
            border: `2px solid ${i < digits.length ? ink : "#C4BCAC"}`,
            transition: "background 0.12s",
          }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 76px)", gap: 10 }}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k, i) => (
          <button key={i}
            onClick={() => k === "⌫" ? delDigit() : k !== "" ? pressDigit(String(k)) : null}
            style={{
              height: 76, borderRadius: 14,
              border: k === "" ? "none" : "1px solid #DCD5C4",
              background: k === "" ? "transparent" : "#fff",
              fontSize: k === "⌫" ? 20 : 24, fontWeight: 600,
              cursor: k === "" ? "default" : "pointer", color: ink,
              boxShadow: k !== "" ? "0 1px 4px rgba(0,0,0,0.07)" : "none",
              transition: "background 0.1s",
            }}
            onMouseDown={(e) => { if (k !== "") e.currentTarget.style.background = "#F6F3EC"; }}
            onMouseUp={(e) => { if (k !== "") e.currentTarget.style.background = "#fff"; }}
          >{k}</button>
        ))}
      </div>
      <button onClick={() => setSettingPin(true)}
        style={{ marginTop: 32, fontSize: 12, color: "#9b9486", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
        {storedPin ? "Change PIN" : `Set a custom PIN (default: ${DEFAULT_PIN})`}
      </button>
    </div>
  );
}

function ClientLanding({ sharedClients, submitCheckin, onCoachLogin }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F6F3EC" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 20px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h1 className="disp" style={{ fontSize: 26, fontWeight: 700, textTransform: "uppercase", margin: 0 }}>
            Coach<span style={{ color: accent }}>OS</span>
          </h1>
          <button onClick={onCoachLogin}
            style={{ fontSize: 12, fontWeight: 600, color: "#9b9486", background: "none", border: "1px solid #DCD5C4", borderRadius: 6, padding: "6px 14px", cursor: "pointer" }}>
            🔐 Coach login
          </button>
        </div>
        <ClientPortal sharedClients={sharedClients} submitCheckin={submitCheckin} />
      </div>
    </div>
  );
}

export default function CoachOS() {
  const [view, setView] = useState("client");
  const [activeTab, setActiveTab] = useState("clients");
  const [storedPin, setStoredPin] = useState(null);

  const [clients, setClients, clientsLoaded] = useStore("coachos:clients", []);
  const [checkins, setCheckins, checkinsLoaded, refreshCheckins] = useStore("coachos:checkins", [], true);
  const [sharedClients, setSharedClients, sharedClientsLoaded] = useStore("coachos:shared-clients", [], true);
  const [workouts, setWorkouts, workoutsLoaded] = useStore("coachos:workouts", []);
  const [recipes, setRecipes, recipesLoaded] = useStore("coachos:recipes", []);

  const ready = clientsLoaded && checkinsLoaded && workoutsLoaded && recipesLoaded && sharedClientsLoaded;

  useEffect(() => {
    storageClient.get("coachos:pin", false)
      .then((r) => { if (r?.value) setStoredPin(r.value); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!clientsLoaded) return;
    setSharedClients(clients.map((c) => ({ id: c.id, name: c.name })));
  }, [clients, clientsLoaded]);

  useEffect(() => {
    if (view !== "client") return;
    const t = setInterval(() => refreshCheckins(), 5000);
    return () => clearInterval(t);
  }, [view, refreshCheckins]);

  const submitCheckin = (entry) => setCheckins((prev) => [entry, ...prev]);

  if (!ready) {
    return <Shell><div style={{ padding: 60, textAlign: "center", color: "#9b9486", fontSize: 13 }}>Loading…</div></Shell>;
  }

  if (view === "client") {
    return (
      <Shell>
        <ClientLanding
          sharedClients={sharedClients}
          submitCheckin={submitCheckin}
          onCoachLogin={() => setView("pin")}
        />
      </Shell>
    );
  }

  if (view === "pin") {
    return (
      <Shell>
        <PinScreen
          storedPin={storedPin}
          onUnlock={() => {
            storageClient.get("coachos:pin", false).then((r) => { if (r?.value) setStoredPin(r.value); }).catch(() => {});
            setView("coach");
          }}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clientCount={clients.length}
        onLock={() => setView("client")}
      />
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 24px 60px" }}>
        {activeTab === "clients"  && <ClientsTab clients={clients} setClients={setClients} checkins={checkins} />}
        {activeTab === "checkins" && <CheckinsTab clients={clients} checkins={checkins} setCheckins={setCheckins} />}
        {activeTab === "workouts" && <LibraryTab items={workouts} setItems={setWorkouts} kind="workout" />}
        {activeTab === "recipes"  && <LibraryTab items={recipes}  setItems={setRecipes}  kind="recipe" />}
      </main>
    </Shell>
  );
}
