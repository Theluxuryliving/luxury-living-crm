// netlify/functions/insert_activity.js

const { Client } = require("pg");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  const data = JSON.parse(event.body || "{}");

  // Destructure the fields expected from followups.html
  const {
    _id,
    leadId,
    agent,
    type,
    date,
    followUpDate,
    status,
    notes
  } = data;

  if (!_id || !leadId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields (_id, leadId)" }),
    };
  }

  // Initialize PostgreSQL client
  const client = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS crm_followups (
        _id TEXT PRIMARY KEY,
        lead_id TEXT,
        agent TEXT,
        type TEXT,
        date DATE,
        follow_up_date DATE,
        status TEXT,
        notes TEXT
      );
    `);

    await client.query(`
      INSERT INTO crm_followups (_id, lead_id, agent, type, date, follow_up_date, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (_id)
      DO UPDATE SET
        type = $4,
        date = $5,
        follow_up_date = $6,
        status = $7,
        notes = $8;
    `, [_id, leadId, agent, type, date, followUpDate, status, notes]);

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };

  } catch (err) {
    console.error("Insert activity error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};

