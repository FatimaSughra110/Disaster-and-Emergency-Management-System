import { useState, useEffect } from "react";
import DEMSAdmin from './admin_portal.jsx'

const API_BASE = "http://localhost:5000/api";

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
  deployed: PALETTE.navy,
  available: PALETTE.teal,
};


function PulseRing({ color }) {
  return (
    <span style={{ position: "relative", display: "inline-block", width: 10, height: 10 }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%", background: color, opacity: 0.3,
        animation: "pulse 2s ease-out infinite", transform: "scale(1)"
      }} />
      <span style={{ position: "absolute", inset: 2, borderRadius: "50%", background: color }} />
    </span>
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
        background: SEVERITY_COLORS[inc.severity],
        boxShadow: `0 0 0 3px ${SEVERITY_COLORS[inc.severity]}33`,
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

function ResourceBar({ res }) {
  const pct = (res.current / res.max) * 100;
  const isCritical = res.current <= res.critical;
  const color = isCritical ? "#ef4444" : pct < 40 ? "#f97316" : PALETTE.teal;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: PALETTE.navy }}>{res.name}</span>
        <span style={{ fontSize: 12, color: isCritical ? "#ef4444" : "#666" }}>
          {isCritical && "⚠ "}{res.current} / {res.max} {res.unit}
        </span>
      </div>
      <div style={{ background: "#eee", borderRadius: 8, height: 7, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 8, width: `${pct}%`,
          background: color, transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

function PredictionCard({ pred }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${PALETTE.navy}08, ${PALETTE.teal}12)`,
      border: `1.5px solid ${SEVERITY_COLORS[pred.severity]}44`,
      borderRadius: 14, padding: "16px 18px", marginBottom: 10,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: 4,
        background: SEVERITY_COLORS[pred.severity],
      }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontWeight: 800, fontSize: 14, color: PALETTE.navy }}>{pred.type}</span>
        <span style={{
          fontSize: 13, fontWeight: 800,
          color: pred.confidence > 80 ? "#ef4444" : pred.confidence > 65 ? "#f97316" : PALETTE.teal,
        }}>
          {pred.confidence}% confidence
        </span>
      </div>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
        📍 {pred.location} · ⏱ ETA {pred.timeframe}
      </div>
      <div style={{
        fontSize: 11, background: `${PALETTE.seafoam}55`, borderRadius: 6,
        padding: "3px 8px", display: "inline-block", color: PALETTE.navy, fontWeight: 600,
      }}>
        {pred.conditions}
      </div>
    </div>
  );
}

function VolunteerCard({ vol }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      background: "white", borderRadius: 12, padding: "12px 14px",
      marginBottom: 8, border: "1.5px solid #e8e8e8",
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
        background: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.navy})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontWeight: 800, fontSize: 12,
      }}>{vol.avatar}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: PALETTE.navy }}>{vol.name}</div>
        <div style={{ fontSize: 11, color: "#888" }}>{vol.skills.join(" · ")}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase",
          color: STATUS_COLORS[vol.status],
          background: `${STATUS_COLORS[vol.status]}18`,
          padding: "2px 7px", borderRadius: 20, marginBottom: 2,
        }}>{vol.status}</div>
        <div style={{ fontSize: 10, color: "#aaa" }}>{vol.location}</div>
      </div>
    </div>
  );
}

// Minimal SVG map mock
function IncidentMap({ selected, onSelect, incidents }) {
  // Use first 5 active incidents for the mock map points
  const displayIncidents = incidents.filter(i => i.status === 'active').slice(0, 5);
  const mapPoints = [
    { x: 210, y: 90 },
    { x: 300, y: 180 },
    { x: 390, y: 130 },
    { x: 260, y: 270 },
    { x: 170, y: 240 },
  ];

  return (
    <div style={{ position: "relative", background: `linear-gradient(160deg, ${PALETTE.seafoam}30, ${PALETTE.cream})`, borderRadius: 16, overflow: "hidden", height: 320 }}>
      {/* Grid lines */}
      <svg style={{ position: "absolute", inset: 0 }} width="100%" height="100%">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={`${PALETTE.teal}22`} strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        {/* Road lines */}
        <line x1="0" y1="160" x2="580" y2="160" stroke={`${PALETTE.teal}33`} strokeWidth="2" strokeDasharray="8,6" />
        <line x1="290" y1="0" x2="290" y2="320" stroke={`${PALETTE.teal}33`} strokeWidth="2" strokeDasharray="8,6" />
        <line x1="100" y1="80" x2="480" y2="280" stroke={`${PALETTE.teal}22`} strokeWidth="1.5" strokeDasharray="5,8" />
        {/* Cluster radius for North */}
        <circle cx="210" cy="90" r="45" fill={`${PALETTE.seafoam}30`} stroke={`${PALETTE.teal}55`} strokeWidth="1.5" strokeDasharray="4,4" />
        {/* Map labels */}
        <text x="30" y="50" fill={`${PALETTE.navy}55`} fontSize="10" fontWeight="600">North District</text>
        <text x="350" y="50" fill={`${PALETTE.navy}55`} fontSize="10" fontWeight="600">East Sector</text>
        <text x="100" y="300" fill={`${PALETTE.navy}55`} fontSize="10" fontWeight="600">South Bridge</text>
        <text x="370" y="300" fill={`${PALETTE.navy}55`} fontSize="10" fontWeight="600">Industrial Park</text>
        
        {/* Incident points */}
        {displayIncidents.map((inc, idx) => {
          const pt = mapPoints[idx % mapPoints.length];
          return (
            <g key={inc.id} onClick={() => onSelect(inc)} style={{ cursor: "pointer" }}>
              <circle cx={pt.x} cy={pt.y} r="18" fill={`${SEVERITY_COLORS[inc.severity]}22`}
                stroke={SEVERITY_COLORS[inc.severity]} strokeWidth={selected?.id === inc.id ? 2.5 : 1.5} />
              <circle cx={pt.x} cy={pt.y} r="8" fill={SEVERITY_COLORS[inc.severity]}
                opacity={selected?.id === inc.id ? 1 : 0.8} />
              <text x={pt.x} y={pt.y + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="800">{idx + 1}</text>
            </g>
          );
        })}

        {/* Volunteer markers */}
        <circle cx="240" cy="115" r="5" fill={PALETTE.navy} opacity="0.6" />
        <circle cx="295" cy="155" r="5" fill={PALETTE.navy} opacity="0.6" />
        <circle cx="330" cy="200" r="5" fill={PALETTE.navy} opacity="0.6" />
      </svg>
      {/* Legend */}
      <div style={{
        position: "absolute", bottom: 12, right: 12, background: "white",
        borderRadius: 10, padding: "8px 12px", fontSize: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}>
        {["critical","high","medium"].map(s => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: SEVERITY_COLORS[s] }} />
            <span style={{ textTransform: "capitalize", color: "#555" }}>{s}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 6, borderTop: "1px solid #eee", paddingTop: 3, marginTop: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: PALETTE.navy }} />
          <span style={{ color: "#555" }}>Volunteer</span>
        </div>
      </div>
      {/* Leaflet badge */}
      <div style={{
        position: "absolute", top: 12, right: 12, background: `${PALETTE.navy}ee`,
        color: "white", fontSize: 9, fontWeight: 700, padding: "3px 8px",
        borderRadius: 20, letterSpacing: 0.5,
      }}>LEAFLET.JS CLUSTER VIEW</div>
    </div>
  );
}

export default function DEMS() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  
  const [incidents, setIncidents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [resources, setResources] = useState([]);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incRes, volRes, resRes, predRes] = await Promise.all([
          fetch(`${API_BASE}/incidents`),
          fetch(`${API_BASE}/volunteers`),
          fetch(`${API_BASE}/resources`),
          fetch(`${API_BASE}/predictions`)
        ]);
        
        const [incData, volData, resData, predData] = await Promise.all([
          incRes.json(), volRes.json(), resRes.json(), predRes.json()
        ]);
        
        setIncidents(incData);
        setVolunteers(volData);
        setResources(resData);
        setPredictions(predData);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const criticalResources = resources.filter(r => r.current <= r.critical).length;
  const activeIncidents = incidents.filter(i => i.status === "active").length;
  const availableVols = volunteers.filter(v => v.status === "available").length;

  const tabs = [
    { id: "dashboard", label: "Command", icon: "⚡" },
    { id: "incidents", label: "Incidents", icon: "🚨" },
    { id: "volunteers", label: "Volunteers", icon: "👥" },
    { id: "resources", label: "Resources", icon: "📦" },
    { id: "predict", label: "AI Predict", icon: "🤖" },
    ...(isAdmin ? [{ id: "admin", label: "Admin", icon: "🛠" }] : [])

  ];

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
      if (data.success) {
        setIsAdmin(true);
        setShowLogin(false);
      } else {
        alert("Wrong credentials");
      }
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', 'SF Pro Display', system-ui, sans-serif", background: PALETTE.cream, minHeight: "100vh", color: "#1a1a2e" }}>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.3} 50%{transform:scale(2.2);opacity:0} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes slideIn { from{transform:translateY(-10px);opacity:0} to{transform:translateY(0);opacity:1} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: ${PALETTE.seafoam}; border-radius: 10px; }
      `}</style>

      {/* Top Alert Banner */}
      {!alertDismissed && (
        <div style={{
          background: `linear-gradient(90deg, #ef4444, #dc2626)`, color: "white",
          padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
          animation: "slideIn 0.3s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ animation: "blink 1s infinite", fontSize: 16 }}>⚠</span>
            <strong style={{ fontSize: 13 }}>CRITICAL ALERT:</strong>
            <span style={{ fontSize: 13 }}>AI predicts Flash Flood in North Corridor within 2h 40m — 87% confidence. Immediate resource deployment recommended.</span>
          </div>
          <button onClick={() => setAlertDismissed(true)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* Header */}
      <header style={{
        background: `linear-gradient(135deg, ${PALETTE.navy} 0%, #1a4d80 100%)`,
        color: "white", padding: "0 28px", height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 4px 20px rgba(41,115,178,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.seafoam})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          }}>🛡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: 0.5 }}>Disaster & Emergency Management System</div>
            <div style={{ fontSize: 10, opacity: 0.7, letterSpacing: 1, textTransform: "uppercase" }}>DEMS</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* 🔐 Admin Button */}
              <button onClick={() => setShowLogin(true)} style={{
                background: "#ffffff22",
                border: "1px solid #ffffff55",
                color: "white",
                padding: "6px 12px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 12
              }}>
                🔐 Admin
              </button>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: `${PALETTE.teal}33`, borderRadius: 20, padding: "6px 14px" }}>
            <PulseRing color="#22c55e" />
            <span style={{ fontSize: 12, fontWeight: 600 }}>LIVE</span>
          </div>
        </div>
      </header>
      {showLogin && (
        <div style={{position: "fixed",inset: 0,background: "rgba(0,0,0,0.5)",
          display: "flex",alignItems: "center",justifyContent: "center",zIndex: 999
        }}>
          <div style={{
            background: "white",
            padding: 24,
            borderRadius: 12,
            width: 300
          }}>
            <h3 style={{ marginBottom: 16 }}>Admin Login</h3>
            <input
            placeholder="Username"
            id="admin-user"
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
            />
            <input 
            placeholder="Password"
            type="password"
            id="admin-pass"
            style={{ width: "100%", padding: 8, marginBottom: 16 }}
            />
            
            <button
            onClick={handleLogin}
            style={{ width: "100%", padding: 10,  background: "#48A6A7" }}
            >
              Login
              </button>
              
              <button onClick={() => setShowLogin(false)} style={{
                marginTop: 10,
                width: "100%",
                background: "#2973B2",
                padding: 8
                }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

      {/* Nav */}
      <nav style={{
        background: "white", borderBottom: `2px solid ${PALETTE.seafoam}44`,
        padding: "0 28px", display: "flex", gap: 4,
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            padding: "14px 20px", border: "none", background: "none", cursor: "pointer",
            fontWeight: activeTab === t.id ? 700 : 500,
            color: activeTab === t.id ? PALETTE.navy : "#888",
            borderBottom: activeTab === t.id ? `3px solid ${PALETTE.teal}` : "3px solid transparent",
            fontSize: 13, display: "flex", alignItems: "center", gap: 6,
            transition: "all 0.2s",
          }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ padding: "24px 28px", maxWidth: 1400, margin: "0 auto" }}>

        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            {/* Stat Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
              <StatCard label="Active Incidents" value={activeIncidents} sub="Requiring response" accent="#ef4444" icon="🚨" />
              <StatCard label="Volunteers On-Call" value={volunteers.length} sub={`${availableVols} available now`} accent={PALETTE.teal} icon="👥" />
              <StatCard label="Critical Alerts" value={criticalResources} sub="Resource shortages" accent="#f97316" icon="⚠️" />
              <StatCard label="AI Predictions" value={predictions.length} sub="Active threat models" accent={PALETTE.navy} icon="🤖" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
              {/* Left: Map + Incidents */}
              <div>
                <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: PALETTE.navy }}>📍 Live Incident Map</h2>
                  <span style={{ fontSize: 11, color: PALETTE.teal, fontWeight: 600 }}>Click markers to inspect</span>
                </div>
                <IncidentMap selected={selectedIncident} onSelect={setSelectedIncident} incidents={incidents} />

                {selectedIncident && (
                  <div style={{
                    marginTop: 16, background: "white", borderRadius: 14,
                    padding: "18px 20px", border: `2px solid ${SEVERITY_COLORS[selectedIncident.severity]}66`,
                    animation: "slideIn 0.2s ease",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: PALETTE.navy }}>{selectedIncident.type}</div>
                        <div style={{ color: "#777", fontSize: 13, marginTop: 2 }}>
                          📍 {selectedIncident.location} · 🕐 {selectedIncident.time}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{
                          padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                          textTransform: "uppercase", background: `${SEVERITY_COLORS[selectedIncident.severity]}22`,
                          color: SEVERITY_COLORS[selectedIncident.severity],
                        }}>{selectedIncident.severity}</span>
                        <button onClick={() => setSelectedIncident(null)} style={{
                          background: "#f5f5f5", border: "none", borderRadius: 8, width: 28, height: 28,
                          cursor: "pointer", color: "#888", fontSize: 14,
                        }}>×</button>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: PALETTE.navy }}>{selectedIncident.resources}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>Resources</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: PALETTE.teal }}>{selectedIncident.volunteers}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>Volunteers</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: STATUS_COLORS[selectedIncident.status], textTransform: "capitalize" }}>{selectedIncident.status}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>Status</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Predictions + Quick Volunteers */}
              <div>
                <div style={{ marginBottom: 12 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: PALETTE.navy, marginBottom: 12 }}>🤖 AI Escalation Predictions</h2>
                  <div style={{ fontSize: 10, color: "#888", marginBottom: 12, lineHeight: 1.5 }}>
                    Random Forest model comparing current variables against historical disaster patterns
                  </div>
                  {predictions.map(p => <PredictionCard key={p.id} pred={p} />)}
                </div>

                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 800, color: PALETTE.navy, marginBottom: 12 }}>👥 Available Volunteers</h2>
                  {volunteers.filter(v => v.status === "available").map(v => (
                    <VolunteerCard key={v.id} vol={v} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INCIDENTS */}
        {activeTab === "incidents" && (
          <div style={{ animation: "slideIn 0.3s ease", display: "grid", gridTemplateColumns: "360px 1fr", gap: 20 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: PALETTE.navy, marginBottom: 16 }}>All Incidents ({incidents.length})</h2>
              {incidents.map(inc => (
                <IncidentRow key={inc.id} inc={inc} onClick={setSelectedIncident} selected={selectedIncident?.id === inc.id} />
              ))}
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: PALETTE.navy, marginBottom: 16 }}>Incident Map</h2>
              <IncidentMap selected={selectedIncident} onSelect={setSelectedIncident} incidents={incidents} />
              {selectedIncident && (
                <div style={{ marginTop: 16, background: "white", borderRadius: 14, padding: 20, border: `2px solid ${SEVERITY_COLORS[selectedIncident.severity]}55` }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: PALETTE.navy, marginBottom: 8 }}>{selectedIncident.type}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[["Location", selectedIncident.location], ["Time", selectedIncident.time], ["Severity", selectedIncident.severity], ["Status", selectedIncident.status], ["Resources", selectedIncident.resources + " units"], ["Volunteers", selectedIncident.volunteers + " personnel"]].map(([k,v]) => (
                      <div key={k}>
                        <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", fontWeight: 600 }}>{k}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: PALETTE.navy, textTransform: "capitalize" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VOLUNTEERS */}
        {activeTab === "volunteers" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: PALETTE.navy }}>Volunteer Registry ({volunteers.length})</h2>
              <div style={{ fontSize: 12, color: "#888" }}>Oracle SQL Package — Registered, Vetted & Coordinated</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))", gap: 16 }}>
              {volunteers.map(vol => (
                <div key={vol.id} style={{
                  background: "white", borderRadius: 16, padding: 20,
                  boxShadow: "0 2px 12px rgba(41,115,178,0.07)",
                  border: `1.5px solid ${vol.status === "available" ? `${PALETTE.teal}44` : "#e8e8e8"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: 14,
                      background: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.navy})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "white", fontWeight: 800, fontSize: 15,
                    }}>{vol.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: PALETTE.navy }}>{vol.name}</div>
                      <div style={{ fontSize: 12, color: "#888" }}>📍 {vol.location} away</div>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                      <div style={{
                        padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: 0.5,
                        background: `${STATUS_COLORS[vol.status]}22`,
                        color: STATUS_COLORS[vol.status],
                      }}>{vol.status}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {vol.skills.map(s => (
                      <span key={s} style={{
                        background: `${PALETTE.seafoam}55`, color: PALETTE.navy,
                        padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESOURCES */}
        {activeTab === "resources" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: PALETTE.navy }}>Resource Monitoring</h2>
              <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>⚠ {criticalResources} critical shortage{criticalResources !== 1 ? "s" : ""}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px,1fr))", gap: 20 }}>
              {resources.map(res => {
                const pct = (res.current / res.max) * 100;
                const isCrit = res.current <= res.critical;
                return (
                  <div key={res.name} style={{
                    background: "white", borderRadius: 16, padding: 20,
                    border: `1.5px solid ${isCrit ? "#ef444433" : "#e8e8e8"}`,
                    boxShadow: isCrit ? "0 0 0 3px #ef444411" : "0 2px 12px rgba(0,0,0,0.05)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: PALETTE.navy }}>{res.name}</div>
                      {isCrit && <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444", background: "#ef444415", padding: "3px 8px", borderRadius: 20 }}>⚠ CRITICAL</span>}
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: isCrit ? "#ef4444" : PALETTE.navy, marginBottom: 8 }}>
                      {res.current}<span style={{ fontSize: 14, fontWeight: 500, color: "#aaa", marginLeft: 4 }}>{res.unit}</span>
                    </div>
                    <div style={{ background: "#eee", borderRadius: 8, height: 8, marginBottom: 8, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 8,
                        width: `${pct}%`,
                        background: isCrit ? "#ef4444" : pct < 40 ? "#f97316" : PALETTE.teal,
                        transition: "width 1s ease",
                      }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa" }}>
                      <span>Critical threshold: {res.critical} {res.unit}</span>
                      <span>{Math.round(pct)}% remaining</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PREDICTIONS */}
        {activeTab === "predict" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: PALETTE.navy, marginBottom: 4 }}>AI Escalation Prediction Engine</h2>
              <div style={{ fontSize: 13, color: "#888" }}>
                Random Forest algorithm — compares current incident variables against historical disaster patterns from the Oracle materialized view
              </div>
            </div>

            {/* Model info */}
            <div style={{
              background: `linear-gradient(135deg, ${PALETTE.navy}, #1a4d80)`,
              borderRadius: 16, padding: 20, color: "white", marginBottom: 24,
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: 16,
            }}>
              {[["Algorithm", "Random Forest"], ["Training Records", "142,880"], ["Feature Variables", "23"], ["Model Accuracy", "91.4%"], ["Last Retrained", "2h ago"], ["Data Source", "Oracle MV"]].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10, opacity: 0.6, textTransform: "uppercase", letterSpacing: 1 }}>{k}</div>
                  <div style={{ fontWeight: 800, fontSize: 15, marginTop: 3 }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {predictions.map(pred => (
                <div key={pred.id} style={{
                  background: "white", borderRadius: 16, padding: 20,
                  border: `2px solid ${SEVERITY_COLORS[pred.severity]}44`,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1,
                      padding: "3px 10px", borderRadius: 20,
                      background: `${SEVERITY_COLORS[pred.severity]}22`,
                      color: SEVERITY_COLORS[pred.severity],
                    }}>{pred.severity}</span>
                    <span style={{ fontSize: 10, color: "#aaa" }}>PREDICTION #{pred.id}</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: PALETTE.navy, marginBottom: 6 }}>{pred.type}</div>
                  <div style={{ fontSize: 12, color: "#777", marginBottom: 16 }}>📍 {pred.location}</div>

                  {/* Confidence arc visual */}
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <div style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 80, height: 80, borderRadius: "50%",
                      background: `conic-gradient(${pred.confidence > 80 ? "#ef4444" : pred.confidence > 65 ? "#f97316" : PALETTE.teal} ${pred.confidence * 3.6}deg, #eee 0deg)`,
                    }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: "50%", background: "white",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{ fontWeight: 900, fontSize: 18, color: PALETTE.navy, lineHeight: 1 }}>{pred.confidence}%</div>
                        <div style={{ fontSize: 9, color: "#aaa" }}>confidence</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div style={{ background: `${PALETTE.seafoam}33`, borderRadius: 10, padding: "8px 10px" }}>
                      <div style={{ fontSize: 10, color: "#888" }}>ETA</div>
                      <div style={{ fontWeight: 700, color: PALETTE.navy, fontSize: 13 }}>{pred.timeframe}</div>
                    </div>
                    <div style={{ background: `${PALETTE.seafoam}33`, borderRadius: 10, padding: "8px 10px" }}>
                      <div style={{ fontSize: 10, color: "#888" }}>Conditions</div>
                      <div style={{ fontWeight: 700, color: PALETTE.navy, fontSize: 11 }}>{pred.conditions}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ADMIN PORTAL */}
        {activeTab === "admin" && isAdmin && (
          <DEMSAdmin />
        )}
        
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${PALETTE.seafoam}44`, padding: "12px 28px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 11, color: "#aaa", marginTop: 32,
      }}>
        <span>DEMS v1.0 · Oracle DB + Transactional Processing + Materialized Views</span>
        <span>Incident Mapping: Leaflet.js · Prediction: Random Forest · Backend: Oracle Package Encapsulation</span>
      </footer>
    </div>
  );
}