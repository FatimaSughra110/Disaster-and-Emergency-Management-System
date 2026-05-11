import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const API_BASE = "http://localhost:3001/api";

const PALETTE = {
  primary: "#1F6F5F",
  secondary: "#2FA084",
  accent: "#6FCF97",
  surface: "#EEEEEE",
  textDark: "#0D2B25",
  textMuted: "#4A7A6D",
};

const SEVERITY_COLORS = {
  critical: "#C0392B", // Derived red as requested
  high: "#E67E22",
  medium: "#F1C40F",
  low: "#27AE60",
};

const STATUS_COLORS = {
  active: "#C0392B",
  contained: "#27AE60",
  monitoring: "#F1C40F",
  deployed: "#1F6F5F",
  available: "#2FA084",
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function IncidentMap({ selected, incidents, predictions, onSelect }) {
  const center = selected ? [selected.lat, selected.lng] : [20, 0];
  const zoom = selected ? 10 : 2;

  return (
    <div className="fade-in-panel stagger-2" style={{ borderRadius: 4, overflow: "hidden", height: "calc(100vh - 300px)", minHeight: 450, border: `1px solid ${PALETTE.secondary}4D`, position: 'relative' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ChangeView center={center} zoom={zoom} />
        
        {incidents.filter(inc => inc.lat && inc.lng).map(inc => (
          <Marker 
            key={`inc-${inc.id}`} 
            position={[inc.lat, inc.lng]}
            eventHandlers={{ click: () => onSelect(inc) }}
          >
            <Popup>
              <strong style={{ fontFamily: 'var(--font-heading)' }}>🚨 {inc.type} (LIVE)</strong><br />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>{inc.location}</span><br />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>Severity: {inc.severity}</span>
            </Popup>
          </Marker>
        ))}

        {predictions && predictions.filter(pred => pred.lat && pred.lng).map(pred => (
          <CircleMarker
            key={`pred-${pred.id}`}
            center={[pred.lat, pred.lng]}
            radius={12}
            pathOptions={{
              color: SEVERITY_COLORS[pred.severity] || PALETTE.secondary,
              fillColor: SEVERITY_COLORS[pred.severity] || PALETTE.secondary,
              fillOpacity: 0.4,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <strong style={{ fontFamily: 'var(--font-heading)' }}>🤖 AI PREDICTION</strong><br />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>Type: {pred.type}</span><br />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>Confidence: {pred.confidence}%</span><br />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>ETA: {pred.timeframe}</span><br />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12 }}>Loc: {pred.location}</span>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'white', padding: 12, borderRadius: 2, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', fontSize: 11, border: `1px solid ${PALETTE.secondary}33` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, color: PALETTE.textDark, fontFamily: 'var(--font-metadata)', opacity: 0.85 }}>
           <img src={markerIcon} style={{ width: 10 }} /> <strong>Live Incidents</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: PALETTE.textDark, fontFamily: 'var(--font-metadata)', opacity: 0.85 }}>
           <div style={{ width: 10, height: 10, borderRadius: '50%', border: `1px dashed ${PALETTE.secondary}`, background: `${PALETTE.secondary}4D` }} /> <strong>AI Predictions</strong>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div className="fade-in-panel stagger-1" style={{
      background: "white", borderRadius: 4, padding: "24px",
      borderLeft: `3px solid ${accent}`, borderBottom: `1px solid ${PALETTE.secondary}1A`,
      display: "flex", alignItems: "center", gap: 16, minWidth: 0,
    }}>
      <div style={{ fontSize: 24, opacity: 0.8 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: PALETTE.textDark, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: PALETTE.textMuted, fontFamily: 'var(--font-heading)', textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>{label}</div>
        {sub && <div className="metadata" style={{ fontSize: 10, marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

function IncidentRow({ inc, onClick, selected }) {
  return (
    <div onClick={() => onClick(inc)} className="output-line" style={{
      padding: "12px 16px", borderRadius: 2, cursor: "pointer",
      background: selected ? `${PALETTE.primary}14` : "white",
      borderLeft: selected ? `3px solid ${PALETTE.accent}` : "3px solid transparent",
      borderBottom: `1px solid ${PALETTE.secondary}1A`,
      marginBottom: 4, transition: "all 0.2s ease-out",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div className={selected ? "pulse-border" : ""} style={{
        width: 8, height: 8, borderRadius: "50%",
        background: SEVERITY_COLORS[inc.severity] || PALETTE.textMuted,
        flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: PALETTE.textDark, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: 'var(--font-body)' }}>
          {inc.type}
        </div>
        <div className="metadata" style={{ fontSize: 11, color: PALETTE.textMuted }}>{inc.location} · {inc.time}</div>
      </div>
      <div style={{
        fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5,
        padding: "2px 6px", borderRadius: 2,
        background: `${STATUS_COLORS[inc.status]}1A`,
        color: STATUS_COLORS[inc.status],
        fontFamily: 'var(--font-body)'
      }}>
        {inc.status}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [incidents, setIncidents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [resources, setResources] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [editedResources, setEditedResources] = useState({});
  const [vForm, setVForm] = useState({ name: "", skills: "", location: "" });
  const [deployingId, setDeployingId] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  const fetchData = async () => {
    try {
      const [incRes, volRes, resRes, predRes] = await Promise.all([
        fetch(`${API_BASE}/incidents`),
        fetch(`${API_BASE}/volunteers`),
        fetch(`${API_BASE}/resources`),
        fetch(`${API_BASE}/predictions`)
      ]);
      if (!incRes.ok || !volRes.ok || !resRes.ok || !predRes.ok) throw new Error("Fetch failed");
      const [inc, vol, res, pred] = await Promise.all([
        incRes.json(), volRes.json(), resRes.json(), predRes.json()
      ]);
      setIncidents(inc);
      setVolunteers(vol);
      setResources(res);
      setPredictions(pred);
      
      if (isAdmin) {
        const auditRes = await fetch(`${API_BASE}/audit-logs`);
        if (auditRes.ok) {
          const auditData = await auditRes.json();
          setAuditLogs(auditData);
        }
      }

      setConnectionError(null);
    } catch (err) {
      setConnectionError(err.message);
    }
  };

  const runPrediction = async () => {
    setIsPredicting(true);
    try {
      const res = await fetch(`${API_BASE}/predict/run`, { method: "POST" });
      if (res.ok) { await fetchData(); alert("AI engine finished!"); }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleLogin = async () => {
    const u = document.getElementById("admin-user").value;
    const p = document.getElementById("admin-pass").value;
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p })
      });
      const data = await res.json();
      if (data.success) { setIsAdmin(true); setShowLogin(false); }
      else { alert("Wrong credentials"); }
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  const handleAdjust = (name, delta) => {
    setEditedResources(prev => ({ ...prev, [name]: (prev[name] || 0) + delta }));
  };

  const saveResource = async (name) => {
    const change = editedResources[name];
    if (!change) return;
    try {
      const res = await fetch(`${API_BASE}/resources/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, change })
      });
      if (res.ok) {
        setEditedResources(prev => { const n = {...prev}; delete n[name]; return n; });
        await fetchData();
        alert(`Saved ${name} to Database.`);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const addVolunteer = async (e) => {
    e.preventDefault();
    if (!vForm.name || !vForm.skills) { alert("Missing fields"); return; }
    try {
      const res = await fetch(`${API_BASE}/volunteers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vForm)
      });
      if (res.ok) {
        setVForm({ name: "", skills: "", location: "" });
        await fetchData();
        alert("Volunteer added!");
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const deleteVolunteer = async (id) => {
    if (!window.confirm("Delete?")) return;
    try {
      const res = await fetch(`${API_BASE}/volunteers/${id}`, { method: "DELETE" });
      if (res.ok) await fetchData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const deployVolunteer = async (volunteerId, location) => {
    try {
      const res = await fetch(`${API_BASE}/volunteers/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId, location })
      });
      if (res.ok) {
        setDeployingId(null);
        await fetchData();
        alert("Deployed to " + location);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch(`${API_BASE}/audit-logs`);
      const data = await response.json();
      setAuditLogs(data);
    } catch (error) {
      console.error("Error fetching Oracle audit logs:", error);
    }
  };

  const clearAllVolunteers = async () => {
    if (!window.confirm("Clear All?")) return;
    try {
      const res = await fetch(`${API_BASE}/volunteers/clear`, { method: "POST" });
      if (res.ok) await fetchData();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [isAdmin, activeTab]);

  const criticalResources = resources.filter(r => r.current <= r.critical).length;
  const activeIncidents = incidents.filter(i => i.status === 'active').length;
  const deployedCount = volunteers.filter(v => v.status?.toLowerCase() === 'deployed').length;

  const tabs = [
    { id: "dashboard", label: "Command", icon: "⚡" },
    { id: "incidents", label: "Incidents", icon: "🚨" },
    { id: "volunteers", label: "Volunteers", icon: "👥" },
    { id: "resources", label: "Resources", icon: "📦" },
    { id: "predict", label: "AI Predict", icon: "🤖" },
    // Only add Audit tab if isAdmin is true
    ...(isAdmin ? [{ id: "audit", label: "Audit Logs", icon: "📜" }] : []),
  ];

  return (
    <div className="noise-overlay" style={{ background: PALETTE.surface, minHeight: "100vh", width: "100vw", color: PALETTE.textDark, display: "flex", flexDirection: "column" }}>
      <header className="fade-in-panel stagger-1" style={{ background: PALETTE.primary, color: "white", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${PALETTE.secondary}4D` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>🛡</span>
          <h1 style={{ fontSize: 20, margin: 0, color: "white" }}>DEMS Command Center</h1>
          {connectionError && <span className="metadata shake" style={{ background: "#C0392B", padding: "4px 8px", borderRadius: 2, fontSize: 10 }}>OFFLINE: {connectionError}</span>}
        </div>
        <div>
          {isAdmin ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span className="metadata" style={{ fontSize: 10, background: "rgba(255,255,255,0.15)", padding: "4px 8px", borderRadius: 2, letterSpacing: "0.1em" }}>ADMIN_MODE</span>
              <button onClick={() => setIsAdmin(false)} style={{ background: "transparent", border: `1px solid ${PALETTE.accent}`, color: PALETTE.accent, padding: "6px 12px", borderRadius: 2, cursor: "pointer", fontSize: 11, fontFamily: 'var(--font-body)', textTransform: 'uppercase' }}>Logout</button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ background: "rgba(255,255,255,0.1)", border: `1px solid rgba(255,255,255,0.3)`, color: "white", padding: "8px 16px", borderRadius: 2, cursor: "pointer", fontFamily: 'var(--font-body)', fontSize: 12 }}>🔐 Admin Login</button>
          )}
        </div>
      </header>

      <nav className="fade-in-panel stagger-1" style={{ background: "white", padding: "0 28px", display: "flex", gap: 32, borderBottom: `1px solid ${PALETTE.secondary}33` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "18px 0", border: "none", background: "none", cursor: "pointer", borderBottom: activeTab === t.id ? `2px solid ${PALETTE.accent}` : "2px solid transparent", color: activeTab === t.id ? PALETTE.primary : PALETTE.textMuted, fontWeight: activeTab === t.id ? 700 : 500, fontFamily: 'var(--font-heading)', fontSize: 14, transition: "all 0.2s ease" }}>
            <span style={{ marginRight: 8 }}>{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>

      <main style={{ padding: 28, flex: 1 }}>
        {activeTab === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, marginBottom: 32 }}>
              <StatCard label="Active Incidents" value={activeIncidents} accent="#C0392B" icon="🚨" />
              <StatCard label="Resources Critical" value={criticalResources} accent="#E67E22" icon="📦" />
              <StatCard label="Volunteers Live" value={volunteers.length} accent={PALETTE.secondary} icon="👥" />
              <StatCard label="Deployed" value={deployedCount} accent={PALETTE.primary} icon="🚢" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 32 }}>
              <IncidentMap selected={selectedIncident} incidents={incidents} predictions={predictions} onSelect={setSelectedIncident} />
              <div className="fade-in-panel stagger-3" style={{ background: "white", padding: 24, borderRadius: 4, height: "calc(100vh - 300px)", minHeight: 450, overflowY: "auto", border: `1px solid ${PALETTE.secondary}1A` }}>
                <h3 style={{ marginBottom: 20, color: PALETTE.textDark, borderBottom: `1px solid ${PALETTE.secondary}33`, paddingBottom: 12 }}>Live Incident Feed</h3>
                {incidents.slice(0, 50).map(inc => (
                  <IncidentRow key={inc.id} inc={inc} onClick={setSelectedIncident} selected={selectedIncident?.id === inc.id} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "incidents" && (
          <div className="fade-in-panel stagger-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 24 }}>
            {incidents.map((inc, i) => (
              <div key={inc.id} className={`output-line stagger-${(i % 4) + 1}`} style={{ background: "white", padding: 24, borderRadius: 4, borderLeft: `4px solid ${SEVERITY_COLORS[inc.severity] || PALETTE.textMuted}`, color: PALETTE.textDark, borderBottom: `1px solid ${PALETTE.secondary}1A` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                  <h4 style={{ color: PALETTE.primary, margin: 0 }}>{inc.type}</h4>
                  <span className="metadata" style={{ fontSize: 9, padding: "2px 6px", borderRadius: 2, background: `${STATUS_COLORS[inc.status]}1A`, color: STATUS_COLORS[inc.status], fontWeight: 700, textTransform: 'uppercase' }}>{inc.status}</span>
                </div>
                <p style={{ fontSize: 13, margin: "12px 0", fontFamily: 'var(--font-body)' }}><strong>Location:</strong> {inc.location}</p>
                <div style={{ display: "flex", gap: 20, fontSize: 11, color: PALETTE.textMuted, fontFamily: 'var(--font-metadata)' }}>
                   <span>👥 {inc.volunteers} Volunteers</span>
                   <span>📦 {inc.resources} Units</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "volunteers" && (
          <div>
            {isAdmin && (
              <div className="fade-in-panel stagger-2" style={{ background: "white", padding: 32, borderRadius: 4, marginBottom: 32, border: `1px solid ${PALETTE.secondary}1A`, color: PALETTE.textDark }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <h3 style={{ color: PALETTE.primary, margin: 0 }}>Register New Volunteer</h3>
                  <button onClick={clearAllVolunteers} style={{ padding: "8px 16px", background: "transparent", color: "#C0392B", border: "1px solid #C0392B", borderRadius: 2, fontSize: 10, cursor: "pointer", fontWeight: 700, fontFamily: 'var(--font-body)' }}>🗑️ CLEAR DATABASE</button>
                </div>
                <form onSubmit={addVolunteer} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 20, alignItems: "end" }}>
                  <div>
                    <label className="metadata" style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 8, color: PALETTE.textMuted }}>Full Name</label>
                    <input value={vForm.name} onChange={e => setVForm({...vForm, name: e.target.value})} placeholder="e.g. John Doe" style={{ width: "100%", padding: "12px", borderRadius: 2 }} />
                  </div>
                  <div>
                    <label className="metadata" style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 8, color: PALETTE.textMuted }}>Skills</label>
                    <input value={vForm.skills} onChange={e => setVForm({...vForm, skills: e.target.value})} placeholder="e.g. Medical, Rescue" style={{ width: "100%", padding: "12px", borderRadius: 2 }} />
                  </div>
                  <div>
                    <label className="metadata" style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 8, color: PALETTE.textMuted }}>Distance (km)</label>
                    <input value={vForm.location} onChange={e => setVForm({...vForm, location: e.target.value})} placeholder="e.g. 1.5" style={{ width: "100%", padding: "12px", borderRadius: 2 }} />
                  </div>
                  <button type="submit" style={{ padding: "13px 32px", background: PALETTE.secondary, color: "white", border: "none", borderRadius: 2, fontWeight: 700, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>ADD</button>
                </form>
              </div>
            )}

            <div className="fade-in-panel stagger-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
              {volunteers.map(vol => {
                const isDeployed = vol.status?.toLowerCase() === 'deployed';
                return (
                  <div key={vol.id} style={{ background: "white", padding: 24, borderRadius: 4, borderLeft: `4px solid ${isDeployed ? PALETTE.primary : PALETTE.secondary}`, color: PALETTE.textDark, borderBottom: `1px solid ${PALETTE.secondary}1A` }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 2, background: isDeployed ? PALETTE.primary : PALETTE.secondary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: 20, fontFamily: 'var(--font-heading)' }}>{vol.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: PALETTE.primary, margin: 0 }}>{vol.name}</h4>
                        <div className="metadata" style={{ 
                          display: "inline-block", 
                          fontSize: 9, 
                          fontWeight: 700, 
                          padding: "2px 6px", 
                          borderRadius: 2, 
                          background: isDeployed ? `${PALETTE.primary}1A` : `${PALETTE.secondary}1A`,
                          color: isDeployed ? PALETTE.primary : PALETTE.secondary,
                          textTransform: "uppercase",
                          marginTop: 4
                        }}>
                          {vol.status}
                        </div>
                      </div>
                      {isAdmin && <button onClick={() => deleteVolunteer(vol.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>🗑️</button>}
                    </div>
                    
                    <div className="metadata" style={{ fontSize: 11, color: PALETTE.textMuted, marginBottom: 16 }}>
                        📍 {isDeployed ? "At Predicted Site: " : "Current Distance: "} <strong style={{ color: PALETTE.textDark }}>{vol.location}</strong>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                      {vol.skills.map((s, idx) => <span key={idx} className="metadata" style={{ fontSize: 9, background: PALETTE.surface, padding: "3px 8px", borderRadius: 2, color: PALETTE.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>{s}</span>)}
                    </div>

                    {isAdmin && !isDeployed && (
                      <div>
                          {deployingId === vol.id ? (
                            <div style={{ background: PALETTE.surface, padding: 16, borderRadius: 2, border: `1px solid ${PALETTE.secondary}33` }}>
                                <div className="metadata" style={{ fontSize: 10, fontWeight: 700, marginBottom: 12, color: PALETTE.textMuted, textTransform: 'uppercase' }}>Select Predicted Site:</div>
                                {predictions.length === 0 ? <div className="metadata" style={{ fontSize: 11 }}>No sites found. Run AI first.</div> : (
                                    <div style={{ maxHeight: 150, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                                        {predictions.map(p => (
                                            <button key={p.id} onClick={() => deployVolunteer(vol.id, p.location)} style={{ textAlign: "left", padding: "12px", borderRadius: 2, border: `1px solid ${PALETTE.primary}`, background: "white", fontSize: 12, cursor: "pointer", fontWeight: "700", fontFamily: 'var(--font-body)' }}>📍 {p.type} @ {p.location}</button>
                                        ))}
                                    </div>
                                )}
                                <button onClick={() => setDeployingId(null)} style={{ width: "100%", marginTop: 12, background: "none", border: "none", fontSize: 10, color: PALETTE.textMuted, cursor: "pointer", textDecoration: "underline", fontFamily: 'var(--font-body)' }}>Cancel</button>
                            </div>
                        ) : <button onClick={() => setDeployingId(vol.id)} style={{ width: "100%", padding: "12px", background: PALETTE.primary, color: "white", border: "none", borderRadius: 2, fontWeight: 700, cursor: "pointer", fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ship to Site</button>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

        {activeTab === "resources" && (
          <div className="fade-in-panel stagger-2">
          {/* 1. Global Resource Readiness Header (Oracle ROLLUP) */}
          <div style={{ marginBottom: 32, background: PALETTE.primary, padding: 32, borderRadius: 4, color: "white", position: 'relative', overflow: 'hidden' }}>
            <div className="noise-overlay" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
            <h3 style={{ marginBottom: 16, color: "white", position: 'relative' }}>Global Resource Readiness</h3>
            <div style={{ display: "flex", gap: 48, alignItems: "center", position: 'relative' }}>
              <div>
                <div style={{ fontSize: 40, fontWeight: 700, fontFamily: 'var(--font-heading)' }}>
                  {resources.reduce((acc, curr) => acc + curr.current, 0)} 
                  <span className="metadata" style={{ fontSize: 16, opacity: 0.7, marginLeft: 12 }}>Total Units</span>
                </div>
                <div className="metadata" style={{ fontSize: 10, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Calculated via Server-Side Rollup</div>
              </div>
              {/* Visual Gauge */}
              <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.15)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ 
                  width: `${(resources.reduce((acc, curr) => acc + curr.current, 0) / resources.reduce((acc, curr) => acc + curr.max, 0)) * 100}%`, 
                  height: "100%", 
                  background: PALETTE.accent,
                  transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)" 
                }} />
              </div>
            </div>
          </div>
          
          {/* 2. Individual Resource Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {resources.map(res => {
              const adjustment = editedResources[res.name] || 0;
              const displayValue = Math.max(0, Math.min(res.max, res.current + adjustment));
              const pct = (displayValue / res.max) * 100;
              const isCritical = displayValue <= res.critical;
              
              return (
                <div key={res.name} className="output-line" style={{ 
                  background: "white", 
                  padding: 24, 
                  borderRadius: 4, 
                  border: isCritical ? `1px solid #C0392B` : `1px solid ${PALETTE.secondary}1A`, 
                  color: PALETTE.textDark,
                  borderBottom: `2px solid ${isCritical ? '#C0392B' : PALETTE.secondary}33`
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, color: PALETTE.primary, fontFamily: 'var(--font-heading)', fontSize: 16 }}>{res.name}</div>
                    <div className="metadata" style={{ fontSize: 10, color: PALETTE.textMuted, textTransform: 'uppercase' }}>{res.unit}</div>
                  </div>
               
                  <div style={{ fontSize: 32, margin: "16px 0", fontWeight: 700, fontFamily: 'var(--font-body)', color: isCritical ? '#C0392B' : PALETTE.textDark }}>
                    {displayValue} <span style={{ fontSize: 14, color: PALETTE.textMuted, fontWeight: 400 }}>/ {res.max}</span>
                  </div>
                  
                  <div style={{ height: 6, background: PALETTE.surface, borderRadius: 3, marginBottom: 24, overflow: "hidden" }}>
                    <div style={{ 
                      width: `${pct}%`, 
                      height: "100%", 
                      background: isCritical ? "#C0392B" : PALETTE.secondary, 
                      transition: "width 0.5s ease" 
                    }} />
                  </div>
                  
                  {isAdmin && (
                    <div style={{ borderTop: `1px solid ${PALETTE.surface}`, paddingTop: 20 }}>
                      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                        <button onClick={() => handleAdjust(res.name, -1)} style={{ flex: 1, padding: "8px", borderRadius: 2, border: `1px solid ${PALETTE.secondary}`, background: "white", fontSize: 18, fontWeight: "700", cursor: "pointer", color: PALETTE.primary }}>−</button>
                        <button onClick={() => handleAdjust(res.name, 1)} style={{ flex: 1, padding: "8px", borderRadius: 2, border: `1px solid ${PALETTE.secondary}`, background: "white", fontSize: 18, fontWeight: "700", cursor: "pointer", color: PALETTE.primary }}>+</button>
                      </div>
                      {adjustment !== 0 && (
                        <button onClick={() => saveResource(res.name)} className="shake" style={{ width: "100%", padding: "12px", background: PALETTE.primary, color: "white", border: "none", borderRadius: 2, fontWeight: 700, cursor: "pointer", fontFamily: 'var(--font-body)', fontSize: 11, textTransform: 'uppercase' }}>
                          💾 Save to Database
                        </button>
                      )}
                      </div>
                    )}
                    </div>
                  );
                })}
              </div>
          </div>
        )}

        {activeTab === "predict" && (
            <div className="fade-in-panel stagger-2">
              {/* Admin Control Panel for AI and Database Logic */}
              {isAdmin && (
                <div style={{ marginBottom: 32, background: "white", padding: 32, borderRadius: 4, display: "flex", justifyContent: "space-between", alignItems: "center", color: PALETTE.textDark, border: `1px solid ${PALETTE.secondary}1A` }}>
                  <div>
                    <h3 style={{ color: PALETTE.primary, marginBottom: 8 }}>AI Engine & Automation</h3>
                    <p className="metadata" style={{ fontSize: 12, color: PALETTE.textMuted }}>Refresh predictions and execute backend matching logic.</p>
                  </div>
        
                <div style={{ display: "flex", gap: "16px" }}>
                  <button 
                    onClick={runPrediction} 
                    disabled={isPredicting} 
                    style={{ 
                      padding: "12px 24px", 
                      background: PALETTE.primary, 
                      color: "white", 
                      border: "none", 
                      borderRadius: 2, 
                      fontWeight: 700,
                      cursor: isPredicting ? "not-allowed" : "pointer",
                      fontFamily: 'var(--font-body)',
                      fontSize: 12,
                      textTransform: 'uppercase'
                    }}
                  >
                    {isPredicting ? (
                      <div className="loading-dots">
                        <span></span><span></span><span></span>
                      </div>
                    ) : "🚀 Run AI Engine"}
                  </button>
                </div>
              </div>
            )}
            {/* Prediction Display Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
              {predictions.map((pred, i) => (
                <div key={pred.id} className={`output-line stagger-${(i % 4) + 1}`} style={{ 
                  background: "white", 
                  padding: 24, 
                  borderRadius: 4, 
                  borderLeft: `4px solid ${SEVERITY_COLORS[pred.severity] || PALETTE.secondary}`, 
                  color: PALETTE.textDark,
                  borderBottom: `1px solid ${PALETTE.secondary}1A`
                }}>
                  <div style={{ fontWeight: 700, color: PALETTE.primary, fontSize: 18, fontFamily: 'var(--font-heading)', marginBottom: 8 }}>{pred.type}</div>
                  <div style={{ fontSize: 24, color: PALETTE.secondary, margin: "8px 0", fontFamily: 'var(--font-body)', fontWeight: 700 }}>{pred.confidence}% Match</div>
                  <div className="metadata" style={{ fontSize: 12, color: PALETTE.textMuted }}><strong>Location:</strong> <span style={{ color: PALETTE.textDark }}>{pred.location}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === "audit" && isAdmin && (
          <div className="fade-in-panel stagger-2" style={{ background: "white", borderRadius: 4, padding: 32, color: PALETTE.textDark, border: `1px solid ${PALETTE.secondary}1A` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <div>
                <h3 style={{ margin: 0, color: PALETTE.primary }}>Commander Action Logs</h3>
                <p className="metadata" style={{ fontSize: 11, color: PALETTE.textMuted, marginTop: 4 }}>OFFICIAL SYSTEM LOGS RETRIEVED FROM USER_AUDIT_TRAIL</p>
              </div>
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_BASE}/reports/generate`);
                    if(res.ok) alert("Report generated in C:\\ocrl_databas");
                  } catch (err) { console.error("Export Error:", err);alert("Export failed"); }
                }}
                style={{ 
                  background: PALETTE.secondary, 
                  color: "white", 
                  border: "none", 
                  padding: "12px 24px", 
                  borderRadius: 2, 
                  cursor: "pointer", 
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontFamily: 'var(--font-body)',
                  fontSize: 11,
                  textTransform: 'uppercase'
                }}
              >
                📄 Export Briefing
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: 'var(--font-body)' }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: `2px solid ${PALETTE.surface}`, color: PALETTE.textMuted }}>
                  <th style={{ padding: "12px 16px", fontWeight: 700 }}>TIMESTAMP</th>
                  <th style={{ padding: "12px 16px", fontWeight: 700 }}>COMMANDER</th>
                  <th style={{ padding: "12px 16px", fontWeight: 700 }}>ACTION</th>
                  <th style={{ padding: "12px 16px", fontWeight: 700 }}>OBJECT</th>
                  <th style={{ padding: "12px 16px", fontWeight: 700 }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
              {auditLogs.map((log, index) => (
                <tr key={log.id || index} className="output-line" style={{ borderBottom: `1px solid ${PALETTE.surface}`, animationDelay: `${index * 30}ms` }}>
                  <td className="metadata" style={{ padding: "12px 16px", fontSize: 11 }}>{log.timestamp}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: PALETTE.primary }}>{log.username}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ 
                      color: log.action === 'DELETE' ? "#C0392B" : 
                             log.action === 'INSERT' ? PALETTE.secondary : PALETTE.primary,
                      fontWeight: 700,
                      fontSize: 11
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>{log.object}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className="metadata" style={{ background: `${PALETTE.secondary}1A`, color: PALETTE.secondary, padding: "4px 8px", borderRadius: 2, fontSize: 10, fontWeight: 700 }}>SUCCESS</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>)}
      </main>

      {showLogin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(13, 43, 37, 0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="fade-in-panel stagger-1" style={{ background: "white", padding: 40, borderRadius: 4, width: 400, color: PALETTE.textDark, border: `1px solid ${PALETTE.secondary}4D`, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h2 style={{ marginBottom: 24, color: PALETTE.primary, textAlign: 'center' }}>Admin Access</h2>
            <div style={{ marginBottom: 20 }}>
              <label className="metadata" style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 8, color: PALETTE.textMuted }}>USERNAME</label>
              <input id="admin-user" placeholder="Enter commander ID" style={{ width: "100%", padding: 14, borderRadius: 2 }} />
            </div>
            <div style={{ marginBottom: 32 }}>
              <label className="metadata" style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 8, color: PALETTE.textMuted }}>PASSWORD</label>
              <input id="admin-pass" type="password" placeholder="••••••••" style={{ width: "100%", padding: 14, borderRadius: 2 }} />
            </div>
            <button onClick={handleLogin} style={{ width: "100%", padding: 14, background: PALETTE.primary, color: "white", border: "none", borderRadius: 2, fontWeight: 700, fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Authenticate</button>
            <button onClick={() => setShowLogin(false)} style={{ padding: 12, background: "none", color: PALETTE.textMuted, border: "none", marginTop: 16, cursor: 'pointer', textDecoration: 'underline', width: '100%', fontSize: 11, fontFamily: 'var(--font-body)' }}>Abort</button>
          </div>
        </div>
      )}
    </div>
  );
}
