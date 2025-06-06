const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Create reports table if it doesn't exist
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        country VARCHAR(100) NOT NULL,
        organization VARCHAR(100) NOT NULL,
        keywords TEXT[] NOT NULL,
        request_payload JSONB NOT NULL,
        response_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Save report data
const saveReport = async (country, organization, keywords, requestPayload, responseData) => {
  try {
    const result = await pool.query(
      `INSERT INTO reports (country, organization, keywords, request_payload, response_data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [country, organization, keywords, requestPayload, responseData]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error saving report:', error);
    throw error;
  }
};

module.exports = {
  pool,
  initDatabase,
  saveReport
}; 