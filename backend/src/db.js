const oracledb = require('oracledb');
require('dotenv').config();

async function initializePool() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1
    });
    console.log('Oracle connection pool created successfully');
  } catch (err) {
    console.error('Error creating pool:', err);
    process.exit(1);
  }
}

async function execute(sql, binds = [], opts = {}) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(sql, binds, opts);
    return result;
  } catch (err) {
    console.error('Database error:', err);
    throw err;
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

async function simpleQuery(sql, binds = [])
