const { Client } = require('pg');

exports.handler = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const res = await client.query('SELECT * FROM crm_projects ORDER BY created_at DESC');
    await client.end();

    return {
      statusCode: 200,
      body: JSON.stringify(res.rows)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
