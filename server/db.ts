import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  database: process.env.PG_DB,
  ssl: {
    rejectUnauthorized: false,
  },
});




pool.on('connect', () => {
  console.log('✅ Connected to Aiven PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL error:', err);
});

export default pool;
