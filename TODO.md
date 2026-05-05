# DEMS Backend - Implementation TODO

## Information Gathered
- **Database Schema**: Complete Oracle 19c DDL provided (OO types, partitioned incidents, MVs for dashboards)
- **Frontend**: React/Vite app in `DAEMS/` ready for API integration
- **Requirements**: Simple Express backend with CRUD for core entities + dashboard MVs + basic JWT auth
- **No extras**: Skip validation/logging/Swagger/testing/Docker/complexity

## Detailed Plan (4 Phases)

### Phase 1: Basic Setup [ ]
- [ ] Create `backend/` directory structure
- [ ] `package.json` (express, oracledb, jsonwebtoken, cors, dotenv, nodemon)
- [ ] `db.js` - Simple Oracle 19c connection pool
- [ ] `.env` template for DB credentials
- [ ] `migrations/01_schema_ddl.sql` (copy provided schema)
- [ ] `src/app.js` - Basic Express server + CORS

### Phase 2: Core CRUD APIs [ ]
- [ ] `src/routes/incidents.js` - GET/POST/PUT/DELETE incidents
- [ ] `src/routes/volunteers.js` - GET/POST/PUT/DELETE volunteers  
- [ ] `src/routes/resources.js` - GET/POST/PUT + summary
- [ ] `src/routes/assignments.js` - POST assignments
- [ ] Mount routes in app.js

### Phase 3: Dashboards [ ]
- [ ] `src/routes/dashboard.js` - Query MVs (resources/volunteers/heatmap)
- [ ] Test MV refresh works

### Phase 4: Auth & Frontend Integration [ ]
- [ ] `src/middleware/auth.js` - Simple JWT middleware
- [ ] `src/routes/auth.js` - POST /login /register (use volunteers table)
- [ ] Update DAEMS/ frontend API calls to `http://localhost:3001`
- [ ] Final testing

## Dependent Files
- `migrations/01_schema_ddl.sql` - Must be deployed to Oracle 19c first
- Frontend files in `DAEMS/` for API endpoint updates (Phase 4)

## Followup Steps After Backend Complete
1. User deploys schema to Oracle 19c (`dems_backend` user)
2. `npm install && npm run dev` in backend/
3. Test endpoints: `curl http://localhost:3001/api/incidents`
4. Update frontend to consume backend APIs
5. Production: PM2/nginx + Oracle connection string

## Next Immediate Step
**Phase 1: Create backend/ directory + package.json + basic files**

Ready to proceed?
