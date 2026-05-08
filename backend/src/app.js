const express = require('express');
const cors = require('cors');
const db = require('./db');
const oracledb = require('oracledb');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
require('dotenv').config();

const execPromise = promisify(exec);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Root route for connection testing
app.get('/', (req, res) => {
  res.json({ 
    status: "online", 
    message: "DEMS API Server is running", 
    db_config: {
        user: process.env.DB_USER,
        dsn: process.env.DB_CONNECT_STRING
    }
  });
});

// GET: Incidents
app.get('/api/incidents', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT incident_id as "id", type as "type", severity as "severity", 
              location as "location", latitude as "lat", longitude as "lng", 
              incident_time as "time", resources_allocated as "resources", 
              volunteers_allocated as "volunteers", status as "status" 
       FROM incidents`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database Error", message: err.message });
  }
});

// GET: Volunteers
app.get('/api/volunteers', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT volunteer_id as "id", name as "name", skills as "skills", 
              location_dist as "location", status as "status", avatar_init as "avatar" 
       FROM volunteers ORDER BY volunteer_id DESC`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const volunteers = result.rows.map(v => ({
      ...v,
      skills: v.skills ? v.skills.split(', ') : []
    }));
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ error: "Database Error", message: err.message });
  }
});

// POST: Add Volunteer
app.post('/api/volunteers', async (req, res) => {
  const { name, skills, location } = req.body;
  if (!name || !skills) {
      return res.status(400).json({ error: "Missing required fields: name and skills are required." });
  }
  try {
    const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    await db.execute(
      `INSERT INTO volunteers (name, skills, location_dist, status, avatar_init) 
       VALUES (:v_name, :v_skills, :v_loc, 'available', :v_avatar)`,
      { v_name: name, v_skills: skills, v_loc: location || 'unknown', v_avatar: avatar },
      { autoCommit: true }
    );
    res.json({ success: true, message: "Volunteer added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Database Insertion Error", message: err.message });
  }
});

// DELETE: Volunteer
app.delete('/api/volunteers/:id', async (req, res) => {
  try {
    await db.execute(
      `DELETE FROM volunteers WHERE volunteer_id = :id`,
      { id: req.params.id },
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database Deletion Error", message: err.message });
  }
});

// POST: Deploy Volunteer
app.post('/api/volunteers/deploy', async (req, res) => {
  const { volunteerId, location } = req.body;
  if (!volunteerId || !location) {
      return res.status(400).json({ error: "Missing volunteerId or location" });
  }
  try {
    await db.execute(
      `UPDATE volunteers 
       SET status = 'deployed', location_dist = :v_loc 
       WHERE volunteer_id = :v_id`,
      { v_loc: location, v_id: volunteerId },
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database Update Error", message: err.message });
  }
});

// POST: Clear All Volunteers
app.post('/api/volunteers/clear', async (req, res) => {
  try {
    await db.execute(`DELETE FROM volunteers`, [], { autoCommit: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database Error", message: err.message });
  }
});

// GET: Resources
app.get('/api/resources', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT name as "name", current_stock as "current", max_stock as "max", 
              unit as "unit", critical_threshold as "critical" 
       FROM resources`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database Error", message: err.message });
  }
});

// POST: Update Resource Stock
app.post('/api/resources/update', async (req, res) => {
  const { name, change } = req.body;
  try {
    await db.execute(
      `UPDATE resources 
       SET current_stock = GREATEST(0, LEAST(max_stock, current_stock + :v_change)) 
       WHERE name = :v_name`,
      { v_name: name, v_change: change },
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database Error", message: err.message });
  }
});

// GET: Predictions
app.get('/api/predictions', async (req, res) => {
  try {
    const result = await db.execute(
      `SELECT prediction_id as "id", confidence as "confidence", type as "type", 
              timeframe as "timeframe", conditions as "conditions", 
              location as "location", severity as "severity",
              latitude as "lat", longitude as "lng" 
       FROM predictions`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Database Error", message: err.message });
  }
});

// POST: Run AI Prediction Engine
app.post('/api/predict/run', async (req, res) => {
  try {
    // We use an absolute path for reliability
    const scriptPath = path.resolve(__dirname, '../../DAEMS/predict.py');
    console.log('Executing AI Engine at:', scriptPath);
    
    const { stdout, stderr } = await execPromise(`python "${scriptPath}"`);
    console.log('AI Engine Output:', stdout);
    
    if (stderr) console.error('AI Engine Stderr:', stderr);
    res.json({ success: true, message: "AI engine executed successfully", output: stdout });
  } catch (err) {
    console.error('Exec Error:', err);
    res.status(500).json({ error: "AI Engine Execution Error", message: err.message });
  }
});

// POST: Admin Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.execute(
      `SELECT * FROM users WHERE username = :uname AND password = :pword`,
      { uname: username, pword: password },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length > 0) {
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: "Login Error", message: err.message });
  }
});

// Admin Incident Management (Manual Add)
app.post('/api/incidents', async (req, res) => {
  const { type, severity, location, lat, lng, time, status } = req.body;
  try {
    const id = 'MANUAL_' + Date.now();
    await db.execute(
      `INSERT INTO incidents (incident_id, type, severity, location, latitude, longitude, incident_time, status) 
       VALUES (:v_id, :v_type, :v_severity, :v_loc, :v_lat, :v_lng, :v_time, :v_status)`,
      { v_id: id, v_type: type, v_severity: severity, v_loc: location, v_lat: lat, v_lng: lng, v_time: time, v_status: status },
      { autoCommit: true }
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: "Database Error", message: err.message });
  }
});

// Admin Incident Delete
app.delete('/api/incidents/:id', async (req, res) => {
  try {
    await db.execute(
      `DELETE FROM incidents WHERE incident_id = :id`,
      { id: req.params.id },
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database Error", message: err.message });
  }
});

// Final Error Handling - Always JSON
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found", path: req.path });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// Initialize and Start
db.initializePool().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 DEMS API Backend is now LIVE on port ${PORT}`);
    console.log(`🔗 Test connection at: http://localhost:${PORT}/api/volunteers\n`);
  });
}).catch(err => {
  console.error('FATAL: Could not initialize database pool:', err);
  process.exit(1);
});
