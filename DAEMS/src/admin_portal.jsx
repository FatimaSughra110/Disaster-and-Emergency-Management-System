import { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000/api";

const PALETTE = {
  cream: "#F2EFE7",
  seafoam: "#9ACBD0",
  teal: "#48A6A7",
  navy: "#2973B2",
};

// ===== SIMPLE INPUT COMPONENT =====
function Input({ label, value, onChange, type = "text" }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #ddd", width: "100%" }}
      />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: "white", padding: 16, borderRadius: 12, marginBottom: 20 }}>
      <h3 style={{ marginBottom: 12, color: PALETTE.navy }}>{title}</h3>
      {children}
    </div>
  );
}

export default function DEMSAdmin() {
  const [tab, setTab] = useState("admin");

  // ===== STATE =====
  const [incidents, setIncidents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [resources, setResources] = useState([]);

  // ===== FORMS =====
  const [vForm, setVForm] = useState({ name: "", skills: "", location: "", status: "available" });
  const [rForm, setRForm] = useState({ name: "", current: "", max: "", unit: "" });
  const [iForm, setIForm] = useState({ type: "", severity: "medium", location: "", time: "", status: "active", lat: 0, lng: 0 });

  const fetchData = async () => {
    try {
      const [incRes, volRes, resRes] = await Promise.all([
        fetch(`${API_BASE}/incidents`),
        fetch(`${API_BASE}/volunteers`),
        fetch(`${API_BASE}/resources`)
      ]);
      setIncidents(await incRes.json());
      setVolunteers(await volRes.json());
      setResources(await resRes.json());
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ===== CRUD HELPERS =====

  // Volunteers
  const addVolunteer = async () => {
    // Implement POST /api/volunteers if needed, for now just local or mock
    alert("Volunteer addition would be implemented here in a full system.");
  };

  const deleteVolunteer = (id) => {
      // Implement DELETE /api/volunteers/:id
      alert("Delete volunteer: " + id);
  };

  // Resources
  const addResource = () => {
      alert("Add resource would be implemented here.");
  };

  const deleteResource = (id) => {
      alert("Delete resource: " + id);
  };

  // Incidents
  const addIncident = async () => {
    try {
        const res = await fetch(`${API_BASE}/incidents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(iForm)
        });
        if (res.ok) {
            fetchData();
            setIForm({ type: "", severity: "medium", location: "", time: "", status: "active", lat: 0, lng: 0 });
            alert("Incident added successfully!");
        }
    } catch (err) {
        alert("Error adding incident: " + err.message);
    }
  };

  const deleteIncident = async (id) => {
    try {
        const res = await fetch(`${API_BASE}/incidents/${id}`, {
            method: "DELETE"
        });
        if (res.ok) {
            fetchData();
        }
    } catch (err) {
        alert("Error deleting incident: " + err.message);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", background: PALETTE.cream, minHeight: "100vh", padding: 20 }}>

      {/* NAV */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { id: "admin", label: "Admin Portal" },
          { id: "incidents", label: "Incidents" },
          { id: "volunteers", label: "Volunteers" },
          { id: "resources", label: "Resources" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "none",
            background: tab === t.id ? PALETTE.navy : "#ddd",
            color: tab === t.id ? "white" : "black",
            cursor: "pointer"
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ADMIN DASHBOARD */}
      {tab === "admin" && (
        <div>

          <Section title="Add Volunteer">
            <Input label="Name" value={vForm.name} onChange={v => setVForm({ ...vForm, name: v })} />
            <Input label="Skills" value={vForm.skills} onChange={v => setVForm({ ...vForm, skills: v })} />
            <Input label="Location" value={vForm.location} onChange={v => setVForm({ ...vForm, location: v })} />
            <button onClick={addVolunteer}>Add Volunteer</button>
          </Section>

          <Section title="Add Resource">
            <Input label="Name" value={rForm.name} onChange={v => setRForm({ ...rForm, name: v })} />
            <Input label="Current" value={rForm.current} onChange={v => setRForm({ ...rForm, current: v })} />
            <Input label="Max" value={rForm.max} onChange={v => setRForm({ ...rForm, max: v })} />
            <Input label="Unit" value={rForm.unit} onChange={v => setRForm({ ...rForm, unit: v })} />
            <button onClick={addResource}>Add Resource</button>
          </Section>

          <Section title="Add Incident">
            <Input label="Type" value={iForm.type} onChange={v => setIForm({ ...iForm, type: v })} />
            <Input label="Severity (critical, high, medium, low)" value={iForm.severity} onChange={v => setIForm({ ...iForm, severity: v })} />
            <Input label="Location" value={iForm.location} onChange={v => setIForm({ ...iForm, location: v })} />
            <Input label="Latitude" value={iForm.lat} type="number" onChange={v => setIForm({ ...iForm, lat: parseFloat(v) })} />
            <Input label="Longitude" value={iForm.lng} type="number" onChange={v => setIForm({ ...iForm, lng: parseFloat(v) })} />
            <Input label="Time" value={iForm.time} onChange={v => setIForm({ ...iForm, time: v })} />
            <button onClick={addIncident}>Add Incident</button>
          </Section>

        </div>
      )}

      {/* INCIDENTS */}
      {tab === "incidents" && (
        <Section title="Incident Records">
          {incidents.map(i => (
            <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: 10, borderBottom: "1px solid #eee" }}>
              <span>{i.type} - {i.location}</span>
              <button onClick={() => deleteIncident(i.id)}>Delete</button>
            </div>
          ))}
        </Section>
      )}

      {/* VOLUNTEERS */}
      {tab === "volunteers" && (
        <Section title="Volunteer Records">
          {volunteers.map(v => (
            <div key={v.id} style={{ display: "flex", justifyContent: "space-between", padding: 10, borderBottom: "1px solid #eee" }}>
              <span>{v.name} - {v.skills}</span>
              <button onClick={() => deleteVolunteer(v.id)}>Delete</button>
            </div>
          ))}
        </Section>
      )}

      {/* RESOURCES */}
      {tab === "resources" && (
        <Section title="Resource Records">
          {resources.map(r => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: 10, borderBottom: "1px solid #eee" }}>
              <span>{r.name} ({r.current}/{r.max} {r.unit})</span>
              <button onClick={() => deleteResource(r.id)}>Delete</button>
            </div>
          ))}
        </Section>
      )}

    </div>
  );
}
