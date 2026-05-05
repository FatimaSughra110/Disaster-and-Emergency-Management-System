require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const oracledb = require('oracledb');

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
        
        // Insert only first 100 for performance in prototype, or all if needed
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
               VALUES (:id, :type, :title, :desc, :sev, :loc, :lat, :lng, TO_DATE(:idate, 'YYYY-MM-DD'), :itime, :res, :vol, :stat)`,
              {
                id: row.ID,
                type: row.Category_title,
                title: row.Title,
                desc: row.Description,
                sev: severity,
                loc: row.Title.split(' ').slice(0, 3).join(' '), // Simple location name
                lat: parseFloat(row.Latitude),
                lng: parseFloat(row.Longitude),
                idate: row.Date,
                itime: row.Time,
                res: resAlloc,
                vol: volAlloc,
                stat: status
              }
            );
          } catch (e) {
            // console.error(`Error inserting row ${row.ID}:`, e.message);
          }
        }
        
        await connection.commit();

        // Seed some volunteers if empty
        const volCheck = await connection.execute('SELECT count(*) as count FROM volunteers');
        if (volCheck.rows[0][0] === 0) {
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
  }
}

loadData();
