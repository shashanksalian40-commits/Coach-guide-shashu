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
