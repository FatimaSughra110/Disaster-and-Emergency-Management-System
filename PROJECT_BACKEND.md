# Disaster & Emergency Management System (DEMS) - Backend

## 🎯 Project Overview

**DEMS** is a comprehensive **Disaster & Emergency Management System** designed for real-time coordination of emergency responses in urban areas (specifically Karachi regions). It bridges responders, resources, and incidents through a modern full-stack architecture.

### Core Entities (from provided Oracle Schema)
```
1. Responders (Object-Oriented Types + Volunteers table)
   ├── t_responder (Base: ID, Name, Phone, Location, Status, Vetted)
   ├── t_medical_responder (License, Specialisation, Blood Bank Cert)
   ├── t_fire_responder (Hazmat, Rescue Diving, Ladder Rating)
   └── t_heavy_responder (Machinery Class, Operator Cert)

2. Incidents (Partitioned by Region)
   ├── Types: Flood, Fire, Earthquake, Medical Emergency, etc.
   ├── Severity: Critical/High/Moderate/Low
   ├── Status: Active/Responding/Resolved/Predicted
   └── Partitioned: Central/East/West/South/North Karachi

3. Resources (Medical/Equipment/Vehicles/Supplies)
   ├── Real-time inventory tracking
   ├── Critical stock alerts (<20% availability)

4. Assignments (Volunteer ↔ Incident)
5. Audit Trail (Commander actions)
6. Materialized Views (Dashboards: Resource Summary, Incident Heatmap, Volunteer Readiness)
```

## 🛠️ Technology Stack

```
Database: Oracle 19c (Object-Relational with Inheritance)
Backend: Node.js + Express.js (Plain JavaScript - no TypeScript)
Database Driver: oracledb (direct SQL queries)
Authentication: Basic JWT (simple login/register)
API: Simple RESTful endpoints
No validation/logging/Swagger/testing overhead
Simple & functional focus
```

## 🏗️ Architecture

```
Frontend (React/Vite) ↔ API Gateway (Express) ↔ Oracle DB
                           ↓
                    Real-time (Socket.io)
                           ↓
                 Materialized Views (Dashboards)
```

**Key Features:**
- ✅ Real-time incident tracking & resource allocation
- ✅ Responder matching (skills → incident needs)
- ✅ Geographic partitioning (Karachi regions)
- ✅ Inventory management with critical alerts
- ✅ Commander audit trail
- ✅ Predictive incident markers
- ✅ Dashboard MVs (refreshed every 15min)

## 📁 Proposed File Structure

```
backend/
├── src/
│   ├── config/          # DB, JWT, Oracle connection
│   │   ├── database.ts
│   │   └── oracle-pool.ts
│   ├── controllers/     # Business logic
│   │   ├── incidents.ts
│   │   ├── volunteers.ts
│   │   ├── resources.ts
│   │   └── assignments.ts
│   ├── routes/          # Express routes
│   │   ├── incidents.js
│   │   ├── volunteers.js
│   │   ├── resources.js
│   │   └── dashboard.js
│   ├── middleware/      # Simple auth only
│   │   └── auth.js
│   └── app.js           # Express setup
├── migrations/          # Oracle DDL scripts
│   └── 01_schema_ddl.sql (provided)
├── package.json
├── .env                 # DB credentials
└── README.md
```

## 🚀 Key API Endpoints

```
Core APIs (Simple REST):

Auth:
POST /api/auth/login
POST /api/auth/register

Incidents:
GET  /api/incidents
POST /api/incidents
PUT  /api/incidents/:id
DELETE /api/incidents/:id
GET  /api/incidents/:id/heatmap

Volunteers:
GET  /api/volunteers
POST /api/volunteers
PUT  /api/volunteers/:id
DELETE /api/volunteers/:id
POST /api/assignments

Resources:
GET  /api/resources
POST /api/resources
PUT  /api/resources/:id
GET  /api/resources/summary

Dashboards:
GET /api/dashboard/resources
GET /api/dashboard/volunteers  
GET /api/dashboard/heatmap
```

## 📋 Implementation Plan

### Simplified Implementation Plan

**Phase 1: Basic Setup**
- [ ] Create backend/ directory + package.json (express, oracledb, jsonwebtoken, cors, dotenv)
- [ ] Simple Oracle 19c connection (db.js)
- [ ] Copy schema to migrations/01_schema_ddl.sql

**Phase 2: Core CRUD APIs**
- [ ] Incidents: GET/POST/PUT/DELETE (/api/incidents)
- [ ] Volunteers: GET/POST/PUT/DELETE (/api/volunteers)
- [ ] Resources: GET/POST/PUT + summary (/api/resources)
- [ ] Assignments: POST (/api/assignments)

**Phase 3: Dashboards**
- [ ] Materialized Views queries (/api/dashboard/*)

**Phase 4: Simple Auth & Frontend Connect**
- [ ] Basic JWT login/register (/api/auth)
- [ ] CORS setup for DAEMS/ frontend
- [ ] Test endpoints work with frontend

## 🔗 Database Prerequisites

**Oracle 19c Setup:**
1. Create user: `CREATE USER dems_backend IDENTIFIED BY password;`
2. Run `migrations/01_schema_ddl.sql` as SYS or privileged user
3. Grant:
```sql
GRANT CREATE SESSION TO dems_backend;
GRANT SELECT, INSERT, UPDATE, DELETE ON volunteers, incidents, resources, 
    volunteer_assignments, audit_log, mv_* TO dems_backend;
```

## 🚀 Quick Start

```bash
# 1. Deploy schema in Oracle 19c (SQL Developer/SQL*Plus)
# 2. Update .env with DB credentials
cd backend
npm install
npm run dev         # http://localhost:3001
```

---

**Approve this plan to proceed with backend creation!** 🎯
