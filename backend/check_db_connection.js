require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false // Required for Supabase/AWS RDS, adjust as needed
  }
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
    process.exit(1); // Exit with error code
    return;
  }
  console.log('Successfully connected to the database!');
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      console.error('Error executing query', err.stack);
      process.exit(1); // Exit with error code
      return;
    }
    console.log('Query successful, current time from DB:', result.rows[0]);
    process.exit(0); // Exit with success code
  });
});
