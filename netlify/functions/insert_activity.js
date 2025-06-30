const { Client } = require("pg");

exports.handler = async function (event) {
  console.log("🔔 insert_activity function triggered");

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
    console.log("📦 Received data:", data);
  } catch (parseError) {
    console.error("❌ JSON Parse Error:", parseError);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON body" })
    };
  }

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

  const client = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("✅ Connected to Neon");

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
    console.log("🛠️ Table ensured");

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

    console.log("✅ Data inserted/updated successfully");

    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    console.error("❌ Insert activity error:", err.stack || err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.stack || err.message })
    };
  }
};
