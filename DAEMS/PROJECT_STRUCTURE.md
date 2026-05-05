# Project Structure - DAEMS (Disaster & Emergency Management System)

## Overview
DAEMS is a comprehensive Disaster & Emergency Management System designed for real-time monitoring, resource allocation, and AI-driven incident prediction. This version features a Node.js/Express backend integrated with Oracle 19c.

## Tech Stack
- **Frontend:** React 19, Vite 8
- **Backend:** Node.js, Express.js
- **Database:** Oracle 19c (using `oracledb` driver)
- **Data Ingestion:** `csv-parser` for historical dataset migration

## Directory Structure

```text
DAEMS/
├── public/                 # Static assets
├── src/                    # Frontend source code
│   ├── admin_portal.jsx    # Admin-side CRUD (Backend integrated)
│   ├── App.jsx             # Main dashboard (Backend integrated)
│   └── ...
├── .env.example            # Template for DB credentials
├── load_data.js            # Data migration script (CSV -> Oracle)
├── predict.py              # AI Prediction Engine (Python + Pandas)
├── package.json            # Dependencies (express, oracledb, etc.)
├── PROJECT_STRUCTURE.md    # This file
├── schema.sql              # Oracle 19c schema creation commands
├── server.js               # Express API server
├── Updated Data 1.csv      # Historical disaster dataset
└── vite.config.js          # Vite configuration
```

## Setup Instructions

### 1. Database Initialization
1. Ensure **Oracle 19c** is running.
2. Run the commands in `schema.sql` using SQL*Plus or SQL Developer to create the tables.
3. Create a `.env` file based on `.env.example` and fill in your Oracle credentials.

### 2. Backend & Data Loading
1. Install Node dependencies: `npm install`.
2. Install Python dependencies: `pip install oracledb pandas python-dotenv`.
3. Load the dataset into Oracle: `node load_data.js`.
4. Run the AI Prediction Engine: `python predict.py`.
5. Start the API server: `node server.js`.

### 3. Frontend
1. Start the development server: `npm run dev`.
2. Access the dashboard at the provided Vite URL.

## Key Functionalities
- **Live Dashboard:** Fetches real-time incident data from Oracle.
- **Admin Portal:** Secure access (admin/1234) for managing incidents and resources.
- **AI Predict:** Displays forecasted threats based on historical data patterns.
- **Resource Monitoring:** Real-time stock tracking with automated critical alerts.
