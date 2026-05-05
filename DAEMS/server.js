require('dotenv').config();
const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || '1234',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/xe'
};

// Test Connection
async function checkConnection() {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    console.log('Successfully connected to Oracle Database');
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

// Routes
app.get('/api/incidents', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT incident_id as "id", type as "type", severity as "severity", 
              location as "location", latitude as "lat", longitude as "lng", 
              incident_time as "time", resources_allocated as "resources", 
              volunteers_allocated as "volunteers", status as "status" 
       FROM incidents`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.get('/api/volunteers', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT volunteer_id as "id", name as "name", skills as "skills", 
              location_dist as "location", status as "status", avatar_init as "avatar" 
       FROM volunteers`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    // Skills are stored as comma-separated string in DB, but frontend expects array
    const volunteers = result.rows.map(v => ({
      ...v,
      skills: v.skills ? v.skills.split(', ') : []
    }));
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.get('/api/resources', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT name as "name", current_stock as "current", max_stock as "max", 
              unit as "unit", critical_threshold as "critical" 
       FROM resources`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.get('/api/predictions', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT prediction_id as "id", confidence as "confidence", type as "type", 
              timeframe as "timeframe", conditions as "conditions", 
              location as "location", severity as "severity" 
       FROM predictions`,
      [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT * FROM users WHERE username = :user AND password = :pass`,
      { user: username, pass: password },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    if (result.rows.length > 0) {
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// Admin CRUD operations
app.post('/api/incidents', async (req, res) => {
  const { type, severity, location, lat, lng, time, status } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const id = 'MANUAL_' + Date.now();
    await connection.execute(
      `INSERT INTO incidents (incident_id, type, severity, location, latitude, longitude, incident_time, status) 
       VALUES (:id, :type, :severity, :loc, :lat, :lng, :time, :status)`,
      { id, type, severity, loc: location, lat, lng, time, status },
      { autoCommit: true }
    );
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

app.delete('/api/incidents/:id', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      `DELETE FROM incidents WHERE incident_id = :id`,
      { id: req.params.id },
      { autoCommit: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  checkConnection();
});
