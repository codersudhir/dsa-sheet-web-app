import pool from './db';

export async function initializeDatabase() {
  const client = await pool.connect();

  try {
    console.log('🔄 Initializing database...');
    await client.query('BEGIN');

    /* ===================== USERS ===================== */
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ===================== TOPICS ===================== */
    await client.query(`
      CREATE TABLE IF NOT EXISTS topics (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ===================== PROBLEMS ===================== */
    await client.query(`
      CREATE TABLE IF NOT EXISTS problems (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        difficulty VARCHAR(50) CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
        leetcode_link TEXT,
        codeforces_link TEXT,
        youtube_link TEXT,
        article_link TEXT,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ===================== USER PROGRESS ===================== */
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        problem_id INTEGER REFERENCES problems(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, problem_id)
      );
    `);

    /* ===================== INDEXES ===================== */
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_topics_order 
      ON topics(order_index);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_problems_topic 
      ON problems(topic_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_progress_user 
      ON user_progress(user_id);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_progress_problem 
      ON user_progress(problem_id);
    `);

    await client.query('COMMIT');
    console.log('✅ Database schema initialized');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database initialization failed:', err);
    throw err;
  } finally {
    client.release();
  }
}

/* ===================== SEED DATABASE ===================== */

export async function seedDatabase() {
  const client = await pool.connect();

  try {
    const { rows } = await client.query(`SELECT COUNT(*) FROM topics`);
    if (Number(rows[0].count) > 0) {
      console.log('ℹ️ Database already seeded');
      return;
    }

    await client.query('BEGIN');

    const topics = [
      ['Arrays', 'Fundamental data structure', 1],
      ['Strings', 'Character manipulation', 2],
      ['Linked Lists', 'Node-based structure', 3],
      ['Trees', 'Hierarchical data', 4],
      ['Graphs', 'Connected nodes', 5],
      ['Dynamic Programming', 'Optimization technique', 6],
      ['Sorting & Searching', 'Algorithms', 7],
      ['Stack & Queue', 'LIFO / FIFO', 8],
    ];

    for (const t of topics) {
      await client.query(
        `INSERT INTO topics (name, description, order_index)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        t
      );
    }

    console.log('✅ Topics seeded');

    await client.query('COMMIT');
    console.log('✅ Database seeding complete');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err);
    throw err;
  } finally {
    client.release();
  }
}
