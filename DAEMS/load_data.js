import 'dotenv/config';
import fs from 'fs';
import csv from 'csv-parser';
import oracledb from 'oracledb';

const dbConfig = {
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || '1234',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/xe'
};

const severities = ['critical', 'high', 'medium', 'low'];
const statuses = ['active', 'contained', 'monitoring'];

async function loadData() {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    console.log('Clearing old incidents...');
    await connection.execute('DELETE FROM incidents');
    
    const results = [];
    fs.createReadStream('Updated Data 1.csv')
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`Parsed ${results.length} rows. Inserting into Oracle...`);
        
        const limit = 500; 
        for (let i = 0; i < Math.min(results.length, limit); i++) {
          const row = results[i];
          const severity = severities[Math.floor(Math.random() * severities.length)];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const volAlloc = Math.floor(Math.random() * 15);
          const resAlloc = Math.floor(Math.random() * 10);

          try {
            await connection.execute(
              `INSERT INTO incidents (incident_id, type, title, description, severity, location, latitude, longitude, incident_date, incident_time, resources_allocated, volunteers_allocated, status) 
               VALUES (:v_id, :v_type, :v_title, :v_desc, :v_sev, :v_loc, :v_lat, :v_lng, TO_DATE(:v_idate, 'YYYY-MM-DD'), :v_itime, :v_res, :v_vol, :v_stat)`,
              {
                v_id: row.ID,
                v_type: row.Category_title,
                v_title: row.Title,
                v_desc: row.Description,
                v_sev: severity,
                v_loc: row.Title.split(' ').slice(0, 3).join(' '), 
                v_lat: parseFloat(row.Latitude),
                v_lng: parseFloat(row.Longitude),
                v_idate: row.Date,
                v_itime: row.Time,
                v_res: resAlloc,
                v_vol: volAlloc,
                v_stat: status
              }
            );
          } catch (e) {
            console.error(`Error inserting row ${row.ID}:`, e.message);
          }
        }
        
        await connection.commit();

        const volCheck = await connection.execute('SELECT count(*) as count FROM volunteers', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const count = volCheck.rows[0].COUNT;
        
        if (count === 0) {
            console.log('Seeding volunteers...');
            const sampleVols = [
                ['Dr. Ayesha Khan', 'Medical, Triage', '2.1 km', 'available', 'AK'],
                ['Tariq Hassan', 'Heavy Machinery, Search & Rescue', '0.8 km', 'deployed', 'TH'],
                ['Maria Santos', 'Translation, Coordination', '3.4 km', 'available', 'MS'],
                ['Eng. Bilal Raza', 'Structural, Heavy Machinery', '1.2 km', 'available', 'BR'],
                ['Nurse Sana Ali', 'Medical, Pediatrics', '4.7 km', 'deployed', 'SA']
            ];
            for (const v of sampleVols) {
                await connection.execute(
                    'INSERT INTO volunteers (name, skills, location_dist, status, avatar_init) VALUES (:1, :2, :3, :4, :5)',
                    v
                );
            }
        }
        
        await connection.commit();
        console.log('Seeding completed.');
        process.exit(0);
      });
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    // Note: process.exit is called in the stream 'end' event
  }
}

loadData();
