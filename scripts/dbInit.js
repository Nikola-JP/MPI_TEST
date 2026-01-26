const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config();

async function run() {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASS;
  const database = process.env.DB_NAME;
  const port = Number(process.env.DB_PORT || 3306);

  if (!host || !user || !database) {
    throw new Error('Missing DB_HOST, DB_USER, or DB_NAME in .env');
  }

  const sqlPath = path.join(__dirname, 'init_db.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const connection = await mysql.createConnection({
    host,
    user,
    password,
    database,
    port,
    multipleStatements: true
  });

  try {
    await connection.query(sql);
    console.log('Database initialization complete');
  } finally {
    await connection.end();
  }
}

run().catch((error) => {
  console.error('Database initialization failed');
  process.exitCode = 1;
});
