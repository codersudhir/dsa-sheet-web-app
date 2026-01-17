import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './db';
import { initializeDatabase, seedDatabase } from './init-db';

dotenv.config();

const app = express();
const PORT = 5000;

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET missing');
}

const JWT_SECRET = process.env.JWT_SECRET;

/* ✅ FIXED CORS */
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

interface AuthRequest extends express.Request {
  userId?: number;
}

/* ---------------- AUTH ROUTES ---------------- */

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const exists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hash = await bcryptjs.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hash]
    );

    const token = jwt.sign(
      { userId: result.rows[0].id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      user: result.rows[0],
      token
    });

  } catch (err) {
    console.error('REGISTER ERROR:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

/* ---------------- LOGIN ---------------- */

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const match = await bcryptjs.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      user: { id: user.id, email: user.email },
      token
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

/* ---------------- SERVER START ---------------- */


app.listen(PORT, async() => {

  console.log('🔄 Connecting DB...');
  await pool.query('SELECT 1');

  console.log('📦 Initializing schema...');
  await initializeDatabase();
  await seedDatabase();

  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

