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
  cream: "#F2EFE7",
  seafoam: "#9ACBD0",
  teal: "#48A6A7",
  navy: "#2973B2",
};

const SEVERITY_COLORS = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
};

const STATUS_COLORS = {
  active: "#ef4444",
  contained: "#22c55e",
  monitoring: "#eab308",
  deployed: "#2973B2",
  available: "#48A6A7",
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
    <div style={{ borderRadius: 16, overflow: "hidden", height: "calc(100vh - 300px)", minHeight: 450, border: `2px solid ${PALETTE.seafoam}`, position: 'relative' }}>
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
              <strong>🚨 {inc.type} (LIVE)</strong><br />
              {inc.location}<br />
              Severity: {inc.severity}
            </Popup>
          </Marker>
        ))}

        {predictions && predictions.filter(pred => pred.lat && pred.lng).map(pred => (
          <CircleMarker
            key={`pred-${pred.id}`}
            center={[pred.lat, pred.lng]}
            radius={12}
            pathOptions={{
              color: SEVERITY_COLORS[pred.severity] || "#48A6A7",
              fillColor: SEVERITY_COLORS[pred.severity] || "#48A6A7",
              fillOpacity: 0.4,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <strong>🤖 AI PREDICTION</strong><br />
              Type: {pred.type}<br />
              Confidence: {pred.confidence}%<br />
              ETA: {pred.timeframe}<br />
              Loc: {pred.location}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      
      <div style={{ position: 'absolute', bottom: 20, left: 20, background: 'white', padding: 10, borderRadius: 8, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.2)', fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, color: 'black' }}>
           <img src={markerIcon} style={{ width: 12 }} /> <strong>Live Incidents</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'black' }}>
           <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px dashed #48A6A7', background: 'rgba(72, 166, 167, 0.3)' }} /> <strong>AI Predictions</strong>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{
      background: "white", borderRadius: 16, padding: "20px 24px",
      borderLeft: `4px solid ${accent}`, boxShadow: "0 2px 12px rgba(41,115,178,0.08)",
      display: "flex", alignItems: "center", gap: 16, minWidth: 0,
    }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: PALETTE.navy, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: PALETTE.teal, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function IncidentRow({ inc, onClick, selected }) {
  return (
    <div onClick={() => onClick(inc)} style={{
      padding: "14px 18px", borderRadius: 12, cursor: "pointer",
      background: selected ? `${PALETTE.seafoam}22` : "white",
      border: selected ? `1.5px solid ${PALETTE.teal}` : "1.5px solid #e8e8e8",
      marginBottom: 8, transition: "all 0.2s",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: "50%",
        background: SEVERITY_COLORS[inc.severity] || "#888",
        boxShadow: `0 0 0 3px ${SEVERITY_COLORS[inc.severity] || "#888"}33`,
        flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: PALETTE.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {inc.type}
        </div>
        <div style={{ fontSize: 12, color: "#777" }}>{inc.location} · {inc.time}</div>
      </div>
      <div style={{
        fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5,
        padding: "3px 8px", borderRadius: 20,
        background: `${STATUS_COLORS[inc.status]}22`,
        color: STATUS_COLORS[inc.status],
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
      setConnectionError(null);
    } catch (err) {
      setConnectionError(err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

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

  const clearAllVolunteers = async () => {
    if (!window.confirm("Clear All?")) return;
    try {
      const res = await fetch(`${API_BASE}/volunteers/clear`, { method: "POST" });
      if (res.ok) await fetchData();
    } catch (err) {
      alert("Error: " + err.message);
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

  const criticalResources = resources.filter(r => r.current <= r.critical).length;
  const activeIncidents = incidents.filter(i => i.status === 'active').length;
  const deployedCount = volunteers.filter(v => v.status?.toLowerCase() === 'deployed').length;

  const tabs = [
    { id: "dashboard", label: "Command", icon: "⚡" },
    { id: "incidents", label: "Incidents", icon: "🚨" },
    { id: "volunteers", label: "Volunteers", icon: "👥" },
    { id: "resources", label: "Resources", icon: "📦" },
    { id: "predict", label: "AI Predict", icon: "🤖" },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: PALETTE.cream, minHeight: "100vh", width: "100vw", color: "black" }}>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.3} 50%{transform:scale(1.5);opacity:0} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, button { color: black !important; }
      `}</style>

      <header style={{ background: PALETTE.navy, color: "white", padding: "12px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 24 }}>🛡</span>
          <h1 style={{ fontSize: 18 }}>DEMS Command Center</h1>
          {connectionError && <span style={{ background: "#ef4444", padding: "4px 8px", borderRadius: 4, fontSize: 11 }}>Offline: {connectionError}</span>}
        </div>
        <div>
          {isAdmin ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: 4 }}>ADMIN MODE</span>
              <button onClick={() => setIsAdmin(false)} style={{ background: "none", border: "1px solid white", color: "white", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>Logout</button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid white", color: "white", padding: "6px 12px", borderRadius: 8, cursor: "pointer" }}>🔐 Admin Login</button>
          )}
        </div>
      </header>

      <nav style={{ background: "white", padding: "0 28px", display: "flex", gap: 20, borderBottom: "1px solid #ddd" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "16px 0", border: "none", background: "none", cursor: "pointer", borderBottom: activeTab === t.id ? `3px solid ${PALETTE.teal}` : "none", color: activeTab === t.id ? PALETTE.teal : "#666", fontWeight: activeTab === t.id ? 700 : 500 }}>
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      <main style={{ padding: 28 }}>
        {activeTab === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 28 }}>
              <StatCard label="Active Incidents" value={activeIncidents} accent="#ef4444" icon="🚨" />
              <StatCard label="Resources Critical" value={criticalResources} accent="#f97316" icon="📦" />
              <StatCard label="Volunteers Live" value={volunteers.length} accent={PALETTE.teal} icon="👥" />
              <StatCard label="Deployed" value={deployedCount} accent={PALETTE.navy} icon="🚢" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 28 }}>
              <IncidentMap selected={selectedIncident} incidents={incidents} predictions={predictions} onSelect={setSelectedIncident} />
              <div style={{ background: "white", padding: 20, borderRadius: 16, height: "calc(100vh - 300px)", minHeight: 450, overflowY: "auto" }}>
                <h3 style={{ marginBottom: 16, color: "black" }}>Live Incident Feed</h3>
                {incidents.slice(0, 50).map(inc => (
                  <IncidentRow key={inc.id} inc={inc} onClick={setSelectedIncident} selected={selectedIncident?.id === inc.id} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "incidents" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 20 }}>
            {incidents.map(inc => (
              <div key={inc.id} style={{ background: "white", padding: 20, borderRadius: 16, borderLeft: `5px solid ${SEVERITY_COLORS[inc.severity] || "#888"}`, color: "black" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <h4 style={{ color: PALETTE.navy }}>{inc.type}</h4>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: `${STATUS_COLORS[inc.status]}22`, color: STATUS_COLORS[inc.status], fontWeight: 700 }}>{inc.status.toUpperCase()}</span>
                </div>
                <p style={{ fontSize: 13, margin: "8px 0" }}><strong>Location:</strong> {inc.location}</p>
                <div style={{ display: "flex", gap: 15, fontSize: 12 }}>
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
              <div style={{ background: "white", padding: 25, borderRadius: 16, marginBottom: 28, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", color: "black" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                  <h3 style={{ color: PALETTE.navy, margin: 0 }}>Register New Volunteer</h3>
                  <button onClick={clearAllVolunteers} style={{ padding: "8px 15px", background: "none", color: "#ef4444", border: "1px solid #ef4444", borderRadius: 8, fontSize: 11, cursor: "pointer", fontWeight: 700 }}>🗑️ CLEAR DATABASE</button>
                </div>
                <form onSubmit={addVolunteer} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 15, alignItems: "end" }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 5 }}>Full Name</label>
                    <input value={vForm.name} onChange={e => setVForm({...vForm, name: e.target.value})} placeholder="e.g. John Doe" style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ddd" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 5 }}>Skills</label>
                    <input value={vForm.skills} onChange={e => setVForm({...vForm, skills: e.target.value})} placeholder="e.g. Medical, Rescue" style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ddd" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 5 }}>Distance (e.g. 1.5 km)</label>
                    <input value={vForm.location} onChange={e => setVForm({...vForm, location: e.target.value})} placeholder="e.g. 1.5" style={{ width: "100%", padding: "10px", borderRadius: 8, border: "1px solid #ddd" }} />
                  </div>
                  <button type="submit" style={{ padding: "11px 25px", background: PALETTE.teal, color: "white", border: "none", borderRadius: 8, fontWeight: 700 }}>Add</button>
                </form>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {volunteers.map(vol => {
                const isDeployed = vol.status?.toLowerCase() === 'deployed';
                return (
                  <div key={vol.id} style={{ background: "white", padding: 20, borderRadius: 16, borderLeft: `5px solid ${isDeployed ? PALETTE.navy : PALETTE.teal}`, color: "black", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", gap: 15, alignItems: "center", marginBottom: 15 }}>
                      <div style={{ width: 50, height: 50, borderRadius: "50%", background: isDeployed ? PALETTE.navy : PALETTE.seafoam, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "white", fontSize: 20 }}>{vol.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ color: PALETTE.navy, margin: 0 }}>{vol.name}</h4>
                        <div style={{ 
                          display: "inline-block", 
                          fontSize: 9, 
                          fontWeight: 900, 
                          padding: "2px 8px", 
                          borderRadius: 10, 
                          background: isDeployed ? `${PALETTE.navy}22` : `${PALETTE.teal}22`,
                          color: isDeployed ? PALETTE.navy : PALETTE.teal,
                          textTransform: "uppercase",
                          marginTop: 4
                        }}>
                          {vol.status}
                        </div>
                      </div>
                      {isAdmin && <button onClick={() => deleteVolunteer(vol.id)} style={{ background: "none", border: "none", cursor: "pointer" }}>🗑️</button>}
                    </div>
                    
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 12 }}>
                        📍 {isDeployed ? "At Predicted Site: " : "Current Distance: "} <strong>{vol.location}</strong>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 15 }}>
                      {vol.skills.map((s, idx) => <span key={idx} style={{ fontSize: 10, background: "#f0f0f0", padding: "3px 8px", borderRadius: 4, color: "#666", fontWeight: 600 }}>{s}</span>)}
                    </div>

                    {isAdmin && !isDeployed && (
                      <div>
                          {deployingId === vol.id ? (
                            <div style={{ background: "#f9f9f9", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}>
                                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>SELECT PREDICTED SITE:</div>
                                {predictions.length === 0 ? <div style={{ fontSize: 11 }}>No sites found. Run AI first.</div> : (
                                    <div style={{ maxHeight: 150, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
                                        {predictions.map(p => (
                                            <button key={p.id} onClick={() => deployVolunteer(vol.id, p.location)} style={{ textAlign: "left", padding: "10px", borderRadius: 6, border: "2px solid #000", background: "white", fontSize: 12, cursor: "pointer", fontWeight: "700" }}>📍 {p.type} @ {p.location}</button>
                                        ))}
                                    </div>
                                )}
                                <button onClick={() => setDeployingId(null)} style={{ width: "100%", marginTop: 8, background: "none", border: "none", fontSize: 10, color: "#666", cursor: "pointer", textDecoration: "underline" }}>Cancel</button>
                            </div>
                        ) : <button onClick={() => setDeployingId(vol.id)} style={{ width: "100%", padding: "10px", background: PALETTE.navy, color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>🚢 DEPLOY</button>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

        {activeTab === "resources" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {resources.map(res => {
                const adjustment = editedResources[res.name] || 0;
                const displayValue = Math.max(0, Math.min(res.max, res.current + adjustment));
                const pct = (displayValue / res.max) * 100;
                return (
                  <div key={res.name} style={{ background: "white", padding: 20, borderRadius: 16, border: displayValue <= res.critical ? "2px solid #ef4444" : "1px solid #eee", color: "black" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 700, color: PALETTE.navy }}>{res.name}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{res.unit.toUpperCase()}</div>
                    </div>
                    <div style={{ fontSize: 32, margin: "15px 0", fontWeight: 800 }}>{displayValue} <span style={{ fontSize: 16, color: "#aaa" }}>/ {res.max}</span></div>
                    <div style={{ height: 10, background: "#f0f0f0", borderRadius: 5, marginBottom: 20, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: pct < 20 ? "#ef4444" : PALETTE.teal, transition: "width 0.3s" }} />
                    </div>
                    {isAdmin && (
                      <div style={{ borderTop: "1px solid #eee", paddingTop: 15 }}>
                        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                          <button onClick={() => handleAdjust(res.name, -1)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "2px solid #000", background: "white", fontSize: 20, fontWeight: "900" }}>−</button>
                          <button onClick={() => handleAdjust(res.name, 1)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "2px solid #000", background: "white", fontSize: 20, fontWeight: "900" }}>+</button>
                        </div>
                        {adjustment !== 0 && <button onClick={() => saveResource(res.name)} style={{ width: "100%", padding: "12px", background: PALETTE.navy, color: "white", border: "none", borderRadius: 8, fontWeight: 700 }}>💾 SAVE TO ORACLE</button>}
                      </div>
                    )}
                  </div>
                );
            })}
          </div>
        )}

        {activeTab === "predict" && (
            <div>
                {isAdmin && (
                  <div style={{ marginBottom: 20, background: "white", padding: 20, borderRadius: 16, display: "flex", justifyContent: "space-between", alignItems: "center", color: "black" }}>
                    <div><h4 style={{ color: PALETTE.navy }}>AI Engine</h4><p style={{ fontSize: 12 }}>Refresh predictions based on latest data.</p></div>
                    <button onClick={runPrediction} disabled={isPredicting} style={{ padding: "10px 20px", background: PALETTE.teal, color: "white", border: "none", borderRadius: 8, fontWeight: 700 }}>{isPredicting ? "Processing..." : "🚀 Run AI Engine"}</button>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
                    {predictions.map(pred => (
                        <div key={pred.id} style={{ background: "white", padding: 20, borderRadius: 16, borderLeft: `5px solid ${SEVERITY_COLORS[pred.severity] || PALETTE.teal}`, color: "black" }}>
                            <div style={{ fontWeight: 800, color: PALETTE.navy, fontSize: 18 }}>{pred.type}</div>
                            <div style={{ fontSize: 22, color: PALETTE.teal, margin: "5px 0" }}>{pred.confidence}% Match</div>
                            <div style={{ fontSize: 13 }}><strong>Location:</strong> {pred.location}</div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>

      {showLogin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "white", padding: 32, borderRadius: 16, width: 350, color: "black" }}>
            <h2 style={{ marginBottom: 20 }}>Admin Login</h2>
            <input id="admin-user" placeholder="Username" style={{ width: "100%", padding: 12, marginBottom: 12, borderRadius: 8, border: "1px solid #ddd" }} />
            <input id="admin-pass" type="password" placeholder="Password" style={{ width: "100%", padding: 12, marginBottom: 20, borderRadius: 8, border: "1px solid #ddd" }} />
            <button onClick={handleLogin} style={{ width: "100%", padding: 12, background: PALETTE.teal, color: "white", border: "none", borderRadius: 8, fontWeight: 700 }}>Login</button>
            <button onClick={() => setShowLogin(false)} style={{ width: "100%", padding: 12, background: "none", color: "#666", border: "none", marginTop: 8 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
